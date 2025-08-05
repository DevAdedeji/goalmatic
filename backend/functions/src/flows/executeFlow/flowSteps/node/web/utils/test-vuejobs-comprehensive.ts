import { parseVueJobs, JobPosting } from './jobParsingUtils';

// More realistic VueJobs HTML structure
const realisticVueJobsHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Vue Jobs - Find Vue.js Jobs</title>
</head>
<body>
    <main>
        <div class="jobs-container">
            <!-- Job 1: Well-structured job listing -->
            <div class="job-listing" data-job-id="123">
                <div class="job-header">
                    <h3 class="job-title">
                        <a href="/jobs/senior-vue-developer-remote-123">Senior Vue.js Developer (Remote)</a>
                    </h3>
                    <div class="company-info">
                        <span class="company">Acme Technologies Inc</span>
                        <span class="location">Remote, USA</span>
                    </div>
                </div>
                <div class="job-details">
                    <p class="description">We're seeking an experienced Vue.js developer to join our remote team. 
                    Must have 5+ years experience with Vue 3, TypeScript, and modern frontend tools.</p>
                    <div class="job-meta">
                        <span class="salary">$110,000 - $140,000</span>
                        <span class="employment-type">Full-time</span>
                        <span class="posted-date">Posted 1 day ago</span>
                    </div>
                </div>
            </div>

            <!-- Job 2: Minimal structure -->
            <article class="job-card">
                <h4><a href="/jobs/frontend-dev-456">Frontend Developer</a></h4>
                <div>StartupCo</div>
                <div>San Francisco, CA</div>
                <p>Looking for a talented frontend developer with Vue.js experience. 
                Competitive salary and equity package. Posted 3 days ago.</p>
            </article>

            <!-- Job 3: Different structure -->
            <div class="listing">
                <div class="title">Vue.js Engineer</div>
                <div class="company-name">TechFlow Solutions</div>
                <div class="job-location">Berlin, Germany</div>
                <div class="description">
                    Join our engineering team as a Vue.js specialist. 
                    We offer €70,000 - €90,000 salary plus benefits.
                    Contract position available immediately.
                </div>
                <div class="meta">Posted 2 weeks ago</div>
            </div>

            <!-- Job 4: Nested structure -->
            <section class="job-post">
                <header>
                    <h2>Lead Vue Developer</h2>
                    <div class="company">InnovateLabs Ltd</div>
                </header>
                <div class="content">
                    <div class="location">London, UK</div>
                    <div class="details">
                        Lead our Vue.js development team. Senior-level position requiring 
                        7+ years experience. Salary: £80,000 - £100,000 per year.
                        Posted yesterday.
                    </div>
                </div>
            </section>

            <!-- Job 5: Plain div structure -->
            <div>
                <p><strong>Vue.js Consultant</strong></p>
                <p>At ConsultingPro LLC</p>
                <p>Remote, Europe</p>
                <p>Freelance Vue.js consultant needed for 6-month project. 
                Rate: €500-700 per day. Must have Vue 3 and Nuxt experience.
                Posted 5 days ago.</p>
            </div>

            <!-- Job 6: Edge case - very minimal -->
            <div class="job">
                Junior Vue Developer - WebStudio - Amsterdam, Netherlands
                Entry-level position. Posted 1 week ago.
            </div>

            <!-- Non-job content that should be ignored -->
            <div class="advertisement">
                <h3>Learn Vue.js Online</h3>
                <p>Master Vue.js with our comprehensive course...</p>
            </div>

            <div class="navigation">
                <a href="/jobs">All Jobs</a>
                <a href="/post">Post a Job</a>
            </div>
        </div>
    </main>
</body>
</html>
`;

// Test function for comprehensive testing
export const testVueJobsParserComprehensive = (): void => {
    console.log('🧪 Comprehensive VueJobs Parser Test...\n');
    
    try {
        const jobs: JobPosting[] = parseVueJobs(realisticVueJobsHTML);
        
        console.log(`✅ Parser executed successfully`);
        console.log(`📊 Found ${jobs.length} job postings (Expected: 6)\n`);
        
        if (jobs.length === 0) {
            console.log('❌ No jobs were extracted - this indicates a parsing issue');
            return;
        }
        
        // Expected job titles for validation
        const expectedTitles = [
            'Senior Vue.js Developer (Remote)',
            'Frontend Developer', 
            'Vue.js Engineer',
            'Lead Vue Developer',
            'Vue.js Consultant',
            'Junior Vue Developer'
        ];
        
        // Validate each job posting
        jobs.forEach((job, index) => {
            console.log(`--- Job ${index + 1} ---`);
            console.log(`Position: ${job.positionTitle}`);
            console.log(`Company: ${job.companyName}`);
            console.log(`Location: ${job.jobLocation}`);
            console.log(`Link: ${job.jobLink}`);
            console.log(`Salary: ${job.salary || 'Not specified'}`);
            console.log(`Time Posted: ${job.timePosted || 'Not specified'}`);
            console.log(`Employment Type: ${job.employmentType || 'Not specified'}`);
            console.log(`Experience Level: ${job.experienceLevel || 'Not specified'}`);
            
            // Quality checks
            const issues: string[] = [];
            
            if (!job.positionTitle || job.positionTitle.length < 3) {
                issues.push('Invalid position title');
            }
            
            if (job.companyName === 'Company not specified') {
                issues.push('Company name not extracted');
            }
            
            if (job.jobLocation === 'Location not specified') {
                issues.push('Location not extracted');
            }
            
            if (!job.salary && job.jobDescription && /\$|€|£|\d+,\d+/.test(job.jobDescription)) {
                issues.push('Salary mentioned but not extracted');
            }
            
            if (!job.timePosted && job.jobDescription && /posted|ago|day|week/.test(job.jobDescription.toLowerCase())) {
                issues.push('Time posted mentioned but not extracted');
            }
            
            if (issues.length > 0) {
                console.log(`⚠️  Issues: ${issues.join(', ')}`);
            } else {
                console.log('✅ All fields extracted successfully');
            }
            
            console.log('');
        });
        
        // Check if we found the expected jobs
        const foundTitles = jobs.map(job => job.positionTitle);
        const missedTitles = expectedTitles.filter(title => 
            !foundTitles.some(found => found.toLowerCase().includes(title.toLowerCase().split(' ')[0]))
        );
        
        if (missedTitles.length > 0) {
            console.log(`❌ Missed expected jobs: ${missedTitles.join(', ')}`);
        }
        
        // Overall assessment
        const qualityScore = jobs.filter(job => 
            job.positionTitle && 
            job.positionTitle.length > 3 && 
            job.companyName !== 'Company not specified' &&
            job.jobLocation !== 'Location not specified'
        ).length;
        
        console.log(`📈 Final Assessment:`);
        console.log(`Jobs found: ${jobs.length}/6 expected`);
        console.log(`High quality jobs: ${qualityScore}/${jobs.length}`);
        console.log(`Overall success rate: ${((qualityScore / 6) * 100).toFixed(1)}%`);
        
        if (qualityScore >= 5) {
            console.log('🎉 EXCELLENT performance (≥83% success rate)');
        } else if (qualityScore >= 4) {
            console.log('✅ GOOD performance (67-82% success rate)');
        } else if (qualityScore >= 3) {
            console.log('⚠️  MODERATE performance (50-66% success rate)');
        } else {
            console.log('❌ POOR performance (<50% success rate)');
        }
        
    } catch (error) {
        console.error('❌ Parser failed with error:', error);
    }
};

// Run test if this file is executed directly
if (require.main === module) {
    testVueJobsParserComprehensive();
}
