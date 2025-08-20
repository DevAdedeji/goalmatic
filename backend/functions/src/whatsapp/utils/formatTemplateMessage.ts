export const formatTemplateMessage = (message: string): string => {
    // Replace all types of newlines (\r\n, \r, \n), tabs, and other whitespace with single space
    let cleaned = message.replace(/[\r\n\t\v\f]+/g, ' ');

    // Replace any sequence of 5 or more consecutive spaces with exactly 4 spaces
    cleaned = cleaned.replace(/ {5,}/g, '    ');

    // Trim leading/trailing spaces
    cleaned = cleaned.trim();

    // Clamp to WhatsApp template parameter limits (body variable text typically <= 1024 chars)
    const MAX_TEMPLATE_PARAM_CHARS = 750;
    if (cleaned.length > MAX_TEMPLATE_PARAM_CHARS) {
        cleaned = cleaned.slice(0, MAX_TEMPLATE_PARAM_CHARS);
    }

    return cleaned;
}

