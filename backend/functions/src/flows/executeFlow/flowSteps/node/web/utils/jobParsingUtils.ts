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
      const jobLink = `https://vuejobs.com${el.attr('href')?.trim() ?? ''}`;

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









// Parse LinkedIn job listings from search results HTML
// Parse LinkedIn job listings from search results HTML
export const parseLinkedInJobs = (content: string): JobPosting[] => {
  const jobs: JobPosting[] = [];
  try {
    const cheerio = require('cheerio');
    const $ = cheerio.load(content);

    const cards = $('.job-search-card, .base-search-card');
    if (!cards || cards.length === 0) {
      console.warn('No job cards found');
    }

    cards.each((index: number, el: any) => {
      const card = $(el);

      // Title element
      let titleElement = card.find('h3 a').first();
      if (!titleElement.length) {
        titleElement = card.find('.base-search-card__title a, .base-card__full-link, h3').first();
      }

      // Company element
      let companyElement = card.find('h4 a').first();
      if (!companyElement.length) {
        companyElement = card.find('.base-search-card__subtitle a, .hidden-nested-link, h4').first();
      }

      // Location element
      let locationElement = card.find('.job-search-card__location').first();
      if (!locationElement.length) {
        locationElement = card.find('.base-search-card__metadata span, .job-search-card__metadata').first();
      }

      const timeElement = card.find('time, .job-search-card__listdate').first();
      const salaryElement = card.find('.job-search-card__salary-info, .base-search-card__salary').first();
      const descriptionElement = card.find('.job-search-card__snippet, .base-search-card__snippet').first();

      // Link handling — broader selector
      let href = '';
      if (titleElement.is('a') && titleElement.attr('href')) {
        href = String(titleElement.attr('href')).trim();
      } else {
        const linkEl = card.find('a.base-card__full-link').first();
        if (linkEl.length && linkEl.attr('href')) {
          href = String(linkEl.attr('href')).trim();
        }
      }
      if (href && href.startsWith('/')) {
        href = `https://www.linkedin.com${href}`;
      }

      if (href.includes('?')) {
        href = href.split('?')[0];
      }

      const companyName = companyElement.text()?.replace(/\s+/g, ' ').trim() || 'Company not specified';
      const positionTitle = titleElement.text()?.replace(/\s+/g, ' ').trim() || '';
      const jobLocation = locationElement.text()?.replace(/\s+/g, ' ').trim() || 'Location not specified';
      const jobLink = href || 'https://www.linkedin.com/jobs';
      const salary = salaryElement.text()?.replace(/\s+/g, ' ').trim() || undefined;
      const timePosted = timeElement.text()?.replace(/\s+/g, ' ').trim() || undefined;
      const jobDescription = descriptionElement.text()?.replace(/\s+/g, ' ').trim() || undefined;

      if (positionTitle) {
        jobs.push({
          companyName,
          positionTitle,
          jobLocation,
          salary,
          timePosted,
          jobLink,
          jobDescription
        });
      }
    });
  } catch (err) {
    console.error('Failed to parse LinkedIn Jobs HTML:', err);
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
    case 'linkedin':
    case 'linkedin-jobs':
      return parseLinkedInJobs(content);
    default:
      return null
  }
};
