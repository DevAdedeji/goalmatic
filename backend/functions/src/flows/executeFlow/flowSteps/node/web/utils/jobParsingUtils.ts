// Job object interface for structured output
export interface JobPosting {
    companyName: string;
    positionTitle: string;
    jobLocation: string;
    salary?: string;
    timePosted?: string;
    jobLink: string;
    jobDescription?: string;
    employmentType?: string;
    experienceLevel?: string;
}

// Utility function to clean and normalize text
const cleanText = (text: string): string => {
    return text
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, ' ')
        .trim();
};

// Utility function to extract salary information from text
const extractSalary = (text: string): string | undefined => {
    const salaryPatterns = [
        /\$[\d,]+(?:\.\d{2})?(?:\s*-\s*\$[\d,]+(?:\.\d{2})?)?(?:\s*(?:per|\/)\s*(?:hour|hr|year|yr|month|mo|week|wk))?/gi,
        /[\d,]+(?:\.\d{2})?\s*-\s*[\d,]+(?:\.\d{2})?\s*(?:USD|dollars?)/gi,
        /(?:salary|pay|compensation):\s*\$?[\d,]+(?:\.\d{2})?(?:\s*-\s*\$?[\d,]+(?:\.\d{2})?)?/gi
    ];
    
    for (const pattern of salaryPatterns) {
        const match = text.match(pattern);
        if (match) {
            return cleanText(match[0]);
        }
    }
    return undefined;
};

// Utility function to extract time posted information
const extractTimePosted = (text: string): string | undefined => {
    const timePatterns = [
        /(?:posted|published|listed)\s+(\d+\s+(?:minute|hour|day|week|month)s?\s+ago)/gi,
        /(\d+\s+(?:minute|hour|day|week|month)s?\s+ago)/gi,
        /(?:today|yesterday|just now)/gi,
        /\d{1,2}\/\d{1,2}\/\d{2,4}/g,
        /\d+[hdwmy]/g, // matches patterns like "8d", "1mo", "2w"
        /(?:a week ago|a day ago|a month ago)/gi
    ];

    for (const pattern of timePatterns) {
        const match = text.match(pattern);
        if (match) {
            return cleanText(match[0]);
        }
    }
    return undefined;
};

// Parse VueJobs job listings
export const parseVueJobs = (content: string, links: any[]): JobPosting[] => {
    const jobs: JobPosting[] = [];

    try {
        // VueJobs has a clear structure with company names, locations, and job titles
        const lines = content.split('\n').filter(line => line.trim().length > 0);

        let i = 0;
        while (i < lines.length) {
            const line = lines[i].trim();

            // Look for company name patterns (usually followed by location)
            if (line && !line.includes('Jobs') && !line.includes('Sign in') && !line.includes('Post a job')) {
                // Check if next line might be a location
                const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
                const lineAfter = i + 2 < lines.length ? lines[i + 2].trim() : '';

                // Pattern: Company, Location, Job Title
                if (nextLine && lineAfter &&
                    (nextLine.includes(',') || nextLine.includes('Remote') || nextLine.includes('USA') || nextLine.includes('UK') || nextLine.includes('Netherlands'))) {

                    const companyName = line;
                    const location = nextLine;
                    const jobTitle = lineAfter;

                    // Find corresponding link
                    const jobLink = links.find(link =>
                        link.text?.includes(companyName) ||
                        link.text?.includes(jobTitle) ||
                        link.href?.includes('vuejobs.com/jobs/')
                    )?.href || 'https://vuejobs.com/jobs';

                    // Look for job description in following lines
                    let description = '';
                    let j = i + 3;
                    while (j < lines.length && j < i + 8) { // Look ahead a few lines
                        const descLine = lines[j].trim();
                        if (descLine && !descLine.includes('Know more') && !descLine.includes('Full-time')) {
                            description += descLine + ' ';
                        }
                        if (descLine.includes('Know more') || descLine.includes('Full-time')) {
                            break;
                        }
                        j++;
                    }

                    const job: JobPosting = {
                        companyName: cleanText(companyName),
                        positionTitle: cleanText(jobTitle),
                        jobLocation: cleanText(location),
                        salary: extractSalary(description),
                        timePosted: extractTimePosted(description),
                        jobLink: jobLink,
                        jobDescription: cleanText(description).substring(0, 200) + '...',
                        employmentType: 'Full-time', // VueJobs typically shows full-time positions
                        experienceLevel: jobTitle.toLowerCase().includes('senior') ? 'Senior' :
                                       jobTitle.toLowerCase().includes('junior') ? 'Junior' : undefined
                    };

                    jobs.push(job);
                    i = j; // Skip processed lines
                } else {
                    i++;
                }
            } else {
                i++;
            }
        }
    } catch (error) {
        console.error('Error parsing VueJobs:', error);
    }

    return jobs;
};

// Parse RemoteOK job listings
export const parseRemoteOK = (content: string, links: any[]): JobPosting[] => {
    const jobs: JobPosting[] = [];

    try {
        // RemoteOK has a structured format with salary, company, location, and job title
        const lines = content.split('\n').filter(line => line.trim().length > 0);

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Look for job title patterns (usually longer descriptive lines)
            if (line.length > 20 &&
                !line.includes('Remote') &&
                !line.includes('Apply') &&
                !line.includes('Post a job') &&
                !line.includes('Health insurance') &&
                !line.startsWith('$') &&
                !line.includes('💰') &&
                !line.includes('🌏') &&
                (line.includes('Engineer') || line.includes('Developer') || line.includes('Manager') || line.includes('Lead'))) {

                const jobTitle = line;

                // Look for company name in previous or next lines
                let companyName = 'Company not specified';
                let location = 'Remote';
                let salary: string | undefined = undefined;

                // Check previous lines for company and salary info
                for (let j = Math.max(0, i - 3); j < i; j++) {
                    const prevLine = lines[j].trim();
                    if (prevLine && !prevLine.includes('💰') && !prevLine.includes('🌏') && prevLine.length < 50) {
                        companyName = prevLine;
                    }
                    if (prevLine.includes('💰') || prevLine.includes('$')) {
                        salary = extractSalary(prevLine);
                    }
                }

                // Check next lines for additional info
                for (let j = i + 1; j < Math.min(lines.length, i + 3); j++) {
                    const nextLine = lines[j].trim();
                    if (nextLine.includes('🌏') || nextLine.includes('Worldwide') || nextLine.includes('Europe') || nextLine.includes('United States')) {
                        location = nextLine.replace(/🌏|💰|🇺🇸|🇪🇺|🇨🇦/g, '').trim();
                    }
                    if (nextLine.includes('💰') || nextLine.includes('$')) {
                        salary = extractSalary(nextLine);
                    }
                }

                // Find corresponding link
                const jobLink = links.find(link =>
                    link.text?.includes(jobTitle) ||
                    link.href?.includes('remoteok.com/remote-jobs/')
                )?.href || 'https://remoteok.com/remote-dev-jobs';

                // Look for time posted
                let timePosted: string | undefined = undefined;
                for (let j = i + 1; j < Math.min(lines.length, i + 5); j++) {
                    const nextLine = lines[j].trim();
                    const time = extractTimePosted(nextLine);
                    if (time) {
                        timePosted = time;
                        break;
                    }
                }

                const job: JobPosting = {
                    companyName: cleanText(companyName),
                    positionTitle: cleanText(jobTitle),
                    jobLocation: cleanText(location),
                    salary: salary,
                    timePosted: timePosted,
                    jobLink: jobLink,
                    jobDescription: `Remote ${jobTitle} position at ${companyName}`,
                    employmentType: 'Full-time',
                    experienceLevel: jobTitle.toLowerCase().includes('senior') ? 'Senior' :
                                   jobTitle.toLowerCase().includes('junior') ? 'Junior' :
                                   jobTitle.toLowerCase().includes('lead') || jobTitle.toLowerCase().includes('principal') ? 'Senior' : undefined
                };

                jobs.push(job);
            }
        }
    } catch (error) {
        console.error('Error parsing RemoteOK:', error);
    }

    return jobs;
};

// Parse Startup.jobs listings
export const parseStartupJobs = (content: string, links: any[]): JobPosting[] => {
    const jobs: JobPosting[] = [];

    try {
        // Startup.jobs has a clear structure with job titles, companies, and locations
        const lines = content.split('\n').filter(line => line.trim().length > 0);

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Look for job title patterns (usually contain "Engineer", "Developer", "Manager", etc.)
            if (line.length > 10 &&
                (line.includes('Engineer') || line.includes('Developer') || line.includes('Manager') ||
                 line.includes('Designer') || line.includes('Analyst') || line.includes('Lead') ||
                 line.includes('Director') || line.includes('Specialist')) &&
                !line.includes('Browse') && !line.includes('Apply') && !line.includes('Bookmark')) {

                const jobTitle = line;

                // Look for company name in next few lines
                let companyName = 'Company not specified';
                let location = 'Location not specified';
                let timePosted: string | undefined = undefined;

                // Check next lines for company and location info
                for (let j = i + 1; j < Math.min(lines.length, i + 5); j++) {
                    const nextLine = lines[j].trim();

                    // Company names are usually shorter and don't contain location indicators
                    if (nextLine && nextLine.length < 50 &&
                        !nextLine.includes('·') && !nextLine.includes('Remote') &&
                        !nextLine.includes('U.S.') && !nextLine.includes('Canada') &&
                        !nextLine.includes('Apply') && !nextLine.includes('Bookmark') &&
                        !nextLine.includes('Today') && !nextLine.includes('Yesterday')) {
                        companyName = nextLine;
                    }

                    // Location patterns
                    if (nextLine.includes('·') || nextLine.includes('Remote') ||
                        nextLine.includes('U.S.') || nextLine.includes('Canada') ||
                        nextLine.includes('United Kingdom') || nextLine.includes('Europe')) {
                        location = nextLine.replace(/·/g, '').trim();
                    }

                    // Time posted patterns
                    const time = extractTimePosted(nextLine);
                    if (time) {
                        timePosted = time;
                    }
                }

                // Find corresponding link
                const jobLink = links.find(link =>
                    link.text?.includes(jobTitle) ||
                    link.href?.includes('startup.jobs/') ||
                    (link.text?.includes(companyName) && companyName !== 'Company not specified')
                )?.href || 'https://startup.jobs/';

                const job: JobPosting = {
                    companyName: cleanText(companyName),
                    positionTitle: cleanText(jobTitle),
                    jobLocation: cleanText(location),
                    salary: extractSalary(content.substring(Math.max(0, i - 5), i + 10)),
                    timePosted: timePosted,
                    jobLink: jobLink,
                    jobDescription: `${jobTitle} position at ${companyName}`,
                    employmentType: 'Full-time',
                    experienceLevel: jobTitle.toLowerCase().includes('senior') ? 'Senior' :
                                   jobTitle.toLowerCase().includes('junior') ? 'Junior' :
                                   jobTitle.toLowerCase().includes('lead') || jobTitle.toLowerCase().includes('director') || jobTitle.toLowerCase().includes('principal') ? 'Senior' : undefined
                };

                jobs.push(job);
            }
        }
    } catch (error) {
        console.error('Error parsing Startup.jobs:', error);
    }

    return jobs;
};

// Parse LinkedIn job listings
export const parseLinkedInJobs = (content: string, links: any[]): JobPosting[] => {
    const jobs: JobPosting[] = [];

    try {
        // LinkedIn has structured job cards with specific patterns
        const lines = content.split('\n').filter(line => line.trim().length > 0);

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Look for job title patterns (usually longer descriptive lines with job-related keywords)
            if (line.length > 15 &&
                (line.includes('Engineer') || line.includes('Developer') || line.includes('Manager') ||
                 line.includes('Analyst') || line.includes('Specialist') || line.includes('Lead') ||
                 line.includes('Director') || line.includes('Coordinator') || line.includes('Associate') ||
                 line.includes('Designer') || line.includes('Consultant') || line.includes('Architect')) &&
                !line.includes('LinkedIn') && !line.includes('Search') && !line.includes('Apply') &&
                !line.includes('Filter') && !line.includes('Sort') && !line.includes('Jobs') &&
                !line.includes('Show more') && !line.includes('See more') && !line.includes('View')) {

                const jobTitle = line;

                // Look for company name and location in surrounding lines
                let companyName = 'Company not specified';
                let location = 'Location not specified';
                let timePosted: string | undefined = undefined;
                let salary: string | undefined = undefined;

                // Check surrounding lines for company and location info
                for (let j = Math.max(0, i - 3); j < Math.min(lines.length, i + 5); j++) {
                    if (j === i) continue; // Skip the job title line

                    const surroundingLine = lines[j].trim();

                    // Company names are usually shorter and don't contain location indicators
                    if (surroundingLine && surroundingLine.length < 50 && surroundingLine.length > 2 &&
                        !surroundingLine.includes('·') && !surroundingLine.includes('ago') &&
                        !surroundingLine.includes('$') && !surroundingLine.includes('Full-time') &&
                        !surroundingLine.includes('Part-time') && !surroundingLine.includes('Remote') &&
                        !surroundingLine.includes('Apply') && !surroundingLine.includes('Save') &&
                        !surroundingLine.includes('View') && !surroundingLine.includes('More') &&
                        !surroundingLine.includes('Easy Apply') && !surroundingLine.includes('LinkedIn') &&
                        !surroundingLine.includes('connections') && !surroundingLine.includes('followers')) {

                        // Check if it looks like a company name (starts with capital letter, reasonable length)
                        if (/^[A-Z]/.test(surroundingLine) && surroundingLine.length < 40) {
                            companyName = surroundingLine;
                        }
                    }

                    // Location patterns (LinkedIn often uses specific formats)
                    if (surroundingLine.includes('·') ||
                        surroundingLine.includes('Remote') ||
                        surroundingLine.includes('United States') ||
                        surroundingLine.includes('On-site') || surroundingLine.includes('Hybrid') ||
                        /\b[A-Z][a-z]+,\s*[A-Z]{2}\b/.test(surroundingLine) || // City, State pattern
                        /\b[A-Z][a-z]+\s+Area\b/.test(surroundingLine)) { // "San Francisco Bay Area" pattern
                        location = surroundingLine.replace(/·/g, '').trim();
                    }

                    // Time posted patterns (LinkedIn specific)
                    if (surroundingLine.includes('ago') || surroundingLine.includes('day') ||
                        surroundingLine.includes('hour') || surroundingLine.includes('week') ||
                        surroundingLine.includes('month') || surroundingLine.includes('Posted')) {
                        timePosted = extractTimePosted(surroundingLine);
                    }

                    // Salary patterns
                    const sal = extractSalary(surroundingLine);
                    if (sal) {
                        salary = sal;
                    }
                }

                // Find corresponding link (LinkedIn job links)
                const jobLink = links.find(link =>
                    link.href?.includes('linkedin.com/jobs/view') ||
                    link.text?.includes(jobTitle) ||
                    (link.text?.includes(companyName) && companyName !== 'Company not specified')
                )?.href || `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(jobTitle)}`;

                const job: JobPosting = {
                    companyName: cleanText(companyName),
                    positionTitle: cleanText(jobTitle),
                    jobLocation: cleanText(location),
                    salary: salary,
                    timePosted: timePosted,
                    jobLink: jobLink,
                    jobDescription: `${jobTitle} position at ${companyName}`,
                    employmentType: 'Full-time',
                    experienceLevel: jobTitle.toLowerCase().includes('senior') ? 'Senior' :
                                   jobTitle.toLowerCase().includes('junior') ? 'Junior' :
                                   jobTitle.toLowerCase().includes('lead') || jobTitle.toLowerCase().includes('director') || jobTitle.toLowerCase().includes('principal') ? 'Senior' : undefined
                };

                jobs.push(job);
            }
        }
    } catch (error) {
        console.error('Error parsing LinkedIn Jobs:', error);
    }

    return jobs;
};



// Generic job parser for other sites
export const parseGenericJobs = (content: string, links: any[], jobTitle: string): JobPosting[] => {
    const jobs: JobPosting[] = [];
    
    try {
        // Generic patterns that might work across different sites
        const sentences = content.split(/[.!?]+/);
        const jobRelatedSentences = sentences.filter(sentence => 
            sentence.toLowerCase().includes(jobTitle.toLowerCase()) ||
            sentence.match(/(?:position|role|job|career|opportunity|hiring)/i)
        );
        
        // Group related sentences and extract job information
        for (let i = 0; i < Math.min(jobRelatedSentences.length, 10); i++) {
            const sentence = jobRelatedSentences[i];
            
            // Try to extract company and position from the sentence
            const companyMatch = sentence.match(/(?:at|with|for)\s+([A-Z][a-zA-Z\s&,.-]+?)(?:\s+(?:is|are|seeks|looking|hiring))/i);
            const positionMatch = sentence.match(/(?:seeking|hiring|looking for|position for)\s+([a-zA-Z\s-]+?)(?:\s+(?:at|with|for|in))/i);
            
            if (companyMatch || positionMatch) {
                const job: JobPosting = {
                    companyName: companyMatch ? cleanText(companyMatch[1]) : 'Company not specified',
                    positionTitle: positionMatch ? cleanText(positionMatch[1]) : jobTitle,
                    jobLocation: 'Location not specified',
                    salary: extractSalary(sentence),
                    timePosted: extractTimePosted(sentence),
                    jobLink: links[Math.min(i, links.length - 1)]?.href || '#',
                    jobDescription: cleanText(sentence),
                    employmentType: sentence.match(/(?:full.?time|part.?time|contract|temporary|internship)/gi)?.[0],
                    experienceLevel: sentence.match(/(?:entry.?level|senior|junior|mid.?level|experienced)/gi)?.[0]
                };
                jobs.push(job);
            }
        }
    } catch (error) {
        console.error('Error parsing generic jobs:', error);
    }
    
    return jobs;
};

// Main parsing function that routes to appropriate parser
export const parseJobListings = (
    content: string,
    links: any[],
    jobSite: string,
    jobTitle: string
): JobPosting[] => {
    if (!content || content.trim().length === 0) {
        return [];
    }

    const normalizedSite = jobSite.toLowerCase();

    switch (normalizedSite) {
        case 'vuejobs':
        case 'vue-jobs':
            return parseVueJobs(content, links);
        case 'remoteok':
        case 'remote-ok':
        case 'remote.ok':
            return parseRemoteOK(content, links);
        case 'startup-jobs':
        case 'startupjobs':
        case 'startup.jobs':
            return parseStartupJobs(content, links);
        case 'linkedin':
        case 'linkedin-jobs':
            return parseLinkedInJobs(content, links);
        default:
            return parseGenericJobs(content, links, jobTitle);
    }
};
