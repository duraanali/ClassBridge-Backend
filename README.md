# API Documentation

## Introduction

This API provides functionalities for managing a system that allows teachers to create classes and students to join those classes. It uses JSON Web Tokens (JWT) for authentication.

## Table of Contents

- [API Documentation](#api-documentation)
  - [Introduction](#introduction)
  - [Table of Contents](#table-of-contents)
  - [Requirements](#requirements)
  - [Endpoints](#endpoints)
    - [Teacher Sign Up](#teacher-sign-up)
    - [Teacher Login](#teacher-login)
    - [Create a Class](#create-a-class)
    - [Update a Class](#update-a-class)
    - [Delete a Class](#delete-a-class)
    - [Approve a Student's Request to Join a Class](#approve-a-students-request-to-join-a-class)
    - [Student Sign Up](#student-sign-up)
    - [Student Login](#student-login)
    - [Teacher View Class Requests and Student Information](#teacher-view-class-requests-and-student-information)
    - [Student Profile](#student-profile)
    - [Teacher Profile](#teacher-profile)
    - [Student Request to Join a Class](#student-request-to-join-a-class)
    - [Teacher View Approved Students and Their Classes](#teacher-view-approved-students-and-their-classes)
    - [Student View Classes They're Attending](#student-view-classes-theyre-attending)

## Requirements

- Node.js
- npm
- SQLite3 database

## Endpoints

### Teacher Sign Up

- URL: `/api/teacher/signup`
- Method: POST
- Description: Registers a new teacher in the system.
- Request Body:
  - `first_name` (string): First name of the teacher.
  - `last_name` (string): Last name of the teacher.
  - `email` (string): Email address of the teacher.
  - `password` (string): Password of the teacher.
- Response:
  - Status 200: Success
    - `message` (string): Success message.
    - `teacher_id` (integer): ID of the newly created teacher.
    - `token` (string): JWT token for authentication.
  - Status 400: Bad Request
    - `error` (string): Error message indicating the teacher with the same email already exists.
  - Status 500: Internal Server Error
    - `error` (string): Error message indicating an internal server error.

### Teacher Login

- URL: `/api/teacher/login`
- Method: POST
- Description: Logs in a teacher and returns a JWT token for authentication.
- Request Body:
  - `email` (string): Email address of the teacher.
  - `password` (string): Password of the teacher.
- Response:
  - Status 200: Success
    - `message` (string): Success message.
    - `teacher_id` (integer): ID of the logged-in teacher.
    - `token` (string): JWT token for authentication.
  - Status 401: Unauthorized
    - `error` (string): Error message indicating invalid email or password.
  - Status 500: Internal Server Error
    - `error` (string): Error message indicating an internal server error.

### Create a Class

- URL: `/api/classes`
- Method: POST
- Description: Creates a new class.
- Authentication: Requires JWT token with teacher role.
- Request Body:
  - `title` (string): Title of the class.
  - `description` (string): Description of the class.
  - `image` (string): Image URL for the class.
- Response:
  - Status 200: Success
    - `message` (string): Success message.
    - `class_id` (integer): ID of the newly created class.
  - Status 401: Unauthorized
    - `error` (string): Error message indicating authentication required.
  - Status 500: Internal Server Error
    - `error` (string): Error message indicating an internal server error.

### Update a Class

- URL: `/api/classes/:class_id`
- Method: PUT
- Description: Updates an existing class.
- Authentication: Requires JWT token with teacher role.
- Request Parameters:
  - `class_id` (integer): ID of the class to update.
- Request Body:
  - `title` (string): Updated title of the class.
  - `description` (string): Updated description of the class.
  - `image` (string): Updated image URL for the class.
- Response:
  - Status 200: Success
    - `message` (string): Success message.
    - `class_id` (integer): ID of the updated class.
  - Status 401: Unauthorized
    - `error` (string): Error message indicating authentication required.
  - Status 403: Forbidden
    - `error` (string): Error message indicating not authorized to update this class.
  - Status 404: Not Found
    - `error` (string): Error message indicating class not found.
  - Status 500: Internal Server Error
    - `error` (string): Error message indicating an internal server error.

### Delete a Class

- URL: `/api/classes/:class_id`
- Method: DELETE
- Description: Deletes an existing class.
- Authentication: Requires JWT token with teacher role.
- Request Parameters:
  - `class_id` (integer): ID of the class to delete.
- Response:
  - Status 200: Success
    - `message` (string): Success message.
    - `class_id` (integer): ID of the deleted class.
  - Status 401: Unauthorized
    - `error` (string): Error message indicating authentication required.
  - Status 403: Forbidden
    - `error` (string): Error message indicating not authorized to delete this class.
  - Status 404: Not Found
    - `error` (string): Error message indicating class not found.
  - Status 500: Internal Server Error
    - `error` (string): Error message indicating an internal server error.

### Approve a Student's Request to Join a Class

- URL: `/api/classes/:class_id/approve/:student_id`
- Method: POST
- Description: Approves a student's request to join a class.
- Authentication: Requires JWT token with teacher role.
- Request Parameters:
  - `class_id` (integer): ID of the class to approve the request for.
  - `student_id` (integer): ID of the student whose request to approve.
- Response:
  - Status 200: Success
    - `message` (string): Success message.
  - Status 401: Unauthorized
    - `error` (string): Error message indicating authentication required.
  - Status 403: Forbidden
    - `error` (string): Error message indicating not authorized to approve requests for this class.
  - Status 404: Not Found
    - `error` (string): Error message indicating class or request not found.
  - Status 500: Internal Server Error
    - `error` (string): Error message indicating an internal server error.

### Student Sign Up

- URL: `/api/student/signup`
- Method: POST
- Description: Registers a new student in the system.
- Request Body:
  - `first_name` (string): First name of the student.
  - `last_name` (string): Last name of the student.
 

 - `email` (string): Email address of the student.
  - `password` (string): Password of the student.
- Response:
  - Status 200: Success
    - `message` (string): Success message.
    - `student_id` (integer): ID of the newly created student.
    - `token` (string): JWT token for authentication.
  - Status 400: Bad Request
    - `error` (string): Error message indicating the student with the same email already exists.
  - Status 500: Internal Server Error
    - `error` (string): Error message indicating an internal server error.

### Student Login

- URL: `/api/student/login`
- Method: POST
- Description: Logs in a student and returns a JWT token for authentication.
- Request Body:
  - `email` (string): Email address of the student.
  - `password` (string): Password of the student.
- Response:
  - Status 200: Success
    - `message` (string): Success message.
    - `student_id` (integer): ID of the logged-in student.
    - `token` (string): JWT token for authentication.
  - Status 401: Unauthorized
    - `error` (string): Error message indicating invalid email or password.
  - Status 500: Internal Server Error
    - `error` (string): Error message indicating an internal server error.

### Teacher View Class Requests and Student Information

- URL: `/api/teacher/class-requests`
- Method: GET
- Description: Retrieves class requests and student information for a teacher.
- Authentication: Requires JWT token with teacher role.
- Response:
  - Status 200: Success
    - An array of objects, each representing a class request with the following properties:
      - `request_id` (integer): ID of the class request.
      - `student_id` (integer): ID of the student.
      - `first_name` (string): First name of the student.
      - `last_name` (string): Last name of the student.
      - `email` (string): Email address of the student.
      - `class_id` (integer): ID of the requested class.
      - `class_title` (string): Title of the requested class.
      - `class_description` (string): Description of the requested class.
      - `class_image` (string): Image URL for the requested class.
  - Status 401: Unauthorized
    - `error` (string): Error message indicating authentication required.
  - Status 403: Forbidden
    - `error` (string): Error message indicating not authorized to view class requests.
  - Status 500: Internal Server Error
    - `error` (string): Error message indicating an internal server error.

### Student Profile

- URL: `/api/student/profile`
- Method: GET
- Description: Retrieves the profile information of a student.
- Authentication: Requires JWT token with student role.
- Response:
  - Status 200: Success
    - An object representing the student's profile with the following properties:
      - `id` (integer): ID of the student.
      - `first_name` (string): First name of the student.
      - `last_name` (string): Last name of the student.
      - `email` (string): Email address of the student.
  - Status 401: Unauthorized
    - `error` (string): Error message indicating authentication required.
  - Status 500: Internal Server Error
    - `error` (string): Error message indicating an internal server error.

### Teacher Profile

- URL: `/api/teacher/profile`
- Method: GET
- Description: Retrieves the profile information of a teacher.
- Authentication: Requires JWT token with teacher role.
- Response:
  - Status 200: Success
    - An object representing the teacher's profile with the following properties:
      - `id` (integer): ID of the teacher.
      - `first_name` (string): First name of the teacher.
      - `last_name` (string): Last name of the teacher.
      - `email` (string): Email address of the teacher.
  - Status 401: Unauthorized
    - `error` (string): Error message indicating authentication required.
  - Status 500: Internal Server Error
    - `error` (string): Error message indicating an internal server error.

### Student Request to Join a Class

- URL: `/api/classes/:class_id/request`
- Method: POST
- Description: Sends a request from a student to join a class.
- Authentication: Requires JWT token with student role.
- Request Parameters:
  - `class_id` (integer): ID of the class to request to join.
- Response:
  - Status 200: Success
    - `message` (string): Success message.
  - Status 401: Unauthorized
    - `error` (string): Error message indicating authentication required.
  - Status 400: Bad Request
    - `error` (string): Error message indicating request already sent for this class.
  - Status 404: Not Found
    - `error` (string): Error message indicating class not found.
  - Status 500: Internal Server Error
    - `error` (string): Error message indicating an internal server error.

### Teacher View Approved Students and Their Classes

- URL: `/api/teacher/approved-students`
- Method: GET
- Description: Retrieves approved students and their classes for a teacher.
- Authentication: Requires JWT token with teacher role.
- Response:
  - Status 200: Success
    - An array of objects, each representing an approved student and their class with the following properties:
      - `student_id` (integer): ID of the student.
      - `first_name` (string): First name of the student.
      - `last_name` (string): Last name of the student.
      - `email` (string): Email address of the student.
      - `class_id` (integer): ID of the class the student is attending.
      - `class_title` (string): Title of the class the student is attending.
      - `class_description` (string): Description of the class the student is attending.
      - `class_image` (string): Image URL for the class the student is attending.
  - Status 401: Unauthorized
    - `error` (string): Error message indicating authentication required.
  - Status 403: Forbidden
    - `error` (string): Error message indicating not authorized to view approved students.
  - Status 500: Internal Server Error
    - `error` (string): Error message indicating an internal server error.

### Student View Classes They're Attending

- URL: `/api/student/classes`
- Method: GET
- Description: Retrieves all classes the student is attending.
- Authentication: Requires JWT token with student role.
- Response:
  - Status 200: Success
    - An array of objects, each representing a class the student is attending with the following properties:
      - `id` (integer): ID of the class.
      - `title` (string): Title of the class.
      - `description` (string): Description of the class.
      - `image` (string): Image URL for the class.
      - `first_name` (string): First name of the teacher of

 the class.
      - `last_name` (string): Last name of the teacher of the class.
  - Status 401: Unauthorized
    - `error` (string): Error message indicating authentication required.
  - Status 500: Internal Server Error
    - `error` (string): Error message indicating an internal server error.
