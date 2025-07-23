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
            includeHighlights = false,
            includeSummary = false,
            maxCharacters = 10000
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
            urls: [url],
            text: {
                maxCharacters,
                includeHtmlTags: false
            },
            livecrawl: 'fallback'
        };

        // Add highlights if requested
        if (includeHighlights) {
            requestBody.highlights = {
                numSentences: 3,
                highlightsPerUrl: 2
            };
        }

        // Add summary if requested
        if (includeSummary) {
            requestBody.summary = {};
        }

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
                error: 'No content could be fetched from the URL'
            };
        }

        const result = data.results[0];

        // Check status for any errors
        const status = data.statuses?.find((s: any) => s.id === url);
        if (status?.status === 'error') {
            return {
                success: false,
                error: `Failed to fetch content: ${status.error?.tag || 'Unknown error'}`
            };
        }

        // Extract the content
        const content = result.text || '';

        console.log('Fetched content from Exa:', {
            url: result.url,
            title: result.title,
            contentLength: content.length,
            hasHighlights: !!result.highlights,
            hasSummary: !!result.summary
        });

        return {
            success: true,
            content,
            title: result.title,
            url: result.url,
            author: result.author,
            publishedDate: result.publishedDate,
            fetchedAt: new Date().toISOString(),
            contentLength: content.length,
            highlights: result.highlights,
            summary: result.summary,
            score: result.score,
            image: result.image,
            favicon: result.favicon,
            payload: {
                ...processedPropsWithAiContext, 
                content,
                exaResult: result
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
    nodeId: 'WEB_FETCH_CONTENT',
    run: fetchWebContent
};
