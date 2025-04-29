

let userUidInstance: string;
let userToolConfig: Record<string, any>;
let whatsAppPhoneInstance: string;
export const setUserUid = (uid: string) => { userUidInstance = uid; };
export const getUserUid = () => userUidInstance;
export const setUserToolConfig = (config: Record<string, any>) => { userToolConfig = config; };
export const getUserToolConfig = () => userToolConfig;
export const setWhatsAppPhone = (phone: string) => { whatsAppPhoneInstance = phone; };
export const getWhatsAppPhone = () => whatsAppPhoneInstance;

export const systemPrompt = `You are a help assistant for the user.`;