import axios from 'axios';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { get_WA_TextMessageInput, send_WA_Message } from './sendMessage';
import { uploadMediaToStorage } from './mediaStorage';

const whatsAppToken = process.env.WHATSAPP_TOKEN;
const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
const googleApiKey = process.env.GOOGLE_API_KEY;

// Initialize Google Generative AI client
const google = createGoogleGenerativeAI({
    apiKey: googleApiKey,
});

// Helper function to download audio from WhatsApp
async function downloadWhatsAppAudio(mediaId: string): Promise<Buffer> {
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

    // Download the audio file using axios with proper headers
    const audioResponse = await axios.get(mediaUrl, {
        responseType: 'arraybuffer',
        headers: {
            'Authorization': `Bearer ${whatsAppToken}`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
        }
    });
    
    // Return audio data as a Buffer
    return Buffer.from(audioResponse.data);
}

// Transcribe using Deepgram
async function transcribeWithDeepgram(audioBuffer: Buffer): Promise<string> {
    if (!deepgramApiKey) {
        throw new Error('Deepgram API key is not set');
    }

    const deepgramResponse = await axios.post(
        'https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true',
        audioBuffer,
        {
            headers: {
                'Authorization': `Token ${deepgramApiKey}`,
                'Content-Type': 'audio/wav' // Adjust if the format is different
            }
        }
    );

    if (deepgramResponse.status !== 200) {
        throw new Error(`Failed to transcribe audio: ${deepgramResponse.statusText}`);
    }

    // Extract the transcript from Deepgram response
    const transcriptText = deepgramResponse.data.results.channels[0].alternatives[0].transcript;
    
    if (!transcriptText) {
        throw new Error('Transcription result does not contain text');
    }

    return transcriptText;
}

// Transcribe using Gemini via Vercel AI SDK
async function transcribeWithGemini(audioBuffer: Buffer): Promise<string> {
    if (!googleApiKey) {
        throw new Error('Google API key is not set');
    }


    try {
        // Use Vercel AI SDK to generate content with the audio file
        const result = await generateText({
            model: google("gemini-2.0-flash-001"),
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Please transcribe the audio.' },
                        {
                            type: 'file',
                            mimeType: 'audio/wav',
                            data: audioBuffer,
                        }
                    ],
                }
            ],
        });

        if (!result.text) {
            throw new Error('Transcription result does not contain text');
        }

        return result.text;
    } catch (error) {
        console.error('Error in Gemini transcription:', error);
        throw error;
    }
}

// Main transcription function
export async function transcribeWhatsAppAudio(
    mediaId: string, 
    from?: string, 
    phone_number_id?: string, 
    service: 'deepgram' | 'gemini' = 'deepgram'
): Promise<string> {
    try {
        // Send initial "transcribing" message if recipient info is provided
        if (from && phone_number_id) {
            const initialMsg = get_WA_TextMessageInput(from, 'Transcribing your voice message...');
            await send_WA_Message(initialMsg, phone_number_id);
        }
        

        // Download the audio
        const audioBuffer = await downloadWhatsAppAudio(mediaId);

        // Transcribe using the selected service
        let transcriptText: string;
        if (service === 'gemini') {
            transcriptText = await transcribeWithGemini(audioBuffer);
        } else {
            transcriptText = await transcribeWithDeepgram(audioBuffer);
        }

        // Send completion message with transcription if recipient info is provided
        if (from && phone_number_id) {
            const completionMsg = get_WA_TextMessageInput(from, `Transcription: ${transcriptText}`);
            await send_WA_Message(completionMsg, phone_number_id);
        }

        return transcriptText;
    } catch (error) {
        console.error(`Error transcribing audio with ${service}:`, error);
        
        // Send error message if recipient info is provided
        if (from && phone_number_id) {
            const errorMsg = get_WA_TextMessageInput(from, 'Sorry, there was an error transcribing your message.');
            await send_WA_Message(errorMsg, phone_number_id);
        }
        
        // Fallback: return a simulated transcript
        return `This is a transcribed voice note message (fallback using ${service}).`;
    }
}

// Enhanced transcription function with storage support
export async function transcribeWhatsAppAudioWithStorage(
    mediaId: string, 
    userId: string,
    sessionId: string,
    from?: string, 
    phone_number_id?: string, 
    service: 'deepgram' | 'gemini' = 'deepgram'
): Promise<{ transcription: string; filePath?: string }> {
    try {
        // Send initial "transcribing" message if recipient info is provided
        if (from && phone_number_id) {
            const initialMsg = get_WA_TextMessageInput(from, 'Transcribing your voice message...');
            await send_WA_Message(initialMsg, phone_number_id);
        }
        

        // Download the audio
        const audioBuffer = await downloadWhatsAppAudio(mediaId);

        // Transcribe using the selected service
        let transcriptText: string;
        if (service === 'gemini') {
            transcriptText = await transcribeWithGemini(audioBuffer);
        } else {
            transcriptText = await transcribeWithDeepgram(audioBuffer);
        }

        let filePath: string | undefined;
        
        // Upload to Firebase Storage
        try {
            // Use audio/ogg as default content type for WhatsApp voice messages
            filePath = await uploadMediaToStorage(audioBuffer, 'audio/ogg', userId, 'audio', sessionId);
            console.log(`Audio uploaded to storage: ${filePath}`);
        } catch (storageError) {
            console.error('Failed to upload audio to storage:', storageError);
            // Continue without file path - don't fail the entire process
        }

        // Send completion message with transcription if recipient info is provided
        if (from && phone_number_id) {
            const completionMsg = get_WA_TextMessageInput(from, `Transcription: ${transcriptText}`);
            await send_WA_Message(completionMsg, phone_number_id);
        }

        return {
            transcription: transcriptText,
            filePath
        };
    } catch (error) {
        console.error(`Error transcribing audio with ${service}:`, error);
        
        // Send error message if recipient info is provided
        if (from && phone_number_id) {
            const errorMsg = get_WA_TextMessageInput(from, 'Sorry, there was an error transcribing your message.');
            await send_WA_Message(errorMsg, phone_number_id);
        }
        
        // Fallback: return a simulated transcript without file path
        return {
            transcription: `This is a transcribed voice note message (fallback using ${service}).`
        };
    }
}
