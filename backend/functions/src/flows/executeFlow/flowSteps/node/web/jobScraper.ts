import { WorkflowContext } from "@upstash/workflow";
import { FlowNode } from "../../../type";
import { processMentionsProps } from "../../../../../utils/processMentions";
import { generateAiFlowContext } from "../../../../../utils/generateAiFlowContext";
import axios from 'axios';
import { parseJobListings, JobPosting } from './utils/jobParsingUtils';

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

        case 'remoteok':
        case 'remote-ok':
        case 'remote.ok':
            let remoteOkUrl = 'https://remoteok.io/remote-dev-jobs';
            if (jobTitle.toLowerCase().includes('engineer')) {
                remoteOkUrl = 'https://remoteok.io/remote-engineer-jobs';
            } else if (jobTitle.toLowerCase().includes('developer')) {
                remoteOkUrl = 'https://remoteok.io/remote-dev-jobs';
            } else if (jobTitle.toLowerCase().includes('designer')) {
                remoteOkUrl = 'https://remoteok.io/remote-design-jobs';
            } else if (jobTitle.toLowerCase().includes('marketing')) {
                remoteOkUrl = 'https://remoteok.io/remote-marketing-jobs';
            }
            return remoteOkUrl;

        case 'startup-jobs':
        case 'startupjobs':
        case 'startup.jobs':
            let startupJobsUrl = 'https://startup.jobs/';
            if (jobTitle.toLowerCase().includes('engineer')) {
                startupJobsUrl = 'https://startup.jobs/engineer-jobs';
            } else if (jobTitle.toLowerCase().includes('developer')) {
                startupJobsUrl = 'https://startup.jobs/developer-jobs';
            } else if (jobTitle.toLowerCase().includes('designer')) {
                startupJobsUrl = 'https://startup.jobs/design-jobs';
            } else if (jobTitle.toLowerCase().includes('marketing')) {
                startupJobsUrl = 'https://startup.jobs/marketing-jobs';
            } else if (jobTitle.toLowerCase().includes('manager')) {
                startupJobsUrl = 'https://startup.jobs/manager-jobs';
            }
            return startupJobsUrl;

        case 'linkedin':
        case 'linkedin-jobs':
            // LinkedIn Jobs URL format
            let linkedinUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodedTitle}`;
            if (location) {
                linkedinUrl += `&location=${encodedLocation}`;
            }
            linkedinUrl += '&f_TPR=r86400'; // Recent jobs (24 hours)
            return linkedinUrl;

        case 'vuejobs':
        case 'vue-jobs':
            // VueJobs doesn't need job title in URL - it shows all Vue.js jobs
            return 'https://vuejobs.com/jobs';

        default:
            return null;
    }
};

const scrapeJobPostings = async (_context: WorkflowContext, step: FlowNode, previousStepResult: any) => {
    try {
        // Process all string fields in propsData first
        const processedProps = processMentionsProps(step.propsData, previousStepResult);
        
        const { processedPropsWithAiContext } = await generateAiFlowContext(step, processedProps);
        
        const {
            jobSite,
            jobTitle,
            location,
            dateRange,
            experienceLevel,
            employmentType,
            salaryRange,
            jobLimit
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

        console.log('jobSearchUrl', jobSearchUrl);

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
                    timeout: 60000 // Longer timeout for LinkedIn
                });
            } else if (jobSite.toLowerCase().includes('vuejobs')) {
                // Use stealth scraper for VueJobs - no job title needed
                response = await axios.post('https://api.goalmatic.io/scrape-stealth', {
                    url: jobSearchUrl,
                    options: {
                        extractMethod: 'text',
                        includeLinks: true,
                        includeImages: false,
                        timeout: 45000
                    }
                }, {
                    timeout: 50000,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                // For other sites (not currently supported in this focused implementation)
                return {
                    success: false,
                    error: `Currently only LinkedIn and VueJobs are supported. Selected: ${jobSite}`,
                    supportedSites: ['linkedin', 'vuejobs']
                };
            }
        } catch (error: any) {
            // Enhanced error handling with specific error types
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
                supportedSites: ['linkedin', 'vuejobs'],
                suggestion: jobSite.toLowerCase().includes('linkedin') ?
                    'LinkedIn scraping failed. Please try again or use VueJobs for Vue.js positions.' :
                    jobSite.toLowerCase().includes('vuejobs') ?
                    'VueJobs scraping failed. Please try again or use LinkedIn with a job title.' :
                    'Only LinkedIn and VueJobs are currently supported. Please select one of these options.'
            };
        }

        const data = response.data;
        console.log(data);
        // Handle the new GET API response structure
        if (!data.success) {
            const errorMsg = data.error || 'Unknown error';

            return {
                success: false,
                error: `Scraper API error: ${errorMsg}`,
                supportedSites: ['linkedin', 'vuejobs'],
                recommendedSites: [
                    { name: 'LinkedIn', description: 'Professional network with 20 jobs per search, requires job title' },
                    { name: 'VueJobs', description: 'Vue.js focused jobs, shows all available positions' }
                ]
            };
        }

        // Handle different response structures based on API endpoint
        let jobPostings: JobPosting[] = [];
        let scrapedContent = '';
        let pageTitle = '';
        let links: any[] = [];
        let metadata: any = {};

        if (jobSite.toLowerCase().includes('linkedin')) {
            // LinkedIn API returns structured job data
            const linkedInJobs = data.data?.jobs || [];
            pageTitle = `LinkedIn Jobs - ${jobTitle}`;
            scrapedContent = `Found ${linkedInJobs.length} LinkedIn jobs for "${jobTitle}"`;

            // Convert LinkedIn job format to our JobPosting format and enforce limit
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

            metadata = {
                totalFound: data.data?.totalFound || 0,
                totalScraped: data.data?.totalScraped || 0,
                pagesScraped: data.data?.pagesScraped || 0,
                searchUrl: data.data?.searchUrl || jobSearchUrl
            };
        } else {
            // General scraper returns raw content that needs parsing
            scrapedContent = data.data?.content || data.data?.text || data.content || data.text || '';
            pageTitle = data.data?.title || '';
            links = data.data?.links || [];
            metadata = data.data?.metadata || {};

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

            // Parse the scraped content to extract structured job listings
            const allJobs = parseJobListings(scrapedContent, links, jobSite, jobTitle);

            // Apply job limit for VueJobs (max 100)
            const vueJobsLimit = Math.min(parseInt(jobLimit) || 20, 100);
            jobPostings = allJobs.slice(0, vueJobsLimit);
        }

        // If no jobs were parsed, create a fallback entry with the raw content
        if (jobPostings.length === 0) {
            jobPostings.push({
                companyName: 'Multiple Companies',
                positionTitle: jobTitle,
                jobLocation: location || 'Various Locations',
                salary: salaryRange || undefined,
                timePosted: 'Recently Posted',
                jobLink: jobSearchUrl,
                jobDescription: `Job search results for "${jobTitle}" from ${jobSite}. Raw content available in scrapedContent field.`,
                employmentType: employmentType || undefined,
                experienceLevel: experienceLevel || undefined
            });
        }

        return {
            success: true,
            payload: {
                ...processedPropsWithAiContext,
                jobPostings,
                totalJobs: jobPostings.length,
                requestedLimit: parseInt(jobLimit) || 20,
                actualLimit: jobSite.toLowerCase().includes('linkedin') ?
                    Math.min(parseInt(jobLimit) || 20, 50) :
                    Math.min(parseInt(jobLimit) || 20, 100),
                scrapedFrom: jobSite,
                scrapedUrl: jobSearchUrl,
                scrapedContent: scrapedContent,
                pageTitle: pageTitle,
                links: links,
                metadata: metadata,
                searchCriteria: {
                    jobTitle,
                    location,
                    dateRange,
                    experienceLevel,
                    employmentType,
                    salaryRange,
                    jobLimit: parseInt(jobLimit) || 20
                },
                rawData: data // Include raw scraper response for debugging/advanced use
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


