import { WorkflowContext } from "@upstash/workflow";
import { FlowNode } from "../../../type";
import { processMentionsProps } from "../../../../../utils/processMentions";
import { generateAiFlowContext } from "../../../../../utils/generateAiFlowContext";
import axios from 'axios';
import { parseJobListings, JobPosting } from './utils/jobParsingUtils';
import { getAnalytics } from "../../../../../utils/analytics";

// Function to generate job search URLs for different job sites
const generateJobSearchUrl = (
    jobSite: string,
    jobTitle: string,
    location?: string
): string | null => {
    const encodedTitle = encodeURIComponent(jobTitle);
    const encodedLocation = location ? encodeURIComponent(location) : '';

    switch (jobSite.toLowerCase()) {
        case 'vuejobs':
        case 'vue-jobs':
            return 'https://vuejobs.com/jobs';

        case 'linkedin':
        case 'linkedin-jobs':
            // LinkedIn Jobs URL format
            let linkedinUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodedTitle}`;
            if (location) {
                linkedinUrl += `&location=${encodedLocation}`;
            }
            linkedinUrl += '&f_TPR=r86400'; // Recent jobs (24 hours)
            return linkedinUrl;

        default:
            return null;
    }
};

// Request timeouts to avoid function timeouts
const REQUEST_TIMEOUT_LINKEDIN_MS = 20000; // 20s
const REQUEST_TIMEOUT_VUEJOBS_MS = 15000;  // 15s

// Duplicate filtering helpers
const normalizeText = (value: string | undefined | null): string => {
    if (!value) return '';
    return String(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

const makeDedupeKey = (job: Partial<JobPosting>): string => {
    return `${normalizeText(job.companyName)}::${normalizeText(job.positionTitle)}`;
};

const filterDuplicates = (jobs: JobPosting[], existing: Array<Partial<JobPosting>> = []): JobPosting[] => {
    const existingKeys = new Set(existing.map(makeDedupeKey));
    const seen = new Set<string>();
    const result: JobPosting[] = [];
    for (const job of jobs) {
        const key = makeDedupeKey(job);
        if (existingKeys.has(key)) continue;
        if (seen.has(key)) continue;
        seen.add(key);
        result.push(job);
    }
    return result;
};

const scrapeJobPostings = async (_context: WorkflowContext, step: FlowNode, previousStepResult: any) => {
    try {
        const analytics = getAnalytics();

        // Process all string fields in propsData first
        const processedProps = processMentionsProps(step.propsData, previousStepResult);

        const { processedPropsWithAiContext } = await generateAiFlowContext(step, processedProps);

        const {
            jobSite,
            jobTitle,
            location,
            jobLimit,
            dataContext,
            existingJobs
        } = processedPropsWithAiContext;

        // Validate required fields
        if (!jobSite) {
            return {
                success: false,
                error: 'Job site selection is required'
            };
        }

        // VueJobs doesn't require a job title since it shows all Vue.js jobs
        if (!jobTitle && !jobSite.toLowerCase().includes('vuejobs')) {
            return {
                success: false,
                error: 'Job title is required for this job site'
            };
        }

        // Generate job search URL based on the selected job site
        const jobSearchUrl = generateJobSearchUrl(jobSite, jobTitle, location);

        if (!jobSearchUrl) {
            return {
                success: false,
                error: `Unsupported job site: ${jobSite}`
            };
        }


        // Track job scraping start
        analytics.trackJobScrapingEvent('SCRAPE_STARTED', {
            job_site: jobSite,
            job_title: jobTitle,
            location: location,
            job_limit: jobLimit,
            search_url: jobSearchUrl
        });

        // Choose API endpoint and method based on job site
        let response: any;
        try {
            if (jobSite.toLowerCase().includes('linkedin')) {
                // Parse and validate job limit for LinkedIn (max 50)
                const linkedInJobLimit = Math.min(parseInt(jobLimit) || 20, 50);
                const maxPages = Math.ceil(linkedInJobLimit / 25); // LinkedIn typically shows 25 jobs per page

                // Use specialized LinkedIn API with GET method
                response = await axios.get('https://api.goalmatic.io/scrape-linkedin-jobs', {
                    params: {
                        keywords: jobTitle || 'software engineer', // Default if no title provided
                        location: location || 'United States',
                        maxJobs: linkedInJobLimit.toString(),
                        maxPages: maxPages.toString()
                    },
                    timeout: REQUEST_TIMEOUT_LINKEDIN_MS
                });
            } else if (jobSite.toLowerCase().includes('vuejobs')) {
                // Use stealth scraper for VueJobs - no job title needed
                response = await axios.post('https://api.goalmatic.io/scrape-stealth', {
                    url: jobSearchUrl,
                    options: {
                        extractMethod: 'html',
                        includeLinks: false,
                        includeImages: false,
                        timeout: REQUEST_TIMEOUT_VUEJOBS_MS
                    }
                }, {
                    timeout: REQUEST_TIMEOUT_VUEJOBS_MS,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                return {
                    success: false,
                    error: `Currently only LinkedIn and VueJobs are supported. Selected: ${jobSite}`,
                    supportedSites: ['linkedin', 'vuejobs']
                };
            }
        } catch (error: any) {
            let errorMessage = 'Request failed';

            if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
                errorMessage = `Scraping timeout for ${jobSite}. This site may have anti-scraping measures or be temporarily unavailable.`;
            } else if (error.response?.status === 403 || error.response?.status === 429) {
                errorMessage = `Access denied by ${jobSite}. This site has anti-scraping measures in place.`;
            } else if (error.response?.status >= 500) {
                errorMessage = `${jobSite} server error. The site may be temporarily down.`;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            return {
                success: false,
                error: `Scraper API error: ${errorMessage}`,
                supportedSites: ['linkedin', 'vuejobs']
            };
        }

        const data = response.data;

        if (!data.success) {
            return {
                success: false,
                error: `Scraper API error: ${data.error || 'Unknown error'}`,
                supportedSites: ['linkedin', 'vuejobs']
            };
        }

        // Handle different response structures based on API endpoint
        let jobPostings: JobPosting[] = [];
        let scrapedContent = '';

        let links: any[] = [];


        if (jobSite.toLowerCase().includes('linkedin')) {
            const linkedInJobs = data.data?.jobs || [];

            scrapedContent = `Found ${linkedInJobs.length} LinkedIn jobs for "${jobTitle}"`;

            const linkedInJobLimit = Math.min(parseInt(jobLimit) || 20, 50);
            const limitedLinkedInJobs = linkedInJobs.slice(0, linkedInJobLimit);

            jobPostings = limitedLinkedInJobs.map((job: any) => ({
                companyName: job.company || 'Company not specified',
                positionTitle: job.title || jobTitle,
                jobLocation: job.location || 'Location not specified',
                salary: job.salary && job.salary !== 'N/A' ? job.salary : undefined,
                timePosted: job.postedTime || undefined,
                jobLink: job.link || `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(jobTitle)}`,
                jobDescription: job.description || `${job.title} position at ${job.company}`,
                employmentType: 'Full-time',
                experienceLevel: job.title?.toLowerCase().includes('senior') ? 'Senior' :
                               job.title?.toLowerCase().includes('junior') ? 'Junior' :
                               job.title?.toLowerCase().includes('lead') || job.title?.toLowerCase().includes('principal') ? 'Senior' : undefined
            }));

        
        } else {
            scrapedContent = data.data?.content || data.data?.text || data.content || data.text || '';
            links = data.data?.links || [];

            if (!scrapedContent) {
                return {
                    success: true,
                    payload: {
                        ...processedPropsWithAiContext,
                        jobPostings: [],
                        totalJobs: 0,
                        scrapedContent: '',
                        message: 'No content could be scraped from the job search URL'
                    }
                };
            }

            const allJobs = parseJobListings(scrapedContent, links, jobSite, jobTitle) || [];
            const vueJobsLimit = Math.min(parseInt(jobLimit) || 20, 100);
            jobPostings = allJobs.slice(0, vueJobsLimit);
        }

        // Filter out duplicates vs provided context (company + title)
        let existingList: Array<Partial<JobPosting>> = [];
        if (Array.isArray(existingJobs)) existingList = existingJobs as Array<Partial<JobPosting>>;
        else if (Array.isArray(dataContext)) existingList = dataContext as Array<Partial<JobPosting>>;

        const uniqueJobPostings = filterDuplicates(jobPostings, existingList);

        return {
            success: true,
            payload: {
                ...processedPropsWithAiContext,
                jobPostings: uniqueJobPostings,
                totalJobs: uniqueJobPostings.length,
                scrapedFrom: jobSite,
                scrapedUrl: jobSearchUrl,
            }
        };

    } catch (error: any) {
        console.error('Error scraping job postings:', error);
        return {
            success: false,
            error: error?.message || 'Failed to scrape job postings'
        };
    }
};

export const jobScraperNode = {
    nodeId: 'JOB_POSTING_SCRAPER',
    run: scrapeJobPostings
};


