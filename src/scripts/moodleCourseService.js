import config from '../config.js';
import express from 'express';
import axios from 'axios';
import https from 'https';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

// Create an instance of Express
const app = express();
const port = 3000;

// Function to get the current directory of the module
const getCurrentDir = () => {
  const url = new URL(import.meta.url);
  return path.dirname(url.pathname); // Return the directory name of the current module
};

// Function to get session data from a JSON file
const getSessionData = () => {
  // Resolve the path to the session file
  const filePath = path.resolve(getCurrentDir(), '../../session.json');
  // Read the file and parse its content as JSON
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
};

// Extract Moodle session and sesskey from session data
const { moodleSession, sesskey } = getSessionData();

// Create an HTTPS agent with certificate validation disabled
const agent = new https.Agent({
  rejectUnauthorized: false, // Disabling certificate validation (not recommended for production)
});

// Define the URL and payload for the API request
const url = `${config.baseURL}/lib/ajax/service.php?sesskey=${sesskey}&info=core_course_get_enrolled_courses_by_timeline_classification`;
const payload = [
  {
    index: 0,
    methodname: 'core_course_get_enrolled_courses_by_timeline_classification',
    args: {
      offset: 0,
      limit: 0,
      classification: 'all',
      sort: 'fullname',
      customfieldname: '',
      customfieldvalue: '',
    },
  },
];

// Define headers for the API request
const headers = {
  'Content-Type': 'application/json',
  Accept: 'application/json, text/javascript, */*; q=0.01',
  'X-Requested-With': 'XMLHttpRequest',
  Cookie: `MoodleSession=${moodleSession}`,
};

// Function to send a POST request and fetch data
const fetchData = async () => {
  try {
    // Make a POST request using axios
    const response = await axios.post(url, payload, {
      headers,
      httpsAgent: agent, // Use the custom HTTPS agent
    });

    // const courses = response.data[0].data.courses;
    // console.log('Courses:', courses);

    // if (courses.length > 0) {
    //   courses.forEach(course => {
    //     console.log(`Course Name: ${course.fullname}`);
    //   });
    // } else {
    //   console.log('No courses found.');
    // }

    // Return the courses from the response data
    return response.data[0].data.courses;
  } catch (error) {
    console.error('Error:', error);
  }
};

app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

// Define a route to handle GET requests for courses
app.get('/courses', async (req, res) => {
  try {
    const courses = await fetchData();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/courses`);
});
