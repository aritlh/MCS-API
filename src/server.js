import 'dotenv/config';

import ElearningSessionManager from './services/ElearningSessionManager.js';
import fs from 'fs';

const main = async () => {
  // Creating an instance of ElearningSessionManager with login credentials from environment variables
  const sessionManager = new ElearningSessionManager(
    process.env.NIM_LOGIN,
    process.env.PASS_LOGIN,
    // process.env.REJECTION_USER,
  );

  try {
    // Calling the login method from sessionManager and awaiting the result
    const { success, moodleSession } = await sessionManager.login();
    // Checking if login was successful
    if (success) {
      console.log(
        '\n========================[ INFO ]========================\n',
      );
      console.log('Successful login ✅');
      console.log('Extracted MoodleSession:', moodleSession);
      console.log('========================================================');

      // Saving the Moodle session to a JSON file
      fs.writeFileSync(
        'session.json',
        JSON.stringify({ moodleSession }),
        'utf8',
      );

      console.log('\nServer running. Press Ctrl+C to stop.');
    } else {
      console.log('Login failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error during login:', error);
    process.exit(1);
  }
};

// Running the main function and handling any unhandled errors
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

// Handling SIGINT signal (Ctrl+C) for graceful application shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  process.exit();
});
