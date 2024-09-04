import { parse } from 'node-html-parser';

// Define the HtmlParser class with static methods for parsing HTML content
class HtmlParser {
  // Static method to extract the login token from HTML
  static getLoginToken(html) {
    const root = parse(html); // Parse the HTML string into a root element
    // Query the root element for an input element with name 'logintoken'
    const loginToken = root
      .querySelector('input[name="logintoken"]')
      ?.getAttribute('value'); // Get the value attribute of the input element
    if (!loginToken) {
      throw new Error('Login token not found in the page');
    }
    return loginToken;
  }

  // Static method to extract course names from HTML
  static parseCourses(html) {
    const root = parse(html); // Parse the HTML string into a root element
    // Query the root element for all elements with the class 'coursename'
    return root
      .querySelectorAll('.coursename')
      .map(el => el.textContent.trim());
  }
}

export default HtmlParser;
