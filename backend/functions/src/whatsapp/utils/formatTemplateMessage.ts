export const formatTemplateMessage = (message: string): string => {
    // Replace all types of newlines (\r\n, \r, \n), tabs, and other whitespace with single space
    let cleaned = message.replace(/[\r\n\t\v\f]+/g, ' ');

    // Replace any sequence of 5 or more consecutive spaces with exactly 4 spaces
    cleaned = cleaned.replace(/ {5,}/g, '    ');

    // Trim leading/trailing spaces
    cleaned = cleaned.trim();

    return cleaned;
}

