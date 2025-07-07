export const retryWithExponentialBackoff = async <T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> => {
    let lastError: Error;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error: any) {
            lastError = error;
            
            // Check if it's a retryable error (rate limiting, server errors)
            const isRetryable = 
                error.code === 429 || // Too Many Requests
                error.code === 500 || // Internal Server Error
                error.code === 502 || // Bad Gateway
                error.code === 503 || // Service Unavailable
                error.code === 504;   // Gateway Timeout
            
            if (!isRetryable || attempt === maxRetries - 1) {
                throw error;
            }
            
            // Calculate delay with exponential backoff and jitter
            const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
            console.log(`Gmail API rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
            
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    throw lastError!;
};

export const handleGmailApiError = (error: any) => {
    console.error('Gmail API Error:', error);
    
    // Map specific Gmail API errors to user-friendly messages
    switch (error.code) {
        case 401:
            return 'Gmail authentication expired. Please reconnect your Gmail account.';
        case 403:
            if (error.message?.includes('rate limit')) {
                return 'Gmail API rate limit exceeded. Please try again in a few moments.';
            }
            return 'Insufficient permissions for Gmail access.';
        case 404:
            return 'The requested email or resource was not found.';
        case 429:
            return 'Too many requests to Gmail API. Please try again later.';
        default:
            return `Gmail API error: ${error.message || 'Unknown error occurred'}`;
    }
}; 