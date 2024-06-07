import axios from 'axios';

const translateText = async (text, targetLanguage) => {
  try {
    const response = await axios.post('http://localhost:3006/translate', {
      text,
      targetLanguage
    });
    return response.data.translatedText;
  } catch (error) {
    console.error('Error translating text:', error);
    throw new Error('Translation failed');
  }
};

export { translateText };
