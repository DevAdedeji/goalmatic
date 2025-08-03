import { WorkflowContext } from "@upstash/workflow";
import { FlowNode } from "../../../type";
import { processMentionsProps } from "../../../../../utils/processMentions";
import { generateAiFlowContext } from "../../../../../utils/generateAiFlowContext";

const callWebApi = async (context: WorkflowContext, step: FlowNode, previousStepResult: any) => {
    try {
        // Process all string fields in propsData first
        const processedProps = processMentionsProps(step.propsData, previousStepResult);
        
        // Generate AI content for AI-enabled fields and get updated props
        const { processedPropsWithAiContext } = await generateAiFlowContext(step, processedProps);
        
        const { 
            url,
            method = 'GET',
            headers = {},
            body,
            timeout = 30000,
            followRedirects = true,
            responseFormat = 'json' // json, text, blob
        } = processedPropsWithAiContext;

        if (!url) {
            return {
                success: false,
                error: 'URL is required'
            };
        }

        // Validate URL format
        let validUrl: string;
        try {
            const urlObj = new URL(url);
            validUrl = urlObj.toString();
        } catch (error) {
            return {
                success: false,
                error: `Invalid URL format: ${url}`
            };
        }

        // Validate HTTP method
        const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
        const upperMethod = method.toUpperCase();
        if (!validMethods.includes(upperMethod)) {
            return {
                success: false,
                error: `Invalid HTTP method: ${method}. Supported methods: ${validMethods.join(', ')}`
            };
        }

        // Prepare headers
        let requestHeaders: Record<string, string> = {};
        
        // Parse headers if it's a string (JSON format)
        if (typeof headers === 'string') {
            try {
                requestHeaders = JSON.parse(headers);
            } catch (error) {
                return {
                    success: false,
                    error: 'Invalid headers format. Headers must be valid JSON object or object.'
                };
            }
        } else if (typeof headers === 'object' && headers !== null) {
            requestHeaders = { ...headers };
        }

        // Set default Content-Type for POST/PUT/PATCH requests with body
        if (['POST', 'PUT', 'PATCH'].includes(upperMethod) && body && !requestHeaders['Content-Type'] && !requestHeaders['content-type']) {
            requestHeaders['Content-Type'] = 'application/json';
        }

        // Prepare request body
        let requestBody: string | undefined;
        if (body && ['POST', 'PUT', 'PATCH'].includes(upperMethod)) {
            if (typeof body === 'string') {
                requestBody = body;
            } else if (typeof body === 'object') {
                // If Content-Type is application/json or not set, stringify the object
                const contentType = requestHeaders['Content-Type'] || requestHeaders['content-type'] || '';
                if (contentType.includes('application/json') || !contentType) {
                    requestBody = JSON.stringify(body);
                } else {
                    requestBody = String(body);
                }
            } else {
                requestBody = String(body);
            }
        }

        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // Prepare fetch options
        const fetchOptions: RequestInit = {
            method: upperMethod,
            headers: requestHeaders,
            signal: controller.signal,
            redirect: followRedirects ? 'follow' : 'manual'
        };

        // Add body for methods that support it
        if (requestBody && ['POST', 'PUT', 'PATCH'].includes(upperMethod)) {
            fetchOptions.body = requestBody;
        }

        // Make the API request
        const startTime = Date.now();
        let response: Response;
        
        try {
            response = await fetch(validUrl, fetchOptions);
        } catch (error: any) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                return {
                    success: false,
                    error: `Request timeout after ${timeout}ms`
                };
            }
            
            return {
                success: false,
                error: `Network error: ${error.message || 'Failed to make request'}`
            };
        }
        
        clearTimeout(timeoutId);
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        // Extract response data based on format
        let responseData: any;
        let responseText: string = '';
        
        try {
            if (responseFormat === 'json') {
                responseText = await response.text();
                if (responseText.trim()) {
                    try {
                        responseData = JSON.parse(responseText);
                    } catch (parseError) {
                        // If JSON parsing fails, return as text
                        responseData = responseText;
                    }
                } else {
                    responseData = null;
                }
            } else if (responseFormat === 'text') {
                responseData = await response.text();
                responseText = responseData;
            } else if (responseFormat === 'blob') {
                const blob = await response.blob();
                responseData = {
                    size: blob.size,
                    type: blob.type,
                    // Note: We can't return the actual blob data in a workflow context
                    // This would need special handling for binary data
                    message: 'Binary data received (blob handling not implemented in workflow context)'
                };
                responseText = `Binary data: ${blob.size} bytes, type: ${blob.type}`;
            }
        } catch (error: any) {
            return {
                success: false,
                error: `Failed to parse response: ${error.message}`
            };
        }

        // Prepare response headers
        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
            responseHeaders[key] = value;
        });

        // Determine if the request was successful
        const isSuccess = response.ok; // status 200-299

        return {
            success: isSuccess,
            payload: {
                ...processedPropsWithAiContext,
                response: {
                    status: response.status,
                    statusText: response.statusText,
                    headers: responseHeaders,
                    data: responseData,
                    text: responseText,
                    url: response.url,
                    redirected: response.redirected,
                    responseTime: responseTime,
                    ok: response.ok
                },
                request: {
                    url: validUrl,
                    method: upperMethod,
                    headers: requestHeaders,
                    body: requestBody,
                    timeout: timeout
                }
            },
            // Include error information for non-2xx responses
            ...((!isSuccess) && {
                error: `HTTP ${response.status}: ${response.statusText}`,
                statusCode: response.status
            })
        };

    } catch (error: any) {
        console.error('Error calling web API:', error);
        return {
            success: false,
            error: error?.message || 'Failed to call web API'
        };
    }
};

export const callWebApiNode = {
    nodeId: 'WEB_API_CALL',
    run: callWebApi
};
