const stringifyReplacementValue = (value: any): string => {
    if (value === null || value === undefined) return '';

    const primitiveTypes = ['string', 'number', 'boolean'];
    if (primitiveTypes.includes(typeof value)) return String(value);

    if (Array.isArray(value)) {
        if (value.length === 0) return '';
        const allObjects = value.every(
            (item) => item && typeof item === 'object' && !Array.isArray(item)
        );
        if (allObjects) {
            // Compact JSON per item, comma separated
            return value.map((item) => {
                try { return JSON.stringify(item); } catch { return String(item); }
            }).join(', ');
        }
        // Mixed/primitives: stringify each then join
        return value.map((item) => stringifyReplacementValue(item)).join(', ');
    }

    if (typeof value === 'object') {
        try { return JSON.stringify(value); } catch { return String(value); }
    }

    return String(value);
};

export const processMentionTextarea = (text: string, previousStepResult: any): string => {
    // Part 1: Process mention spans using replace with callback
    const mentionRegex = /<span[^>]*data-type="mention"[^>]*data-id="([^"]+)"[^>]*>.*?<\/span>/g;

    let processedText = text.replace(mentionRegex, (match, dataId) => {
        const parts = dataId.match(/^([^[]+)\[([^\]]+)\]$/);
        if (parts) {
            const stepId = parts[1];
            const payloadKey = parts[2];

            // Access the data from previousStepResult
            let replacementValue = previousStepResult?.[stepId]?.payload?.[payloadKey];

            // Fallback: if not found (e.g., step index changed), try resolving by node id suffix
            if (replacementValue === undefined) {
                const suffixMatch = stepId.match(/^(?:step-\d+|trigger)-(.+)$/);
                const nodeIdSuffix = suffixMatch ? suffixMatch[1] : undefined;
                if (nodeIdSuffix && previousStepResult) {
                    for (const key in previousStepResult) {
                        if (typeof key === 'string' && key.endsWith(`-${nodeIdSuffix}`)) {
                            const candidate = previousStepResult[key]?.payload?.[payloadKey];
                            if (candidate !== undefined) {
                                replacementValue = candidate;
                                break;
                            }
                        }
                    }
                }
            }

            return replacementValue !== undefined ? stringifyReplacementValue(replacementValue) : '';
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

    // Part 3b: Fallback token replacement for patterns like @step-1-NODEKEY-payloadKey
    // Example: @step-1-TABLE_CREATE-totalRecordsCreated
    processedText = processedText.replace(/@(step|trigger)-([\w-]+)-([\w]+)/g, (_match, prefix, groupRest, payloadKey) => {
        const stepId = `${prefix}-${groupRest}`; // e.g., step-1-TABLE_CREATE
        let replacementValue = previousStepResult?.[stepId]?.payload?.[payloadKey];

        // Fallback: attempt to resolve by node id suffix (drop the dynamic index if present)
        if (replacementValue === undefined && previousStepResult) {
            const nodeIdSuffix = groupRest.replace(/^\d+-/, '');
            for (const key in previousStepResult) {
                if (typeof key === 'string' && key.endsWith(`-${nodeIdSuffix}`)) {
                    const candidate = previousStepResult[key]?.payload?.[payloadKey];
                    if (candidate !== undefined) {
                        replacementValue = candidate;
                        break;
                    }
                }
            }
        }

        return replacementValue !== undefined ? stringifyReplacementValue(replacementValue) : '';
    });

    // Part 4: Clean up trailing whitespace but preserve intentional multiple newlines
    processedText = processedText
        .replace(/[ \t\v\f]+\n/g, '\n')      // Remove spaces/tabs before newlines
        .replace(/\n{4,}/g, '\n\n\n')         // Hard cap extremely long blank blocks
        .trimEnd();                               // Keep leading newlines, trim only end

    return processedText;
};

// New function to process all string fields in propsData
export const processMentionsProps = (propsData: Record<string, any>, previousStepResult: any): Record<string, any> => {
    const processed: Record<string, any> = {};
    const mentionRegex = /<span[^>]*data-type="mention"[^>]*data-id="([^"]+)"[^>]*>.*?<\/span>/g;

    for (const key in propsData) {
        const value = propsData[key];

        if (typeof value === 'string') {
            // Detect if the value is exactly a single mention (optionally wrapped in whitespace/other tags)
            const matches = Array.from(value.matchAll(mentionRegex));

            if (matches.length === 1) {
                // Remove the single mention span and any leftover HTML/whitespace to verify it's mention-only
                const withoutMention = value.replace(mentionRegex, '');
                const cleaned = withoutMention
                    .replace(/<[^>]*>/g, '') // remove all remaining HTML
                    .replace(/&nbsp;/gi, ' ')
                    .trim();

                if (cleaned.length === 0) {
                    // Single mention only → return RAW referenced value if available
                    const dataId = matches[0][1];
                    const parts = dataId.match(/^([^[]+)\[([^\]]+)\]$/);
                    if (parts) {
                        const stepId = parts[1];
                        const payloadKey = parts[2];
                        const rawValue = previousStepResult?.[stepId]?.payload?.[payloadKey];

                        if (rawValue !== undefined) {
                            processed[key] = rawValue;
                            continue; // handled
                        }
                    }
                }
            }

            // Default behavior: convert mentions inside text to strings
            processed[key] = processMentionTextarea(value, previousStepResult);
        } else {
            processed[key] = value;
        }
    }

    return processed;
}; 