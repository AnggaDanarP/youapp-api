
# YOUAPP API

## Project Overview
This project involves creating a full-fledged application with login, profile management, and chat functionalities using Nest.js, MongoDB, and Node.js. The application is containerized using Docker and features JWT authentication, Data Transfer Objects (DTOs), validations, real-time communication using either Socket.io or RabbitMQ, and unit tests.

### Key Features:
- User authentication and profile management
- Real-time chat functionality
- JWT token implementation for secure access
- DTOs and validations for robust data handling
- Use RabbitMQ for messaging
- Comprehensive unit testing

## Prerequisites
- Node.js version 20.10.0
- npm version 10.2.3
- Nest.js version 10.2.1
- Docker and Docker Compose

## Installation and Setup
1. Clone the repository.
2. Install all dependencies using npm:
   ```bash
   npm install
   ```
3. Start the application using Docker Compose:
   ```bash
   docker-compose up
   ```

## API Documentation
The API endpoints are as follows:

### `/api/register`
- **Method**: POST
- **Body**: CreateUserDto (username, email, password)
- **Response**: 201 (User Registered)

### `/api/login`
- **Method**: POST
- **Body**: LoginUserDto
- **Response**: 201 (User Logged In)

### `/api/getProfile`
- **Method**: GET
- **Response**: 200 (Profile Data)

### `/api/updateProfile`
- **Method**: PUT
- **Body**: UpdateProfileDto
- **Response**: 200 (Profile Updated)

### `/api/askHoroscopeZodiac`
- **Method**: POST
- **Response**: 201 (Horoscope/Zodiac Information)

### `/api/profiles`
- **Method**: GET
- **Response**: 200 (List of Profiles)

### `/api/refresh`
- **Method**: GET
- **Response**: 200 (Token Refreshed)

## DTO Schemas
- **CreateUserDto**: `{ username: string, email: string, password: string }`
- **LoginUserDto**: `{ /* properties here */ }`
- **UpdateProfileDto**: `{ /* properties here */ }`

## CRUD Features
Implement CRUD operations showcasing your understanding of object-oriented programming, data structures, schema planning, and microservices in a NoSQL environment.

