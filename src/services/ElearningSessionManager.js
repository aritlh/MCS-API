import { CookieJar } from 'tough-cookie';
import { promisify } from 'util';

import HtmlParser from '../utils/HtmlParser.js';
import HttpClient from '../utils/HttpClient.js';
import config from '../config.js';

// Define the ElearningSessionManager class for managing e-learning sessions
class ElearningSessionManager {
  // Constructor initializes the session manager with user credentials
  constructor(username, password) {
    this.baseURL = config.baseURL; // Base URL for the e-learning platform
    this.username = username; // Username for login
    this.password = password; // Password for login
    this.cookieJar = new CookieJar(); // Create a new CookieJar instance for managing cookies
    // Promisify methods for setting and getting cookies from the cookie jar
    this.setCookie = promisify(this.cookieJar.setCookie.bind(this.cookieJar));
    this.getCookies = promisify(this.cookieJar.getCookies.bind(this.cookieJar));
    // Create an instance of HttpClient with baseURL and cookieJar
    this.httpClient = new HttpClient(this.baseURL, this.cookieJar);
    // Set up an interval to refresh the session every 30 minutes
    this.sessionRefreshInterval = setInterval(
      () => this.refreshSession(),
      30 * 60 * 1000,
    );
  }

  // Method to get the Moodle session cookie value
  getMoodleSession() {
    return this.cookieJar
      .getCookiesSync(this.baseURL) // Synchronously get all cookies for the base URL
      .find(cookie => cookie.key === 'MoodleSession')?.value; // Find and return the MoodleSession cookie value
  }

  // Method to get the login token from the login page
  async getLoginToken() {
    try {
      // Fetch the login page
      const response = await this.httpClient.fetch('/login/index.php');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse the HTML response to extract the login token
      const html = await response.text();
      return HtmlParser.getLoginToken(html);
    } catch (error) {
      console.error('Error getting login token:', error.message);
      return null;
    }
  }

  // Method to log in using the provided username, password, and login token
  async login() {
    const loginToken = await this.getLoginToken();
    if (!loginToken) {
      console.error('Failed to get login token');
      return false;
    }

    const payload = new URLSearchParams({
      username: this.username,
      password: this.password,
      logintoken: loginToken,
    });

    try {
      // Send login request with POST method
      const response = await this.httpClient.fetch('/login/index.php', {
        method: 'POST',
        body: payload,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'manual', // Prevent automatic redirection
      });

      console.log('Login response status:', response.status);
      console.log('Login response headers:', response.headers);

      // Check if login was successful (status 303 indicates redirection)
      const loginSuccess = response.status === 303;
      const moodleSession = this.getMoodleSession();

      return { success: loginSuccess, moodleSession };
    } catch (error) {
      console.error('Login failed:', error.message);
      return { success: false, moodleSession: null };
    }
  }

  // Method to refresh the session by checking the dashboard page
  async refreshSession() {
    const dashboardHtml = await this.fetchContent('/my/');
    if (dashboardHtml && dashboardHtml.includes('loginform')) {
      console.log('Session expired. Logging in again...');
      return await this.login();
    }
    return true;
  }

  // Method to fetch content with retry mechanism in case of session expiration
  async fetchContent(url, retries = 3) {
    try {
      const response = await this.httpClient.fetch(url);
      if (response.url.includes('login')) {
        if (retries > 0) {
          console.log('Session expired. Logging in again...');
          const loginSuccess = await this.login();
          if (loginSuccess) {
            return this.fetchContent(url, retries - 1);
          }
        }
        throw new Error('Failed to re-login after multiple attempts');
      }
      return await response.text();
    } catch (error) {
      console.error('Error fetching content:', error.message);
      if (retries > 0) {
        console.log(`Retrying... (${retries} attempts left)`);
        return this.fetchContent(url, retries - 1);
      }
      return null;
    }
  }

  // Cleanup method to clear the session refresh interval
  cleanup() {
    clearInterval(this.sessionRefreshInterval);
  }
}

export default ElearningSessionManager;
