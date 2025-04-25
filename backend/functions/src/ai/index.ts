

let userUidInstance: string;
let userToolConfig: Record<string, any>;
export const setUserUid = (uid: string) => { userUidInstance = uid; };
export const getUserUid = () => userUidInstance;
export const setUserToolConfig = (config: Record<string, any>) => { userToolConfig = config; };
export const getUserToolConfig = () => userToolConfig;

export const systemPrompt = `You are a help assistant for the user.`;