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
    location?: string,
    options?: { timePostedParam?: string }
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
            const timePostedParam = options?.timePostedParam || 'r86400';
            linkedinUrl += `&f_TPR=${encodeURIComponent(timePostedParam)}`; // Default 24h
            return linkedinUrl;

        default:
            return null;
    }
};
// Normalize a variety of inputs into LinkedIn f_TPR value (e.g. 'r86400')
const normalizeLinkedInTimePosted = (input: any): string => {
    if (input == null) return 'r86400';
    const raw = String(input).trim().toLowerCase();
    if (/^r\d+$/.test(raw)) return raw; // already in correct form
    // Recognize common human-friendly inputs
    if (raw === '24h' || raw === '24hr' || raw === '24hrs' || raw === 'day' || raw === '1d') return 'r86400';
    if (raw === 'week' || raw === '7d') return 'r604800';
    if (raw === 'month' || raw === '30d') return 'r2592000';
    // Numeric hours
    const hours = Number(raw);
    if (!Number.isNaN(hours) && hours > 0) {
        const seconds = Math.round(hours * 3600);
        return `r${seconds}`;
    }
    return 'r86400';
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
            timePosted, // optional prop controlling LinkedIn time filter
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

        // Compute LinkedIn time filter and generate job search URL
        const timePostedParam = jobSite.toLowerCase().includes('linkedin')
            ? normalizeLinkedInTimePosted(timePosted)
            : undefined;

        // Generate job search URL based on the selected job site
        const jobSearchUrl = generateJobSearchUrl(jobSite, jobTitle, location, { timePostedParam });

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
                // Use stealth scraper for LinkedIn and parse locally (single page)
                response = await axios.post('https://api.goalmatic.io/scrape-stealth', {
                    url: jobSearchUrl,
                    options: {
                        extractMethod: 'html',
                        includeLinks: false,
                        includeImages: false,
                        timeout: REQUEST_TIMEOUT_LINKEDIN_MS
                    }
                }, {
                    timeout: REQUEST_TIMEOUT_LINKEDIN_MS,
                    headers: {
                        'Content-Type': 'application/json'
                    }
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

        // Handle response structure from stealth scraper (HTML/text content)
        let jobPostings: JobPosting[] = [];
        const scrapedContent = data.data?.content || data.data?.html || data.content || data.html || data.data?.text || data.text || '';
        const links: any[] = data.data?.links || [];

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

        // Apply sensible per-site limits
        const defaultLimit = Math.min(parseInt(jobLimit) || 20, jobSite.toLowerCase().includes('linkedin') ? 50 : 100);
        jobPostings = allJobs.slice(0, defaultLimit);

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


