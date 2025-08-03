import type { FlowNode } from '../../types'

// Validation function for extractor function
const validateExtractorFunction = (value: any): { valid: boolean; message?: string } => {
    // Allow empty values since it's optional
    if (!value || value.trim() === '') {
        return { valid: true }
    }

    try {
        const functionString = value.trim()

        // Check for basic function patterns
        const isFunctionDeclaration = /^function\s*\([^)]*\)\s*\{[\s\S]*\}$/.test(functionString)
        const isArrowFunction = /^\([^)]*\)\s*=>\s*[\s\S]*$/.test(functionString) || /^[a-zA-Z_$][a-zA-Z0-9_$]*\s*=>\s*[\s\S]*$/.test(functionString)

        if (!isFunctionDeclaration && !isArrowFunction) {
            return {
                valid: false,
                message: 'Must be a valid JavaScript function. Example: (content) => { return content.split("\\n")[0]; }'
            }
        }

        // Basic syntax checks
        if (functionString.includes('function') && (!functionString.includes('{') || !functionString.includes('}'))) {
            return {
                valid: false,
                message: 'Function declaration must have opening and closing braces'
            }
        }

        if (functionString.includes('=>') && !functionString.includes('(')) {
            return {
                valid: false,
                message: 'Arrow function must have parameters in parentheses'
            }
        }

        return { valid: true }
    } catch (error) {
        return {
            valid: false,
            message: 'Invalid function format'
        }
    }
}

export const webActionNodes: FlowNode[] = [
    {
        node_id: 'WEB',
        icon: '/icons/globe.svg',
        name: 'Web',
        description: 'Automate web interactions and fetch web content',
        type: 'action',
        provider: 'GOALMATIC',
        category: 'WEB',
        children: [
            {
                node_id: 'WEB_FETCH_CONTENT_EXA',
                type: 'action',
                name: 'Fetch Web Content using Exa',
                description: 'Fetch and extract content from one or more webpages using Exa.ai. For multiple URLs, separate them with commas',
                isTestable: true,
                icon: '/icons/exa.svg',
                props: [
                    {
                        name: 'URL',
                        key: 'url',
                        type: 'text',
                        required: true,
                        description: 'The URL(s) of the webpage(s) to fetch content from. For multiple URLs, separate them with commas',
                        ai_enabled: true,
                        cloneable: true
                    },
                    {
                        name: 'Extractor Function',
                        key: 'extractorFunction',
                        type: 'textarea',
                        required: false,
                        description: 'Optional JavaScript function to extract specific content from each webpage. Function should accept "content" parameter and return extracted content. Example: (content) => { return content.split("\\n")[0]; }',
                        ai_enabled: true,
                        cloneable: true,
                        validate: validateExtractorFunction
                    }
                ],
                expectedOutput: [
                    {
                        name: 'Success',
                        key: 'success',
                        type: 'boolean',
                        description: 'Whether the operation completed successfully'
                    },
                    {
                        name: 'Content',
                        key: 'content',
                        type: 'string',
                        description: 'The combined extracted content from all webpages'
                    },
                    {
                        name: 'Extractor Content',
                        key: 'extractorContent',
                        type: 'string',
                        description: 'Content processed by the extractor function'
                    },
                    {
                        name: 'Extracted Data',
                        key: 'extractedData',
                        type: 'object',
                        description: 'Raw data extracted by the extractor function'
                    },
                    {
                        name: 'Content by URL',
                        key: 'contentByUrl',
                        type: 'object',
                        description: 'Content organized by URL for individual access'
                    },
                    {
                        name: 'URLs',
                        key: 'urls',
                        type: 'array',
                        description: 'Array of processed URLs'
                    },
                    {
                        name: 'Total Results',
                        key: 'totalResults',
                        type: 'number',
                        description: 'Number of URLs successfully processed'
                    }
                ]
            },
            {
                node_id: 'WEB_API_CALL',
                type: 'action',
                name: 'Call Web API',
                description: 'Make HTTP requests to external web APIs with support for different methods, headers, and request bodies',
                isTestable: true,
                icon: '/icons/api.svg',
                props: [
                    {
                        name: 'URL',
                        key: 'url',
                        type: 'text',
                        required: true,
                        description: 'The URL of the API endpoint to call',
                        ai_enabled: true,
                        cloneable: true
                    },
                    {
                        name: 'HTTP Method',
                        key: 'method',
                        type: 'select',
                        required: false,
                        description: 'HTTP method to use for the request',
                        value: 'GET',
                        options: [
                            { label: 'GET', value: 'GET' },
                            { label: 'POST', value: 'POST' },
                            { label: 'PUT', value: 'PUT' },
                            { label: 'PATCH', value: 'PATCH' },
                            { label: 'DELETE', value: 'DELETE' },
                            { label: 'HEAD', value: 'HEAD' },
                            { label: 'OPTIONS', value: 'OPTIONS' }
                        ],
                        cloneable: true
                    },
                    {
                        name: 'Headers',
                        key: 'headers',
                        type: 'textarea',
                        required: false,
                        description: 'Request headers as JSON object. Example: {"Authorization": "Bearer token", "Content-Type": "application/json"}',
                        ai_enabled: true,
                        cloneable: true
                    },
                    {
                        name: 'Request Body',
                        key: 'body',
                        type: 'textarea',
                        required: false,
                        description: 'Request body for POST/PUT/PATCH requests. Can be JSON object or string',
                        ai_enabled: true,
                        cloneable: true
                    },
                    {
                        name: 'Timeout (ms)',
                        key: 'timeout',
                        type: 'number',
                        required: false,
                        description: 'Request timeout in milliseconds',
                        value: 30000,
                        cloneable: true
                    },
                    {
                        name: 'Follow Redirects',
                        key: 'followRedirects',
                        type: 'boolean',
                        required: false,
                        description: 'Whether to follow HTTP redirects',
                        value: true,
                        cloneable: true
                    },
                    {
                        name: 'Response Format',
                        key: 'responseFormat',
                        type: 'select',
                        required: false,
                        description: 'Expected response format',
                        value: 'json',
                        options: [
                            { label: 'JSON', value: 'json' },
                            { label: 'Text', value: 'text' },
                            { label: 'Binary/Blob', value: 'blob' }
                        ],
                        cloneable: true
                    }
                ],
                expectedOutput: [
                    {
                        name: 'Success',
                        key: 'success',
                        type: 'boolean',
                        description: 'Whether the API call completed successfully (HTTP 2xx status)'
                    },
                    {
                        name: 'Response Data',
                        key: 'response.data',
                        type: 'object',
                        description: 'The response data from the API'
                    },
                    {
                        name: 'Response Status',
                        key: 'response.status',
                        type: 'number',
                        description: 'HTTP status code of the response'
                    },
                    {
                        name: 'Response Headers',
                        key: 'response.headers',
                        type: 'object',
                        description: 'Response headers from the API'
                    },
                    {
                        name: 'Response Time',
                        key: 'response.responseTime',
                        type: 'number',
                        description: 'Time taken for the request in milliseconds'
                    },
                    {
                        name: 'Request Details',
                        key: 'request',
                        type: 'object',
                        description: 'Details of the request that was made'
                    }
                ]
            },
            {
                node_id: 'JOB_POSTING_SCRAPER',
                type: 'action',
                name: 'Job Posting Scraper',
                description: 'Scrape job postings from LinkedIn and VueJobs with configurable limits (default: 20 jobs). LinkedIn requires job title, VueJobs shows all Vue.js positions.',
                isTestable: true,
                icon: '/icons/globe.svg',
                props: [
                    {
                        name: 'Job Site',
                        key: 'jobSite',
                        type: 'select',
                        required: true,
                        description: 'Select the job board to scrape from',
                        options: [
                            { label: 'LinkedIn (configurable limit, max 50)', value: 'linkedin' },
                            { label: 'VueJobs (configurable limit, max 100)', value: 'vuejobs' }
                        ],
                        cloneable: true
                    },
                    {
                        name: 'Job Title/Position',
                        key: 'jobTitle',
                        type: 'text',
                        required: false,
                        description: '🔗 Required for LinkedIn searches (e.g., "Software Engineer"). 🎯 Optional for VueJobs - it shows all Vue.js positions automatically.',
                        ai_enabled: true,
                        cloneable: true
                    },
                    {
                        name: 'Location',
                        key: 'location',
                        type: 'text',
                        required: false,
                        description: 'Job location for LinkedIn search (e.g., "San Francisco, CA", "Remote"). Not used for VueJobs.',
                        ai_enabled: true,
                        cloneable: true
                    },
                    {
                        name: 'Job Limit',
                        key: 'jobLimit',
                        type: 'number',
                        required: false,
                        description: 'Maximum number of jobs to fetch (default: 20, max: 50 for LinkedIn, max: 100 for VueJobs)',
                        value: 20,
                        cloneable: true
                    },
                    {
                        name: 'Date Range',
                        key: 'dateRange',
                        type: 'select',
                        required: false,
                        description: 'Filter jobs by when they were posted',
                        options: [
                            { label: 'Any time', value: 'any' },
                            { label: 'Last 24 hours', value: '24h' },
                            { label: 'Last 3 days', value: '3d' },
                            { label: 'Last week', value: '1w' },
                            { label: 'Last month', value: '1m' }
                        ],
                        value: 'any',
                        cloneable: true
                    },
                    {
                        name: 'Experience Level',
                        key: 'experienceLevel',
                        type: 'select',
                        required: false,
                        description: 'Filter by required experience level',
                        options: [
                            { label: 'Any level', value: 'any' },
                            { label: 'Entry level', value: 'entry' },
                            { label: 'Mid level', value: 'mid' },
                            { label: 'Senior level', value: 'senior' },
                            { label: 'Executive', value: 'executive' }
                        ],
                        value: 'any',
                        cloneable: true
                    },
                    {
                        name: 'Employment Type',
                        key: 'employmentType',
                        type: 'select',
                        required: false,
                        description: 'Filter by employment type',
                        options: [
                            { label: 'Any type', value: 'any' },
                            { label: 'Full-time', value: 'full-time' },
                            { label: 'Part-time', value: 'part-time' },
                            { label: 'Contract', value: 'contract' },
                            { label: 'Freelance', value: 'freelance' },
                            { label: 'Remote', value: 'remote' }
                        ],
                        value: 'any',
                        cloneable: true
                    },
                    {
                        name: 'Salary Range',
                        key: 'salaryRange',
                        type: 'text',
                        required: false,
                        description: 'Optional salary range filter (e.g., "$50,000-$80,000", "€40k-60k")',
                        ai_enabled: true,
                        cloneable: true
                    }
                ],
                expectedOutput: [
                    {
                        name: 'Success',
                        key: 'success',
                        type: 'boolean',
                        description: 'Whether the scraping operation completed successfully'
                    },
                    {
                        name: 'Job Postings',
                        key: 'jobPostings',
                        type: 'array',
                        description: 'Array of structured job posting objects'
                    },
                    {
                        name: 'Total Jobs',
                        key: 'totalJobs',
                        type: 'number',
                        description: 'Total number of job postings found'
                    },
                    {
                        name: 'Requested Limit',
                        key: 'requestedLimit',
                        type: 'number',
                        description: 'Number of jobs requested by user'
                    },
                    {
                        name: 'Actual Limit',
                        key: 'actualLimit',
                        type: 'number',
                        description: 'Actual limit applied (respects platform maximums)'
                    },
                    {
                        name: 'Scraped From',
                        key: 'scrapedFrom',
                        type: 'string',
                        description: 'The job board that was scraped'
                    },
                    {
                        name: 'Scraped URL',
                        key: 'scrapedUrl',
                        type: 'string',
                        description: 'The actual URL that was scraped'
                    },
                    {
                        name: 'Scraped Content',
                        key: 'scrapedContent',
                        type: 'string',
                        description: 'Raw HTML/text content scraped from the job search page'
                    },
                    {
                        name: 'Page Title',
                        key: 'pageTitle',
                        type: 'string',
                        description: 'Title of the scraped job search page'
                    },
                    {
                        name: 'Links',
                        key: 'links',
                        type: 'array',
                        description: 'All links found on the job search page'
                    },
                    {
                        name: 'Metadata',
                        key: 'metadata',
                        type: 'object',
                        description: 'Page metadata (description, keywords, etc.)'
                    },
                    {
                        name: 'Search Criteria',
                        key: 'searchCriteria',
                        type: 'object',
                        description: 'The search parameters used for scraping'
                    },
                    {
                        name: 'Raw Data',
                        key: 'rawData',
                        type: 'object',
                        description: 'Raw response from the scraper API'
                    }
                ]
            }
        ]
    }
]
