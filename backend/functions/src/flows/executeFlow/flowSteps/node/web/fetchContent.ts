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
            extractorFunction
        } = processedPropsWithAiContext;

        if (!url) {
            return {
                success: false,
                error: 'URL is required'
            };
        }

        // Parse URLs - handle both single URL and comma-separated URLs
        const urlStrings = url.split(',').map((u: string) => u.trim()).filter((u: string) => u.length > 0);
        
        if (urlStrings.length === 0) {
            return {
                success: false,
                error: 'At least one valid URL is required'
            };
        }

        // Validate URL formats
        const validUrls: string[] = [];
        for (const urlString of urlStrings) {
            try {
                new URL(urlString);
                validUrls.push(urlString);
            } catch (error) {
                return {
                    success: false,
                    error: `Invalid URL format: ${urlString}`
                };
            }
        }

        // Get Exa API key from environment variables
        const exaApiKey = process.env.EXA_API_KEY;
        if (!exaApiKey) {
            return {
                success: false,
                error: 'EXA_API_KEY environment variable is required'
            };
        }

        // Prepare request body for Exa API
        const requestBody: any = {
            urls: validUrls,
            text: true,
            livecrawl: 'preferred'
        };

        // Make request to Exa API
        const response = await fetch('https://api.exa.ai/contents', {
            method: 'POST',
            headers: {
                'x-api-key': exaApiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            return {
                success: false,
                error: `Exa API error (${response.status}): ${errorText}`
            };
        }

        const data = await response.json();

        // Check if we have results
        if (!data.results || data.results.length === 0) {
            return {
                success: false,
                error: 'No content could be fetched from the URLs'
            };
        }

        const results = data.results;

        // Check status for any errors
        if (data.statuses) {
            for (const status of data.statuses) {
                if (status.status === 'error') {
                    return {
                        success: false,
                        error: `Failed to fetch content from ${status.id}: ${status.error?.tag || 'Unknown error'}`
                    };
                }
            }
        }

        // Extract the content from all results
        let allContent = '';
        let allExtractedData: any[] = [];
        let contentByUrl: { [key: string]: any } = {};

        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const resultUrl = result.url || validUrls[i];
            
            let content = result.text || '';
            let extractedData = null;

            // Apply extractor function if provided
            if (extractorFunction && extractorFunction.trim()) {
                try {
                    console.log(`Applying extractor function to content from ${resultUrl}`);
                    
                    // Create a safe execution environment for the extractor function
                    const extractorWrapper = new Function('content', `
                        try {
                            const extractorFn = ${extractorFunction};
                            if (typeof extractorFn === 'function') {
                                return extractorFn(content);
                            } else {
                                throw new Error('Extractor must be a function');
                            }
                        } catch (error) {
                            console.error('Extractor function execution error:', error);
                            throw new Error('Extractor function error: ' + error.message);
                        }
                    `);
                    
                    const extractedContent = extractorWrapper(content);
                    extractedData = extractedContent; // Store the raw extracted data
                    
                    // Handle different types of extracted content
                    if (typeof extractedContent === 'string') {
                        content = extractedContent;
                    } else if (Array.isArray(extractedContent) || typeof extractedContent === 'object') {
                        // For arrays and objects, stringify them properly for display
                        content = JSON.stringify(extractedContent, null, 2);
                    } else {
                        content = String(extractedContent);
                    }
                    
                } catch (extractorError: any) {
                    console.error(`Error applying extractor function for ${resultUrl}:`, extractorError);
                    return {
                        success: false,
                        error: `Extractor function error for ${resultUrl}: ${extractorError.message || 'Unknown error in extractor function'}`
                    };
                }
            }

            // Store content by URL
            contentByUrl[resultUrl] = {
                originalContent: result.text || '',
                extractedContent: content,
                extractedData: extractedData,
                title: result.title,
                url: resultUrl
            };

            // Append to combined content (with URL separator for multiple URLs)
            if (validUrls.length > 1) {
                allContent += `\n--- Content from ${resultUrl} ---\n${content}\n`;
            } else {
                allContent = content;
            }

            if (extractedData !== null) {
                allExtractedData.push({
                    url: resultUrl,
                    data: extractedData
                });
            }
        }

        console.log('Fetched content from Exa:', {
            urls: validUrls,
            totalResults: results.length,
            contentLength: allContent.length,
            contentByUrl: Object.keys(contentByUrl),
            hasExtractedData: allExtractedData.length > 0
        });

        return {
            success: true,        
            payload: {
                ...processedPropsWithAiContext, 
                content: allContent,
                extractorContent: allContent,
                extractedData: allExtractedData.length === 1 ? allExtractedData[0].data : allExtractedData,
                contentByUrl: contentByUrl,
                urls: validUrls,
                totalResults: results.length
            }
        };

    } catch (error: any) {
        console.error('Error fetching web content with Exa:', error);
        return {
            success: false,
            error: error?.message || 'Failed to fetch web content'
        };
    }
};

export const fetchWebContentNode = {
    nodeId: 'WEB_FETCH_CONTENT_EXA',
    run: fetchWebContent
};
