export const processMentionTextarea = (text: string, previousStepResult: any): string => {
    // Part 1: Process mention spans using replace with callback
    const mentionRegex = /<span[^>]*data-type="mention"[^>]*data-id="([^"]+)"[^>]*>.*?<\/span>/g;
    
    let processedText = text.replace(mentionRegex, (match, dataId) => {

        
        const parts = dataId.match(/^([^[]+)\[([^\]]+)\]$/);
        if (parts) {
            const stepId = parts[1];
            const payloadKey = parts[2];
            
            // Access the data from previousStepResult
            const replacementValue = previousStepResult?.[stepId]?.payload?.[payloadKey];
            return replacementValue !== undefined ? String(replacementValue) : '';
        }
        return match; // Return original if parsing fails
    });

    // Part 2: Convert HTML formatting to text equivalents
    processedText = processedText
        .replace(/<br\s*\/?>/gi, '\n')           // <br> and <br/> to newlines
        .replace(/<\/p>/gi, '\n')                // </p> to newlines
        .replace(/<p[^>]*>/gi, '')               // Remove opening <p> tags
        .replace(/<\/div>/gi, '\n')              // </div> to newlines
        .replace(/<div[^>]*>/gi, '')             // Remove opening <div> tags
        .replace(/&nbsp;/gi, ' ')                // Non-breaking spaces to regular spaces
        .replace(/&amp;/gi, '&')                 // HTML entities
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'");

    // Part 3: Remove any remaining HTML tags
    const htmlRegex = /<[^>]*>/g;
    processedText = processedText.replace(htmlRegex, '');

    // Part 4: Clean up extra whitespace and newlines
    processedText = processedText
        .replace(/\n\s*\n/g, '\n')               // Multiple newlines to single newline
        .trim();                                 // Remove leading/trailing whitespace

    return processedText;
};

// New function to process all string fields in propsData
export const processMentionsProps = (propsData: Record<string, any>, previousStepResult: any): Record<string, any> => {
    const processed: Record<string, any> = {};
    for (const key in propsData) {
        if (typeof propsData[key] === 'string') {
            processed[key] = processMentionTextarea(propsData[key], previousStepResult);
        } else {
            processed[key] = propsData[key];
        }
    }
    return processed;
}; 