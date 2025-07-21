import { WorkflowContext } from "@upstash/workflow";
import { FlowNode } from "../../../type";
import { processMentionsProps } from "../../../../../utils/processMentions";
import { generateAiFlowContext } from "../../../../../utils/generateAiFlowContext";

const fetchWebContent = async (context: WorkflowContext, step: FlowNode, previousStepResult: any) => {
    try {
        // Process all string fields in propsData first
        const processedProps = processMentionsProps(step.propsData, previousStepResult);
        
        // Generate AI content for AI-enabled fields and get updated props
        const { processedPropsWithAiContext } = await generateAiFlowContext(step, processedProps);
        
        const { 
            url, 
            waitForSelector, 
            textOnly = false, 
            timeout = 30, 
            userAgent 
        } = processedPropsWithAiContext;

        if (!url) {
            return {
                success: false,
                error: 'URL is required'
            };
        }

        // Validate URL format
        try {
            new URL(url);
        } catch (error) {
            return {
                success: false,
                error: 'Invalid URL format'
            };
        }

        // Dynamic import of playwright to avoid issues if not installed
        let playwright;
        try {
            playwright = await import('playwright');
        } catch (error) {
            return {
                success: false,
                error: 'Playwright is not installed. Please install playwright to use web content fetching.'
            };
        }

        const browser = await playwright.chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        try {
            const context = await browser.newContext({
                userAgent: userAgent || undefined
            });

            const page = await context.newPage();

            // Set timeout
            page.setDefaultTimeout(timeout * 1000);

            // Navigate to the URL
            await page.goto(url, { 
                waitUntil: 'networkidle',
                timeout: timeout * 1000 
            });

            // Wait for specific selector if provided
            if (waitForSelector) {
                try {
                    await page.waitForSelector(waitForSelector, { 
                        timeout: timeout * 1000 
                    });
                } catch (error) {
                    console.warn(`Selector "${waitForSelector}" not found within timeout, continuing anyway`);
                }
            }

            // Extract content
            let content;
            if (textOnly) {
                // Extract only text content
                content = await page.textContent('body') || '';
                // Clean up whitespace
                content = content.replace(/\s+/g, ' ').trim();
            } else {
                // Extract full HTML content
                content = await page.content();
            }

            // Get page title and meta information
            const title = await page.title();
            const url_final = page.url(); // In case of redirects

            await context.close();

            console.log(content);
            return {
                success: true,
                content,
                title,
                url: url_final,
                textOnly,
                fetchedAt: new Date().toISOString(),
                contentLength: content.length,
                payload: {...processedPropsWithAiContext, content   }
            };

        } finally {
            await browser.close();
        }

    } catch (error: any) {
        console.error('Error fetching web content:', error);
        return {
            success: false,
            error: error?.message || 'Failed to fetch web content'
        };
    }
};

export const fetchWebContentNode = {
    nodeId: 'WEB_FETCH_CONTENT',
    run: fetchWebContent
};
