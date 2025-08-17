// Main service file for Vytal Authentication API
import ballerina/http;
import ballerina/time;
import backend.types;
import backend.userOp as userService;
import backend.postOp as postService;
import backend.donorPostOp as donorPostService;
import backend.token;
import backend.database;
import ballerina/io;

# HTTP service with all authentication endpoints
@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:3000", "http://127.0.0.1:3000", "https://your-frontend-domain.com"],
        allowCredentials: true,
        allowHeaders: ["Authorization", "Content-Type"],
        exposeHeaders: ["X-CUSTOM-HEADER"],
        maxAge: 86400
    }
}


service /api/v1 on new http:Listener(9091) {

    # Health check endpoint
    # + return - return value description
    resource function get health() returns json {
        io:println("API health endpoint called");
        return {
            "status": "healthy",
            "timestamp": time:utcNow(),
            "service": "Vytal Authentication API"
        };
    }

    # Registration endpoint
    # + request - registration request payload
    # + return - HTTP response
    resource function post register(types:RegisterRequest request) returns http:Response|error {
        http:Response response = new;
        
        types:UserResponse|error result = userService:registerUser(request);
        
        if result is error {
            response.statusCode = 400;
            response.setJsonPayload({
                "error": result.message(),
                "timestamp": time:utcNow()
            });
        } else {
            response.statusCode = 201;
            response.setJsonPayload({
                "message": "User registered successfully",
                "user": result.toJson(),
                "timestamp": time:utcNow()
            });
        }
        
        return response;
    }

    // Login endpoint
    resource function post login(types:LoginRequest request) returns http:Response|error {
        http:Response response = new;
        
        types:LoginResponse|error result = userService:loginUser(request);
        
        if result is error {
            response.statusCode = 401;
            response.setJsonPayload({
                "error": result.message(),
                "timestamp": time:utcNow()
            });
        } else {
            response.statusCode = 200;
            response.setJsonPayload({
                "message": "Login successful",
                "data": result.toJson(),
                "timestamp": time:utcNow()
            });
        }
        
        return response;
    }

    // Get profile endpoint
    resource function get profile(@http:Header {name: "Authorization"} string? authorization) returns http:Response|error {
        http:Response response = new;
        
        string|error email = token:validateToken(authorization);
        
        if email is error {
            response.statusCode = 401;
            response.setJsonPayload({
                "error": email.message(),
                "timestamp": time:utcNow()
            });
            return response;
        }
        
        types:UserResponse|error result = userService:getUserProfile(email);
        
        if result is error {
            response.statusCode = 404;
            response.setJsonPayload({
                "error": result.message(),
                "timestamp": time:utcNow()
            });
        } else {
            response.statusCode = 200;
            response.setJsonPayload({
                "data": result.toJson(),
                "timestamp": time:utcNow()
            });
        }
        
        return response;
    }

    // Update profile endpoint
    resource function put profile(@http:Header {name: "Authorization"} string? authorization, types:UserUpdate updatedUser) returns http:Response|error {
        http:Response response = new;
        
        string|error email = token:validateToken(authorization);
        
        if email is error {
            response.statusCode = 401;
            response.setJsonPayload({
                "error": email.message(),
                "timestamp": time:utcNow()
            });
            return response;
        }
        
        // For update, we need to pass the current user data
        types:User updateUserData = {
            id: (),
            name: updatedUser.name ?: "",
            phone_number: updatedUser.phone_number ?: "",
            email: email,
            password: "", // Will be kept as existing
            role: updatedUser.role ?: types:DONOR,
            categories: "[]", // Will be converted properly
            created_at: (),
            updated_at: ()
        };
        
        types:UserResponse|error result = userService:updateUserProfile(email, updateUserData);
        
        if result is error {
            response.statusCode = 400;
            response.setJsonPayload({
                "error": result.message(),
                "timestamp": time:utcNow()
            });
        } else {
            response.statusCode = 200;
            response.setJsonPayload({
                "message": "Profile updated successfully",
                "data": result.toJson(),
                "timestamp": time:utcNow()
            });
        }
        
        return response;
    }

    // Logout endpoint
    resource function post logout(@http:Header {name: "Authorization"} string? authorization) returns http:Response|error {
        http:Response response = new;
        
        if authorization is () || !authorization.startsWith("Bearer ") {
            response.statusCode = 401;
            response.setJsonPayload({
                "error": "Invalid authorization format",
                "timestamp": time:utcNow()
            });
            return response;
        }
        
        string tokenValue = authorization.substring(7);
        error? result = userService:logoutUser(tokenValue);
        
        if result is error {
            response.statusCode = 401;
            response.setJsonPayload({
                "error": result.message(),
                "timestamp": time:utcNow()
            });
        } else {
            response.statusCode = 200;
            response.setJsonPayload({
                "message": "Logout successful",
                "timestamp": time:utcNow()
            });
        }
        
        return response;
    }

    // Create recipient post endpoint
    resource function post posts(@http:Header {name: "Authorization"} string? authorization, types:RecipientPostCreate request) returns http:Response|error {
        http:Response response = new;
        
        // Validate token and get user email
        string|error email = token:validateToken(authorization);
        if email is error {
            response.statusCode = 401;
            response.setJsonPayload({
                "error": email.message(),
                "timestamp": time:utcNow()
            });
            return response;
        }

        // Get user ID from email
        types:UserResponse|error userResult = userService:getUserProfile(email);
        if userResult is error {
            response.statusCode = 404;
            response.setJsonPayload({
                "error": "User not found",
                "timestamp": time:utcNow()
            });
            return response;
        }

        // Create the post
        types:RecipientPostResponse|error result = postService:createRecipientPost(userResult.id, request);
        
        if result is error {
            response.statusCode = 400;
            response.setJsonPayload({
                "error": result.message(),
                "timestamp": time:utcNow()
            });
        } else {
            response.statusCode = 201;
            response.setJsonPayload({
                "message": "Post created successfully",
                "data": result.toJson(),
                "timestamp": time:utcNow()
            });
        }
        
        return response;
    }

    // Get all recipient posts endpoint
    resource function get posts() returns http:Response|error {
        http:Response response = new;
        
        types:RecipientPostResponse[]|error result = postService:getAllRecipientPosts();
        
        if result is error {
            response.statusCode = 400;
            response.setJsonPayload({
                "error": result.message(),
                "timestamp": time:utcNow()
            });
        } else {
            response.statusCode = 200;
            response.setJsonPayload({
                "data": result.toJson(),
                "timestamp": time:utcNow()
            });
        }
        
        return response;
    }

    // Get posts by user endpoint
    resource function get posts/[int userId]() returns http:Response|error {
        http:Response response = new;
        
        types:RecipientPostResponse[]|error result = postService:getRecipientPostsByUser(userId);
        
        if result is error {
            response.statusCode = 400;
            response.setJsonPayload({
                "error": result.message(),
                "timestamp": time:utcNow()
            });
        } else {
            response.statusCode = 200;
            response.setJsonPayload({
                "data": result.toJson(),
                "timestamp": time:utcNow()
            });
        }
        
        return response;
    }

    // Update recipient post endpoint
    resource function put posts/[int postId](@http:Header {name: "Authorization"} string? authorization, types:RecipientPostUpdate request) returns http:Response|error {
        http:Response response = new;
        
        // Validate token
        string|error email = token:validateToken(authorization);
        if email is error {
            response.statusCode = 401;
            response.setJsonPayload({
                "error": email.message(),
                "timestamp": time:utcNow()
            });
            return response;
        }

        types:RecipientPostResponse|error result = postService:updateRecipientPost(postId, request);
        
        if result is error {
            response.statusCode = 400;
            response.setJsonPayload({
                "error": result.message(),
                "timestamp": time:utcNow()
            });
        } else {
            response.statusCode = 200;
            response.setJsonPayload({
                "message": "Post updated successfully",
                "data": result.toJson(),
                "timestamp": time:utcNow()
            });
        }
        
        return response;
    }

    // Delete recipient post endpoint
    resource function delete posts/[int postId](@http:Header {name: "Authorization"} string? authorization) returns http:Response|error {
        http:Response response = new;
        
        // Validate token
        string|error email = token:validateToken(authorization);
        if email is error {
            response.statusCode = 401;
            response.setJsonPayload({
                "error": email.message(),
                "timestamp": time:utcNow()
            });
            return response;
        }

        error? result = postService:deleteRecipientPost(postId);
        
        if result is error {
            response.statusCode = 400;
            response.setJsonPayload({
                "error": result.message(),
                "timestamp": time:utcNow()
            });
        } else {
            response.statusCode = 200;
            response.setJsonPayload({
                "message": "Post deleted successfully",
                "timestamp": time:utcNow()
            });
        }
        
        return response;
    }


    // Create donor post endpoint
// Create donor post endpoint
    resource function post donor_post(@http:Header {name: "Authorization"} string? authorization, types:DonorPostCreate request) returns http:Response|error {
        http:Response response = new;

        // Validate token and get user email
        string|error email = token:validateToken(authorization);
        if email is error {
            response.statusCode = 401;
            response.setJsonPayload({
                "error": email.message(),
                "timestamp": time:utcNow()
            });
            return response;
        }

        // Get user ID from email
        types:UserResponse|error userResult = userService:getUserProfile(email);
        if userResult is error {
            response.statusCode = 404;
            response.setJsonPayload({
                "error": "User not found",
                "timestamp": time:utcNow()
            });
            return response;
        }

        // Pass userId into donor post creation (similar to recipient)
        types:DonorPost|error result = donorPostService:createDonorPost(userResult.id, request);

        if result is error {
            response.statusCode = 400;
            response.setJsonPayload({
                "error": result.message(),
                "timestamp": time:utcNow()
            });
        } else {
            response.statusCode = 201;
            response.setJsonPayload({
                "message": "Donor post created successfully",
                "data": result.toJson(),
                "timestamp": time:utcNow()
            });
        }

        return response;
    }
}

// Function to handle shutdown
function onShutdown() returns error? {
    io:println("Shutting down gracefully...");
    check database:closeDbConnection();
    io:println("Database connections closed");
    return;
}
