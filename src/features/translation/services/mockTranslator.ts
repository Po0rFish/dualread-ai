export const mockTranslateToEnglish = async (text: string): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return `[Mock English translation]: ${text}`;
};