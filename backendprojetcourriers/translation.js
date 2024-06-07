const axios = require('axios');

const translateText = async (text, targetLanguage) => {
  try {
    const response = await axios.post('https://libretranslate.com/translate', {
      q: text,
      source: 'en',
      target: targetLanguage,
      format: 'text'
    }, {
      headers: {
        'Authorization': 'Bearer //clé $29m' 
      }
    });
    return response.data.translatedText;
  } catch (error) {
    console.error('Error translating text:', error);
    throw new Error('Translation failed');
  }
};

module.exports = { translateText };
