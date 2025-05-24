import axios from 'axios';
import { get_WA_TextMessageInput, send_WA_Message } from './sendMessage';


const whatsAppToken = process.env.WHATSAPP_TOKEN;


// Helper function to download image from WhatsApp
async function downloadWhatsAppImage(mediaId: string): Promise<{ buffer: Buffer, contentType: string }> {
    const mediaInfoUrl = `https://graph.facebook.com/v14.0/${mediaId}?access_token=${whatsAppToken}`;
    const mediaInfoResponse = await axios.get(mediaInfoUrl);

    if (mediaInfoResponse.status !== 200) {
        throw new Error(`Failed to fetch media info: ${mediaInfoResponse.statusText}`);
    }

    const mediaInfo = mediaInfoResponse.data as { url: string };
    const mediaUrl = mediaInfo.url;
    if (!mediaUrl) {
        throw new Error('Media URL not found in the media info response');
    }
    // Download the image file using axios with proper headers
    const imageResponse = await axios.get(mediaUrl, {
        responseType: 'arraybuffer',
        headers: {
            'Authorization': `Bearer ${whatsAppToken}`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
        }
    });

    // Return image data as a Buffer
    return {
        buffer: Buffer.from(imageResponse.data),
        contentType: imageResponse.headers['content-type']
    }
}


// Main image processing function
export async function processWhatsAppImage(
    mediaId: string,
    from?: string,
    phone_number_id?: string,
    agentData?: Record<string, any>,
    imageCaption?: string
): Promise<{ isImage: boolean, buffer: Buffer, contentType: string, caption?: string }> {
    try {
        // Send initial "processing" message if recipient info is provided
        if (from && phone_number_id) {
            // You can customize the message based on agent data if needed
            const processingMessage = agentData?.spec?.imageProcessingMessage || 'Processing your image...';
            const initialMsg = get_WA_TextMessageInput(from, processingMessage);
            await send_WA_Message(initialMsg, phone_number_id);
        }

        // Download the image
        const { buffer, contentType } = await downloadWhatsAppImage(mediaId);

        // Return the image buffer with a flag indicating it's an image
        return {
            isImage: true,
            buffer,
            contentType,
            caption: imageCaption
        };
    } catch (error) {
        console.error('Error processing image:', error);

        // Send error message if recipient info is provided
        if (from && phone_number_id) {
            // You can customize error message based on agent data
            const errorMessage = agentData?.spec?.imageErrorMessage || 'Sorry, there was an error processing your image.';
            const errorMsg = get_WA_TextMessageInput(from, errorMessage);
            await send_WA_Message(errorMsg, phone_number_id);
        }

        // Rethrow the error to be handled by the calling function
        throw error;
    }
} 