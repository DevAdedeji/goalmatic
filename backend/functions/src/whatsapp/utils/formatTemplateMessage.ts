

export const formatTemplateMessage = (message: string): string => {
    // Replace newlines and tabs with a space
    let cleaned = message.replace(/[\n\t]/g, ' ');
    // Replace 5 or more spaces with exactly 4 spaces
    cleaned = cleaned.replace(/ {5,}/g, '    ');
    // Trim leading/trailing spaces
    cleaned = cleaned.trim();

    return cleaned;
}

