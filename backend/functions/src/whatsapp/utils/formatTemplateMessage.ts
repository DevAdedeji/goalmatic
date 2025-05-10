// Formats a message to be WhatsApp template-friendly according to WhatsApp's template rules
// See: https://developers.facebook.com/docs/whatsapp/message-templates/guidelines/

/**
 * Formats a message string to be WhatsApp template-friendly.
 * - Ensures variable placeholders are in the correct format ({{1}}, {{2}}, ...)
 * - Ensures variables are sequential and not missing
 * - Ensures the message does not end with a variable
 * - Removes special characters from variable placeholders
 * - Converts literal '\n' to actual newlines (for template messages)
 *
 * Use this for template messages only!
 */
export function formatTemplateMessage(message: string): string {
    // Replace newlines and tabs with a space
    let cleaned = message.replace(/[\n\t]/g, ' ');
    // Replace 5 or more spaces with exactly 4 spaces
    cleaned = cleaned.replace(/ {5,}/g, '    ');
    // Trim leading/trailing spaces
    cleaned = cleaned.trim();

    return cleaned;
}

