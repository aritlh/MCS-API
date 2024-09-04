import * as cheerio from 'cheerio';

import config from '../config.js';
import axios from 'axios';
import https from 'https';
import fs from 'fs';

// Helper function to create a delay (used for retry attempts)
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Function to view content and handle session key with retry mechanism
const viewContent = async (sessionKey, retries = 3) => {
  // Loop for retrying the request up to the specified number of retries
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      await delay(2000);

      // Create an HTTPS agent with certificate validation disabled
      const agent = new https.Agent({
        rejectUnauthorized: false, // Disabling certificate validation (not recommended for production)
      });

      // Make an HTTP GET request to fetch content from the specified URL
      const response = await axios.get(`${config.baseURL}/my/`, {
        withCredentials: true, // Include credentials (cookies) in the request
        headers: {
          Cookie: `MoodleSession=${sessionKey}`,
          'User-Agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
          Referer: `${config.baseURL}/login/index.php`,
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'same-origin',
          'Sec-Fetch-User': '?1',
          'Sec-GPC': '1',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'max-age=0',
        },
        httpsAgent: agent, // Use the custom HTTPS agent
      });

      // Log the HTTP response status and headers
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // Log the first 1000 characters of the response body for debugging
      console.log(
        'Response body (first 1000 chars):',
        response.data.substring(0, 1000),
      );

      // Load the response body into Cheerio for HTML parsing
      const $ = cheerio.load(response.data);

      console.log(
        '\n========================[ INFO ]========================\n',
      );
      // Extract and log the page title
      const pageTitle = $('title').text();
      console.log(`Page title (${pageTitle}) rendered successfully ✅`);

      // Extract 'sesskey' from script tags in the HTML
      const scriptTags = $('script');
      let sesskey = '';

      scriptTags.each((index, script) => {
        const scriptContent = $(script).html();
        // Use regex to find 'sesskey' in the script content
        const match = scriptContent.match(/"sesskey":"([A-Za-z0-9]+)"/);
        if (match) {
          sesskey = match[1]; // Extract sesskey value
          return false; // Exit loop once sesskey is found
        }
      });

      if (sesskey) {
        console.log('Extracted sesskey:', sesskey);
        console.log('========================================================');

        // Read session data from JSON file
        const sessionData = JSON.parse(
          fs.readFileSync('session.json', 'utf-8'),
        );

        // Update sesskey in session data
        sessionData.sesskey = sesskey;

        // Write updated session data back to JSON file
        fs.writeFileSync(
          'session.json',
          JSON.stringify(sessionData, null, 2),
          'utf-8',
        );
      } else {
        console.log('sesskey not found in the HTML.');
      }

      return; // Exit function if successful
    } catch (error) {
      // Log the error and response details if available
      console.error(`Percobaan ${attempt + 1} gagal:`, error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }

      // If this was the last attempt, log the failure
      if (attempt === retries - 1) {
        console.error('Semua percobaan gagal.');
      }
    }
  }
};

// Read session data from JSON file
const sessionData = JSON.parse(fs.readFileSync('session.json', 'utf-8'));
// Extract the session key
const sessionKey = sessionData.moodleSession;

// Call the viewContent function with the session key
viewContent(sessionKey);
