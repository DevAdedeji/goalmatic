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


// Parse VueJobs job listings
export const parseVueJobs = (content: string): JobPosting[] => {
  const jobs: JobPosting[] = [];

  try {
    // Import cheerio for HTML parsing
    const cheerio = require('cheerio');
    const $ = cheerio.load(content);

    // Select each job card anchor
    $('a.block.border').each((_, element) => {
      const el = $(element);

      // href
      const jobLink = `https://vuejobs.com${el.attr('href')?.trim()  ?? ''}`;

      // Company name is the first .font-medium
      const companyName = el.find('.font-medium').first().text().trim();

      // Position title
      const positionTitle = el
        .find('.font-display.text-lg')
        .text()
        .trim();

      // Location – find the span that contains the flag + text
      const jobLocation = el
        .find('.items-center.gap-2 span')
        .text()
        .replace(/\s+/g, ' ')
        .trim();

      // Job type (e.g. "Full-time")
      const employmentType = el
        .find('div.mt-3 .text-xs.text-muted')
        .text()
        .trim();

      // Description snippet
      const jobDescription = el
        .find('.text-muted.text-sm.line-clamp-2')
        .text()
        .trim();

      jobs.push({
        jobLink,
        companyName,
        positionTitle,
        jobLocation,
        employmentType,
        jobDescription,
      });
    });
  } catch (err) {
    console.error('Failed to parse Vue Jobs HTML:', err);
  }

  return jobs;
};










// Main parsing function that routes to appropriate parser
export const parseJobListings = (
    content: string,
    links: any[],
    jobSite: string,
    jobTitle: string
): JobPosting[] | null => {
    if (!content || content.trim().length === 0) {
        return [];
    }

    const normalizedSite = jobSite.toLowerCase();

    switch (normalizedSite) {
        case 'vuejobs':
        case 'vue-jobs':
            return parseVueJobs(content);
        default:
            return null
    }
};
