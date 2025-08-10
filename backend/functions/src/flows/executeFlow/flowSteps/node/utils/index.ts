import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export type AiStructuredOutput = 'array';

export interface GenerateStructuredDataOptions {
    system: string;
    prompt: unknown;
    schema: any;
    output?: AiStructuredOutput;
    modelName?: string;
    googleApiKey?: string;
}

export const generateStructuredData = async <T = any>({
    system,
    prompt,
    schema,
    output,
    modelName = 'gemini-2.5-flash',
    googleApiKey = process.env.GOOGLE_API_KEY as string,
}: GenerateStructuredDataOptions): Promise<T> => {
    const google = createGoogleGenerativeAI({ apiKey: googleApiKey });

    const normalizedPrompt =
        typeof prompt === 'string' ? prompt : JSON.stringify(prompt, null, 2);

    const base = {
        model: google(modelName),
        system,
        prompt: normalizedPrompt,
        schema,
    } as any;
    if (output) {
        base.output = output;
    }

    const result = await generateObject(base);

    return result.object as T;
};


