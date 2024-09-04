# Moodle Course Syncer

### URL Target:
- https://e-learning.unpam.ac.id
- https://e-learning.unpam.id

### Auths:
You don't need to set this `session.json` at all mate. it's written dynamically.
```json
{
  "moodleSession": "<dynamic_sessions>",
  "sesskey": "<dynamic_sesskey>"
}
```

In the context of your JSON file and application, `moodleSession` and `sesskey` are referred to as **session identifiers** or **authentication tokens**. Here's a more detailed breakdown of each term:

#### `moodleSession`
- **Type:** Session Identifier
- **Purpose:** Represents a unique session ID assigned by the Moodle server. This session ID is used to maintain a user's session on the Moodle platform, allowing them to stay logged in and access resources without having to reauthenticate with every request.
- **Usage:** Sent in the `Cookie` header of HTTP requests to authenticate and maintain the user's session. For example: `Cookie: MoodleSession=<dynamic_sessions>`

#### `sesskey`
- **Type:** Session Token / Security Token
- **Purpose:** Represents a security token used by Moodle to validate requests, ensuring that the request is coming from an authenticated and authorized source. This token helps to prevent CSRF (Cross-Site Request Forgery) attacks by verifying that the request is made with a valid session.
- **Usage:** Included as a query parameter or in the request payload to authenticate specific actions or requests. For example: `https://example.com/lib/ajax/service.php?sesskey=<dynamic_sesskey>&info=core_course_get_enrolled_courses_by_timeline_classification`

Both values are essential for maintaining secure and authenticated interactions with the Moodle platform. They work together to ensure that your application can successfully make API calls and perform actions on behalf of the user.

## Simple API Documentation
### Overview
This API provides access to a list of courses registered by users from a Moodle instance. It's a simple Express.js server that interacts with the Moodle API to retrieve course data.

### Base URL
The server runs on the following base URL:
```bash
http://localhost:3000/
```


### Endpoints
`GET /courses`
Retrieves the list of courses registered by the user.

**Request**
- Method: `GET`
- URL: `/courses`
- Header:
  - `Content-Type`: `application/json`
  - `Accept`: `application/json, text/javascript, */*; q=0.01`
  - `Cookie`: `MoodleSession=<session_id>`

**Response**
- Status Code:
  - `200 OK`: The request was successful, and the response contains a list of courses.
  - `500 Internal Server Error`: An error occurred while retrieving data.
- `Content-Type`: `application/json`
- Body:
If successful, the response body is a JSON array containing course objects. Each course object contains details about the course.

```js
[
  {
    "id": 123,                                          // Number
    "fullname": "Full Name Example",                    // String
    "shortname": "Short Name",                          // String
    "idnumber": "ID12345",                              // String
    "summary": "This is a summary.",                    // String
    "summaryformat": 1,                                 // Number
    "startdate": 1693564800,                            // Timestamp or other date format <Number>
    "enddate": 1694073600,                              // Timestamp or other date format <Number>
    "visible": true,                                    // Boolean
    "showactivitydate": false,                          // Boolean
    "showcompletioncondition": true,                    // Boolean
    "displayfullname": "Display Full Name Example",     // String
    "viewurl": "http://example.com",                    // String
    "courseimage": "http://example.com/image.png",      // String
    "progress": 75,                                     // Number
    "hasprogress": true,                                // Boolean
    "isfavorite": false,                                // Boolean
    "hidden": false,                                    // Boolean
    "showshortname": true,                              // Boolean
    "coursecategory": "Category Example"                // String
  }
]

```

## How to Contribute
### Fork the Repository
**Fork the Repository**: Go to the repository’s GitHub page and click the "Fork" button at the top right. This will create a copy of the repository in your GitHub account.

### Setup Your Development Environment
**Create a New Branch**: Navigate to the directory of the cloned repository and create a new branch for the feature or fix you are working on:
``` bash
cd repo-name
git checkout -b your-feature-branch
```

Replace `your-feature-branch` with a name that describes the changes you are making.

Rename the `.env-example` file to `.env`

**Prepare Credentials**: Open the `.env` file and add your required credentials or environment variables. If you don’t know what the `REJECTION_USER` variable does, you can ignore it for now.

### Install and Run the Project
**Make the Script Executable**: Ensure the `start-service.sh` script is executable by running:
```bash
chmod +x start-service.sh
```

**Install Dependencies**: Install all required dependencies using npm:
```bash
npm install
```

**Run the Project**: Start the project with the following commands:
```bash
npm run start
npm run service
```

### Make Changes and Submit a Pull Request
**Make Your Changes**: Implement the changes or new features you planned.

**Commit Your Changes**: After making changes, commit them to your branch:
```bash
git add .
git commit -m "Description of the changes you made"
```

**Push Your Changes to GitHub**: Push your branch with the changes to your forked repository:
```bash
git push origin your-feature-branch
```

**Create a Pull Request**: Go to your forked repository on GitHub and create a pull request from your branch (`your-feature-branch`) to the `master` branch of the original repository.

## License
[MIT](LICENSE)
