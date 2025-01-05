# Authentication API Documentation

## Overview
The authentication API provides endpoints for user registration, login, and logout functionalities. It uses JWT (JSON Web Tokens) for authentication.

## Endpoints

### Register
- **URL**: `/v1/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "string",
    "password": "string",
    "username": "string"
  }
  ```
- **Response**: 
  ```json
  {
    "user": {
      "id": "number",
      "email": "string",
      "username": "string"
    },
    "token": "string"
  }
  ```

### Login
- **URL**: `/v1/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**: 
  ```json
  {
    "user": {
      "id": "number",
      "email": "string",
      "username": "string"
    },
    "token": "string"
  }
  ```

### Logout
- **URL**: `/v1/auth/logout`
- **Method**: `POST`
- **Headers**: 
  - `Authorization: Bearer <token>`
- **Response**: 204 No Content

## Authentication
Protected routes require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

Use the `requireAuth` middleware to protect routes that require authentication:
```typescript
import { requireAuth } from "@/common/middleware/auth";

router.get("/protected-route", requireAuth, handler);
```