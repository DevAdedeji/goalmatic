import { parseVueJobs } from './jobParsingUtils';

// Final comprehensive test with edge cases
export const runFinalVueJobsTest = (): void => {
    console.log('🚀 Final VueJobs Parser Test Suite\n');
    
    // Test 1: Real-world mixed content
    const mixedContentHTML = `
    <html>
    <body>
        <div class="job-listing">
            <h3><a href="/jobs/vue-dev-123">Vue.js Developer</a></h3>
            <div class="company">TechStartup Inc</div>
            <div class="location">Remote</div>
            <div>$80,000 - $120,000 per year</div>
            <div>Posted 2 days ago</div>
        </div>
        
        <article class="job-card">
            <h2>Senior Frontend Engineer</h2>
            <p>At MegaCorp Technologies</p>
            <p>San Francisco, CA</p>
            <p>We offer competitive salary €90,000-€110,000. Posted yesterday.</p>
        </article>
        
        <div>
            <strong>Vue.js Consultant</strong> - FreelancePro LLC - Berlin, Germany
            Rate: €500 per day. Posted 1 week ago.
        </div>
        
        <!-- Should be ignored -->
        <div class="advertisement">
            <h3>Learn Vue.js Development</h3>
            <p>Master Vue.js with our course...</p>
        </div>
    </body>
    </html>
    `;
    
    console.log('Test 1: Mixed Content Structure');
    testParserWithContent(mixedContentHTML, 3);
    
    // Test 2: Minimal structure
    const minimalHTML = `
    <div>Senior Vue Developer at TechCorp in New York, NY. Salary: $100,000. Posted today.</div>
    <div>Frontend Engineer - StartupXYZ - Remote. Posted 3 days ago.</div>
    `;
    
    console.log('\nTest 2: Minimal Structure');
    testParserWithContent(minimalHTML, 2);
    
    // Test 3: Complex nested structure
    const nestedHTML = `
    <section class="job-post">
        <header>
            <h1>Lead Vue.js Architect</h1>
            <div class="company-info">
                <span class="company">InnovativeTech Solutions</span>
                <span class="location">London, UK</span>
            </div>
        </header>
        <div class="job-details">
            <p>£120,000 - £150,000 per year</p>
            <p>Posted 1 day ago</p>
            <p>Full-time position</p>
        </div>
    </section>
    `;
    
    console.log('\nTest 3: Complex Nested Structure');
    testParserWithContent(nestedHTML, 1);
    
    // Test 4: Error handling
    console.log('\nTest 4: Error Handling');
    testErrorHandling();
    
    console.log('\n🎯 Final Assessment Complete!');
};

const testParserWithContent = (html: string, expectedCount: number): void => {
    try {
        const jobs = parseVueJobs(html);
        console.log(`✅ Found ${jobs.length}/${expectedCount} jobs`);
        
        jobs.forEach((job, index) => {
            console.log(`  ${index + 1}. ${job.positionTitle} at ${job.companyName} (${job.jobLocation})`);
            if (job.salary) console.log(`     Salary: ${job.salary}`);
            if (job.timePosted) console.log(`     Posted: ${job.timePosted}`);
        });
        
        const qualityJobs = jobs.filter(job => 
            job.positionTitle.length > 3 && 
            job.companyName !== 'Company not specified'
        );
        
        console.log(`   Quality: ${qualityJobs.length}/${jobs.length} jobs have complete data`);
        
    } catch (error) {
        console.log(`❌ Error: ${error}`);
    }
};

const testErrorHandling = (): void => {
    const errorCases = [
        { name: 'Empty string', content: '' },
        { name: 'Invalid HTML', content: '<div><h3>Test<div>No closing tags' },
        { name: 'No job content', content: '<html><body><p>No jobs here</p></body></html>' },
        { name: 'Very large content', content: '<div>' + 'x'.repeat(10000) + '</div>' }
    ];
    
    errorCases.forEach(testCase => {
        try {
            const jobs = parseVueJobs(testCase.content);
            console.log(`✅ ${testCase.name}: Handled gracefully (${jobs.length} jobs)`);
        } catch (error) {
            console.log(`❌ ${testCase.name}: Failed with error`);
        }
    });
};

// Performance test
export const testParserPerformance = (): void => {
    console.log('\n⚡ Performance Test');
    
    const largeHTML = `
    <html><body>
    ${Array.from({ length: 100 }, (_, i) => `
        <div class="job-listing">
            <h3>Developer ${i}</h3>
            <div class="company">Company ${i}</div>
            <div class="location">City ${i}</div>
            <div>Posted ${i} days ago</div>
        </div>
    `).join('')}
    </body></html>
    `;
    
    const startTime = Date.now();
    const jobs = parseVueJobs(largeHTML);
    const endTime = Date.now();
    
    console.log(`✅ Processed 100 job listings in ${endTime - startTime}ms`);
    console.log(`📊 Found ${jobs.length} jobs`);
    console.log(`⚡ Performance: ${((endTime - startTime) / jobs.length).toFixed(2)}ms per job`);
};

// Run all tests
if (require.main === module) {
    runFinalVueJobsTest();
    testParserPerformance();
}
