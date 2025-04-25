declare module '@vercel/ai' {
  export interface GenerateTextOptions {
    model: string;
    messages: { role: string; content: string }[];
    prompt: { text: string }[];
    tools?: any;
    system?: any;
  }

  export function generateText(options: GenerateTextOptions): Promise<string>;
} 