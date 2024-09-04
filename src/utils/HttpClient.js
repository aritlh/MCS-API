import fetch from 'node-fetch';
import https from 'https';

// Define the HttpClient class for handling HTTP requests with cookies
class HttpClient {
  // Constructor initializes the HttpClient instance with a base URL and a cookie jar
  constructor(baseURL, cookieJar) {
    this.baseURL = baseURL; // Base URL for the HTTP requests
    this.cookieJar = cookieJar; // Cookie jar for storing and retrieving cookies

    // Creating an HTTPS agent with certificate validation disabled
    this.agent = new https.Agent({
      rejectUnauthorized: false, // Disabling certificate validation (not recommended for production)
    });
  }

  // Method to perform HTTP requests
  async fetch(url, options = {}) {
    // Retrieve cookies for the base URL from the cookie jar
    const cookies = await this.cookieJar.getCookies(this.baseURL);
    // Set up headers for the request, including cookies and User-Agent
    const headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      ...options.headers, // Merge additional headers from options
      Cookie: cookies.join('; '), // Join cookies with '; ' for the Cookie header
    };

    // Perform the HTTP request using fetch
    const response = await fetch(`${this.baseURL}${url}`, {
      ...options, // Merge additional options (method, body, etc.)
      headers, // Set headers for the request
      agent: this.agent, // Use the custom HTTPS agent
    });

    // Retrieve any 'set-cookie' headers from the response
    const setCookieHeaders = response.headers.raw()['set-cookie'];
    if (setCookieHeaders) {
      // Set cookies in the cookie jar based on the 'set-cookie' headers
      for (const header of setCookieHeaders) {
        await this.cookieJar.setCookie(header, this.baseURL);
      }
    }
    // Return the response object
    return response;
  }
}

export default HttpClient;
