# TestMultiClaude6 API

A demonstration Express.js API showcasing multi-agent orchestration with JWT authentication. This project is part of the MultiClaude system, which enables parallel AI agent execution for complex software engineering tasks.

## Overview

This is a fully-featured TypeScript-based REST API with:
- User registration and authentication
- JWT-based access tokens (1-hour expiration)
- Protected endpoints requiring authentication
- Zod schema validation for all inputs
- Comprehensive test suite using Vitest and Supertest

## Quick Start

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The server will start on `http://localhost:3000` by default. You can override the port with the `PORT` environment variable:

```bash
PORT=8080 npm run dev
```

### Running Tests

```bash
npm test          # Run tests once
npm run test:watch # Run tests in watch mode
```

### Building for Production

```bash
npm run build
npm start
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `JWT_SECRET` - Secret key for signing JWT tokens (default: "dev-secret-change-in-production")

⚠️ **Important**: Always set a strong `JWT_SECRET` in production environments.

## API Documentation

### Base URL

```
http://localhost:3000/api
```

### Response Format

All API responses are JSON. Errors follow this format:

```json
{
  "error": "Error message or validation details"
}
```

---

## Endpoints

### 1. Health Check

Check if the API is running and healthy.

**Endpoint:** `GET /health`

**Response:** 200 OK

```json
{
  "status": "ok",
  "timestamp": "2024-03-15T10:30:45.123Z"
}
```

**cURL Example:**

```bash
curl http://localhost:3000/api/health
```

---

### 2. User Registration

Create a new user account and receive a JWT token.

**Endpoint:** `POST /auth/register`

**Request Body:**

```json
{
  "username": "string (2-50 characters, required)",
  "email": "string (valid email, required)",
  "password": "string (8+ characters, required)"
}
```

**Response:** 201 Created

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

**Error Responses:**

- `400 Bad Request` - Invalid input (username < 2 chars, invalid email, password < 8 chars)
- `409 Conflict` - Username already taken

**cURL Examples:**

```bash
# Successful registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "email": "alice@example.com",
    "password": "securepass123"
  }'

# Invalid email
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "bob",
    "email": "not-an-email",
    "password": "securepass123"
  }'

# Username too short
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "a",
    "email": "bob@example.com",
    "password": "securepass123"
  }'

# Duplicate username
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "email": "another@example.com",
    "password": "securepass123"
  }'
```

---

### 3. User Login

Authenticate with existing credentials and receive a JWT token.

**Endpoint:** `POST /auth/login`

**Request Body:**

```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Response:** 200 OK

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "alice",
    "email": "alice@example.com"
  }
}
```

**Error Responses:**

- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Username not found or password incorrect

**cURL Examples:**

```bash
# Successful login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "password": "securepass123"
  }'

# Wrong password
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "password": "wrongpassword"
  }'

# Non-existent user
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "nonexistent",
    "password": "anypassword"
  }'
```

---

### 4. Get Current User

Retrieve information about the authenticated user.

**Endpoint:** `GET /auth/me`

**Authentication:** Required (Bearer token in Authorization header)

**Response:** 200 OK

```json
{
  "user": {
    "sub": "550e8400-e29b-41d4-a716-446655440000",
    "username": "alice",
    "iat": 1710502245,
    "exp": 1710505845
  }
}
```

**Error Responses:**

- `401 Unauthorized` - Missing or invalid token

**cURL Examples:**

```bash
# First, register/login to get a token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "email": "alice@example.com",
    "password": "securepass123"
  }' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Use the token to get user info
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Without token (will get 401)
curl http://localhost:3000/api/auth/me

# With invalid token (will get 401)
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer invalid.token.here"
```

---

## Complete Workflow Example

Here's a complete flow: register → login → retrieve user info.

```bash
#!/bin/bash

API="http://localhost:3000/api"

echo "1. Registering new user..."
REGISTER_RESPONSE=$(curl -s -X POST $API/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "mypassword123"
  }')

echo "Response: $REGISTER_RESPONSE"
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Token: $TOKEN"

echo -e "\n2. Getting current user info..."
curl -s -X GET $API/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq .

echo -e "\n3. Logging in with same credentials..."
LOGIN_RESPONSE=$(curl -s -X POST $API/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "mypassword123"
  }')

echo "Response: $LOGIN_RESPONSE"
NEW_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "New Token: $NEW_TOKEN"

echo -e "\n4. Checking health..."
curl -s -X GET $API/health | jq .
```

## Implementation Notes

- **In-Memory Storage**: User data is stored in memory and will be lost when the server restarts. In a production environment, replace with a persistent database.
- **Password Security**: Passwords are stored as plain text in this demo. In production, use bcrypt or similar for hashing.
- **JWT Expiration**: Tokens expire after 1 hour. Implement refresh tokens for long-lived sessions in production.

## Architecture

```
src/
├── index.ts              # Server entry point
├── app.ts                # Express app configuration
├── middleware/
│   └── auth.ts           # JWT token signing and verification
├── routes/
│   ├── health.ts         # Health check endpoint
│   └── auth.ts           # Authentication endpoints (register, login, me)
└── schemas/
    └── auth.ts           # Zod validation schemas
```

## License

ISC
