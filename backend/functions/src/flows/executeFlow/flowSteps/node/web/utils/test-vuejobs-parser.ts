import { parseVueJobs, JobPosting } from './jobParsingUtils';

// Sample VueJobs HTML content for testing
const sampleVueJobsHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Vue Jobs - Find Vue.js Jobs</title>
</head>
<body>
    <div class="job-listing">
        <h3><a href="/jobs/senior-vue-developer-123">Senior Vue.js Developer</a></h3>
        <div class="company">TechCorp Inc</div>
        <div class="location">San Francisco, CA</div>
        <div class="description">
            We are looking for an experienced Vue.js developer to join our team.
            Must have 5+ years of experience with Vue.js and modern JavaScript.
            Salary: $120,000 - $150,000 per year
        </div>
        <div class="posted">Posted 2 days ago</div>
        <div class="employment-type">Full-time</div>
    </div>

    <div class="job-listing">
        <h3><a href="/jobs/frontend-engineer-456">Frontend Engineer (Vue.js)</a></h3>
        <div class="company">StartupXYZ</div>
        <div class="location">Remote</div>
        <div class="description">
            Join our growing team as a Frontend Engineer specializing in Vue.js.
            Experience with TypeScript and modern build tools required.
            Posted 1 week ago
        </div>
        <div class="employment-type">Contract</div>
    </div>

    <article class="job-card">
        <h2>Junior Vue Developer</h2>
        <p>At InnovativeTech LLC</p>
        <p>London, UK</p>
        <p>Entry-level position for a Vue.js developer. Great opportunity to learn and grow.
        We offer competitive salary and benefits. Posted yesterday.</p>
    </article>

    <div class="listing">
        <div class="title">Vue.js Consultant</div>
        <div>FreelanceHub</div>
        <div>Berlin, Germany</div>
        <div>Freelance Vue.js consultant needed for 6-month project. 
        Rate: €80-100 per hour. Posted 3 days ago.</div>
    </div>

    <!-- Test case with minimal structure -->
    <div>
        <p>Senior Vue.js Architect at MegaCorp</p>
        <p>New York, NY</p>
        <p>Lead our Vue.js architecture team. 8+ years experience required.
        Salary range: $160,000 - $200,000. Posted 1 day ago.</p>
    </div>
</body>
</html>
`;

// Test function
export const testVueJobsParser = (): void => {
    console.log('🧪 Testing VueJobs Parser...\n');

    try {
        const jobs: JobPosting[] = parseVueJobs(sampleVueJobsHTML);

        console.log(`✅ Parser executed successfully`);
        console.log(`📊 Found ${jobs.length} job postings (Expected: 5)\n`);
        
        if (jobs.length === 0) {
            console.log('❌ No jobs were extracted - this indicates a parsing issue');
            return;
        }
        
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
            console.log(`Description: ${job.jobDescription?.substring(0, 100)}...`);
            
            // Validation checks
            const issues: string[] = [];
            
            if (!job.positionTitle || job.positionTitle.length < 3) {
                issues.push('Invalid or missing position title');
            }
            
            if (!job.companyName || job.companyName === 'Company not specified') {
                issues.push('Company name not extracted');
            }
            
            if (!job.jobLocation || job.jobLocation === 'Location not specified') {
                issues.push('Location not extracted');
            }
            
            if (!job.jobLink || job.jobLink === 'https://vuejobs.com/jobs') {
                issues.push('Specific job link not extracted');
            }
            
            if (issues.length > 0) {
                console.log(`⚠️  Issues: ${issues.join(', ')}`);
            } else {
                console.log('✅ All fields extracted successfully');
            }
            
            console.log('');
        });
        
        // Overall validation
        const validJobs = jobs.filter(job => 
            job.positionTitle && 
            job.positionTitle.length > 3 && 
            job.companyName !== 'Company not specified' &&
            job.jobLocation !== 'Location not specified'
        );
        
        console.log(`📈 Summary:`);
        console.log(`Total jobs found: ${jobs.length}`);
        console.log(`Fully valid jobs: ${validJobs.length}`);
        console.log(`Success rate: ${((validJobs.length / jobs.length) * 100).toFixed(1)}%`);
        
        if (validJobs.length / jobs.length >= 0.8) {
            console.log('🎉 Parser performance is GOOD (≥80% success rate)');
        } else if (validJobs.length / jobs.length >= 0.6) {
            console.log('⚠️  Parser performance is MODERATE (60-79% success rate)');
        } else {
            console.log('❌ Parser performance is POOR (<60% success rate)');
        }
        
    } catch (error) {
        console.error('❌ Parser failed with error:', error);
    }
};

// Test with edge cases
export const testVueJobsParserEdgeCases = (): void => {
    console.log('\n🧪 Testing Edge Cases...\n');
    
    const edgeCases = [
        {
            name: 'Empty content',
            html: ''
        },
        {
            name: 'No job listings',
            html: '<html><body><p>No jobs found</p></body></html>'
        },
        {
            name: 'Malformed HTML',
            html: '<div><h3>Vue Developer<div>Company</div>'
        },
        {
            name: 'Text-only content',
            html: 'Senior Vue Developer at TechCorp in San Francisco, CA. Posted 2 days ago.'
        }
    ];
    
    edgeCases.forEach(testCase => {
        console.log(`Testing: ${testCase.name}`);
        try {
            const jobs = parseVueJobs(testCase.html);
            console.log(`✅ Handled gracefully - found ${jobs.length} jobs`);
        } catch (error) {
            console.log(`❌ Failed: ${error}`);
        }
        console.log('');
    });
};

// Run tests if this file is executed directly
if (require.main === module) {
    testVueJobsParser();
    testVueJobsParserEdgeCases();
}
