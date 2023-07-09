# API Documentation for ClassBridge

This is the documentation for the API endpoints provided by the server.

## Base URL

The base URL for all API endpoints is: `http://localhost:9002/api`

## Authentication

All authenticated endpoints require a valid JSON Web Token (JWT) in the `Authorization` header.

Example header: 
```
Authorization: Bearer <token>
```

To obtain a token, use the login/signup endpoints for teachers and students.

**Note:** Replace `<token>` with the actual JWT token obtained during authentication.

## Endpoints

### Teacher Signup

- **URL:** `/teacher/signup`
- **Method:** `POST`
- **Description:** Creates a new teacher account.
- **Request Body:**

| Field       | Type   | Description                 |
|-------------|--------|-----------------------------|
| `first_name` | String | First name of the teacher    |
| `last_name`  | String | Last name of the teacher     |
| `email`      | String | Email address of the teacher |
| `password`   | String | Password for the teacher     |

- **Response:**
  - Status: `200 OK`
  - Content-Type: `application/json`
  - Body:

```json
{
  "message": "Teacher signed up successfully",
  "teacher_id": <teacher_id>,
  "token": "<token>"
}
```

### Teacher Login

- **URL:** `/teacher/login`
- **Method:** `POST`
- **Description:** Authenticates a teacher.
- **Request Body:**

| Field    | Type   | Description                 |
|----------|--------|-----------------------------|
| `email`  | String | Email address of the teacher |
| `password` | String | Password for the teacher     |

- **Response:**
  - Status: `200 OK`
  - Content-Type: `application/json`
  - Body:

```json
{
  "message": "Teacher logged in successfully",
  "teacher_id": <teacher_id>,
  "token": "<token>"
}
```

### Create a Class

- **URL:** `/classes`
- **Method:** `POST`
- **Description:** Creates a new class.
- **Authentication:** Required (Teacher role)
- **Request Body:**

| Field       | Type   | Description                   |
|-------------|--------|-------------------------------|
| `title`     | String | Title of the class            |
| `description` | String | Description of the class      |

- **Response:**
  - Status: `200 OK`
  - Content-Type: `application/json`
  - Body:

```json
{
  "message": "Class created successfully",
  "class_id": <class_id>
}
```

### Update a Class

- **URL:** `/classes/:class_id`
- **Method:** `PUT`
- **Description:** Updates an existing class.
- **Authentication:** Required (Teacher role)
- **Request URL Parameters:**

| Parameter   | Description                  |
|-------------|------------------------------|
| `class_id`  | ID of the class to be updated |

- **Request Body:**

| Field       | Type   | Description                   |
|-------------|--------|-------------------------------|
| `title`     | String | Updated title of the class     |
| `description` | String | Updated description of the class |

- **Response:**
  - Status: `200 OK`
  - Content-Type: `application/json`
  - Body:

```json
{
  "message": "Class updated successfully",
  "class_id": <class_id>
}
```

### Delete a Class

- **URL:** `/classes/:class_id`
- **Method:** `DELETE`
- **Description:** Deletes an existing class.
- **Authentication:** Required (Teacher role)
- **Request URL Parameters:**

| Parameter   | Description                  |
|-------------|------------------------------|
| `class_id`  | ID of the class to be deleted |

- **Response:**
  - Status: `200 OK`
  - Content-Type: `application/json`
  - Body:

```json
{
  "message": "Class deleted successfully",
  "class_id": <class_id>
}
```

### Approve Student's Request to Join a Class

- **URL:** `/classes/:class_id/approve/:student_id`
- **Method:** `POST`
- **Description:** Approves a student's request to join a class.
- **Authentication:** Required (Teacher role)
- **Request URL Parameters:**

| Parameter    | Description                   |
|--------------|-------------------------------|
| `class_id`   | ID of the class               |
| `student_id` | ID of the student             |

- **Response:**
  - Status: `200 OK`
  - Content-Type: `application/json`
  - Body:

```json
{
  "message": "Request approved successfully"
}
```

### Student Signup

- **URL:** `/student/signup`
- **Method:** `POST`
- **Description:** Creates a new student account.
- **Request Body:**

| Field       | Type   | Description                   |
|-------------|--------|-------------------------------|
| `first_name` | String | First name of the student     |
| `last_name`  | String | Last name of the student      |
| `email`      | String | Email address of the student  |
| `password`   | String | Password for the student      |

- **Response:**
  - Status: `200 OK`
  - Content-Type: `application/json`
  - Body:

```json
{
  "message": "Student signed up successfully",
  "student_id": <student_id>,
  "token": "<token>"
}
```

### Student Login

- **URL:** `/student/login`
- **Method:** `POST`
- **Description:** Authenticates a student.
- **Request Body:**

| Field    | Type   | Description                   |
|----------|--------|-------------------------------|
| `email`  | String | Email address of the student  |
| `password` | String | Password for the student      |

- **Response:**
  - Status: `200 OK`
  - Content-Type: `application/json`
  - Body:

```json
{
  "message": "Student logged in successfully",
  "student_id": <student_id>,
  "token": "<token>"
}
```

### Student Request to Join a Class

- **URL:** `/classes/:class_id/request`
- **Method:** `POST`
- **Description:** Sends a request to join a class as a student.
- **Authentication:** Required (Student role)
- **Request URL Parameters:**

| Parameter    | Description                   |
|--------------|-------------------------------|
| `class_id`   | ID of the class               |

- **Response:**
  - Status: `200 OK`
  - Content-Type: `application/json`
  - Body:

```json
{
  "message": "Request sent successfully"
}
```

### Student View Classes

- **URL:** `/student/classes`
- **Method:** `GET`
- **Description:** Retrieves all classes that a student is attending.
- **Authentication:** Required (Student role)

- **Response:**
  - Status: `200 OK`
  - Content-Type: `application/json`
  - Body: Array of class objects with the following properties:

```json
[
  {
    "id": <class_id>,
    "title":

String,
    "description": String,
    "teacher": String
  },
  ...
]
```

### Get All Classes

- **URL:** `/classes`
- **Method:** `GET`
- **Description:** Retrieves all classes.
- **Response:**
  - Status: `200 OK`
  - Content-Type: `application/json`
  - Body: Array of class objects with the following properties:

```json
[
  {
    "id": <class_id>,
    "title": String,
    "description": String,
    "teacher_id": Number
  },
  ...
]
```
