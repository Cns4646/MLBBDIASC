const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrapeMobileLegends() {
  try {
    // URL to scrape data from
    const url = "https://www.smile.one/merchant/mobilelegends";
    
    // Fetch the HTML content
    const response = await axios.get(url);
    const htmlContent = response.data;
    
    // Load the HTML content into cheerio (equivalent to DOMDocument in PHP)
    const $ = cheerio.load(htmlContent);
    
    // Define a manual translation mapping (Portuguese to English)
    const translations = {
      'Olá': 'Hello',
      'Bem-vindo': 'Welcome',
      'Como você está?': 'How are you?',
      'Tudo bem?': 'Is everything okay?',
      'Obrigado': 'Thank you',
      'De nada': 'You\'re welcome',
      'Passe Semanal de Diamante': 'Weekly Diamond Pass',
      'Passagem do crepúsculo': 'Twilight Passage'
      // Add more translations here
    };
    
    // Find all li elements inside the .PcDiamant-ul class
    const data = [];
    $('ul.PcDiamant-ul li').each((index, element) => {
      // Get the id attribute
      const liId = $(element).attr('id');
      
      // Get the text inside the p tag
      let pText = $(element).find('p').text().trim();
      
      // Manually translate the text using the dictionary
      if (pText) {
        // Replace the text using the translation dictionary
        Object.keys(translations).forEach(sourceText => {
          if (pText.includes(sourceText)) {
            pText = pText.replace(sourceText, translations[sourceText]);
          }
        });
      }
      
      // Add the id and translated text to the data array
      data.push({
        id: liId,
        text: pText
      });
    });
    
    // Use regex to find the info variable
    const infoRegex = /info\s*=\s*JSON\.parse\('(.*?)'\)/s;
    const matches = htmlContent.match(infoRegex);
    
    let dataJson = null;
    if (matches && matches[1]) {
      // Get the JSON string
      const jsonString = matches[1];
      
      // Decode the JSON string
      try {
        dataJson = JSON.parse(jsonString);
      } catch (e) {
        console.error('Error parsing JSON:', e);
      }
    }
    
    // Create the result object
    const result = {
      info: data,
      data: dataJson
    };
    
    // Convert to JSON and output
    console.log(JSON.stringify(result, null, 2));
    
    // Optionally, write to a file
    fs.writeFileSync('mobile_legends_data.json', JSON.stringify(result, null, 2));
    
    return result;
    
  } catch (error) {
    console.error('Error:', error);
    return { error: 'An error occurred while scraping the data' };
  }
}

// Run the function
scrapeMobileLegends();
