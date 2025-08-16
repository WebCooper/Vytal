# Recipient Posts API Documentation

This document outlines the CRUD (Create, Read, Update, Delete) operations available for Recipient Posts in the Vytal platform.

## Base URL
```
http://localhost:9091/api/v1
```

## Endpoints

### 1. Create Recipient Post
Creates a new recipient post for blood or monetary donations.

**Endpoint:** `POST /posts`

**Authentication Required:** Yes (Bearer Token)

**Request Body:**
```json
{
    "title": "Urgent: Need O+ Blood for Surgery",
    "content": "Need 2 pints of O+ blood for emergency surgery at Colombo General Hospital",
    "category": "BLOOD",
    "status": "PENDING",
    "location": "Colombo General Hospital, Colombo 10",
    "urgency": "HIGH",
    "contact": "+94771234567",
    "goal": 50000.00  // Optional: Only for monetary donations
}
```

**Success Response (201):**
```json
{
    "message": "Post created successfully",
    "data": {
        "id": 1,
        "user": {
            "id": 123,
            "name": "John Doe",
            "phone_number": "+94771234567",
            "email": "john@example.com",
            "role": "RECIPIENT",
            "categories": ["BLOOD", "MONETARY"]
        },
        "title": "Urgent: Need O+ Blood for Surgery",
        "content": "Need 2 pints of O+ blood for emergency surgery at Colombo General Hospital",
        "category": "BLOOD",
        "status": "PENDING",
        "location": "Colombo General Hospital, Colombo 10",
        "urgency": "HIGH",
        "createdAt": "2025-08-17T10:30:00Z",
        "engagement": {
            "likes": 0,
            "comments": 0,
            "shares": 0,
            "views": 0
        },
        "contact": "+94771234567",
        "fundraiserDetails": null
    },
    "timestamp": "2025-08-17T10:30:00Z"
}
```

### 2. Get All Recipient Posts
Retrieves all recipient posts from the system.

**Endpoint:** `GET /posts`

**Authentication Required:** No

**Success Response (200):**
```json
{
    "data": [
        {
            "id": 1,
            "user": {
                "id": 123,
                "name": "John Doe",
                "phone_number": "+94771234567",
                "email": "john@example.com",
                "role": "RECIPIENT",
                "categories": ["BLOOD", "MONETARY"]
            },
            "title": "Urgent: Need O+ Blood for Surgery",
            "content": "Need 2 pints of O+ blood for emergency surgery",
            "category": "BLOOD",
            "status": "PENDING",
            "location": "Colombo General Hospital",
            "urgency": "HIGH",
            "createdAt": "2025-08-17T10:30:00Z",
            "engagement": {
                "likes": 5,
                "comments": 2,
                "shares": 1,
                "views": 50
            },
            "contact": "+94771234567",
            "fundraiserDetails": null
        }
        // ... more posts
    ],
    "timestamp": "2025-08-17T10:35:00Z"
}
```

### 3. Get Posts by User
Retrieves all posts created by a specific user.

**Endpoint:** `GET /posts/{userId}`

**Authentication Required:** No

**Success Response (200):**
```json
{
    "data": [
        // Array of posts similar to GET /posts response
    ],
    "timestamp": "2025-08-17T10:40:00Z"
}
```

### 4. Update Recipient Post
Updates an existing recipient post.

**Endpoint:** `PUT /posts/{postId}`

**Authentication Required:** Yes (Bearer Token)

**Request Body:**
```json
{
    "title": "Updated: Need O+ Blood for Surgery",
    "content": "Updated content for the post",
    "status": "IN_PROGRESS",
    "urgency": "MEDIUM",
    "received": 25000.00  // Optional: For monetary donations
}
```

**Success Response (200):**
```json
{
    "message": "Post updated successfully",
    "data": {
        // Updated post details similar to create response
    },
    "timestamp": "2025-08-17T10:45:00Z"
}
```

### 5. Delete Recipient Post
Deletes a recipient post.

**Endpoint:** `DELETE /posts/{postId}`

**Authentication Required:** Yes (Bearer Token)

**Success Response (200):**
```json
{
    "message": "Post deleted successfully",
    "timestamp": "2025-08-17T10:50:00Z"
}
```

## Error Responses

### Authentication Error (401)
```json
{
    "error": "Invalid or missing authentication token",
    "timestamp": "2025-08-17T10:55:00Z"
}
```

### Bad Request Error (400)
```json
{
    "error": "Invalid request data",
    "timestamp": "2025-08-17T11:00:00Z"
}
```

### Not Found Error (404)
```json
{
    "error": "Post not found",
    "timestamp": "2025-08-17T11:05:00Z"
}
```

## Data Types

### Post Categories
- `BLOOD`
- `MONETARY`

### Post Status
- `PENDING`
- `IN_PROGRESS`
- `COMPLETED`
- `CANCELLED`

### Urgency Levels
- `LOW`
- `MEDIUM`
- `HIGH`
- `CRITICAL`

## Notes
- All timestamps are in UTC format
- Monetary amounts are in Sri Lankan Rupees (LKR)
- The `fundraiserDetails` field is only populated for monetary donation posts
- All endpoints return appropriate HTTP status codes and error messages
- The engagement metrics (likes, comments, shares, views) are read-only and cannot be directly modified through the API
