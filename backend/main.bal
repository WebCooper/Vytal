// Main service file for Vytal Authentication API

import backend.database;
import backend.donorPostOp as donorPostService;
import backend.messages as msgModule;
import backend.postOp as postService;
import backend.token;
import backend.types;
import backend.userOp as userService;

import ballerina/http;
import ballerina/io;
import ballerina/time;

# HTTP service with all authentication endpoints
@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:3000", "http://127.0.0.1:3000","https://iwb25-198-nova.vercel.app"],
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

    // Admin: list pending recipient posts
    resource function get admin/pending\-posts(@http:Header {name: "Authorization"} string? authorization) returns http:Response|error {
        http:Response response = new;
        // Support hardcoded admin token for development
        if authorization is string && authorization == "Bearer admin-mock-token" {
            types:RecipientPostResponse[]|error result = postService:getPendingRecipientPosts();
            if result is error {
                response.statusCode = 400;
                response.setJsonPayload({ "error": result.message(), "timestamp": time:utcNow() });
            } else {
                response.statusCode = 200;
                response.setJsonPayload({ "data": result.toJson(), "timestamp": time:utcNow() });
            }
            return response;
        }

        string|error email = token:validateToken(authorization);
        if email is error {
            response.statusCode = 401;
            response.setJsonPayload({ "error": email.message(), "timestamp": time:utcNow() });
            return response;
        }
        // Enforce admin role
        types:UserResponse|error adminUser = userService:getUserProfile(email);
        if adminUser is error || adminUser.role != types:ADMIN {
            response.statusCode = 403;
            response.setJsonPayload({ "error": "Forbidden: admin access required", "timestamp": time:utcNow() });
            return response;
        }
        types:RecipientPostResponse[]|error result = postService:getPendingRecipientPosts();
        if result is error {
            response.statusCode = 400;
            response.setJsonPayload({ "error": result.message(), "timestamp": time:utcNow() });
        } else {
            response.statusCode = 200;
            response.setJsonPayload({ "data": result.toJson(), "timestamp": time:utcNow() });
        }
        return response;
    }

    // Admin: list rejected (not-approved) recipient posts
    resource function get admin/rejected\-posts(@http:Header {name: "Authorization"} string? authorization) returns http:Response|error {
        http:Response response = new;
        // Support hardcoded admin token for development
        if authorization is string && authorization == "Bearer admin-mock-token" {
            types:RecipientPostResponse[]|error result = postService:getRejectedRecipientPosts();
            if result is error {
                response.statusCode = 400;
                response.setJsonPayload({ "error": result.message(), "timestamp": time:utcNow() });
            } else {
                response.statusCode = 200;
                response.setJsonPayload({ "data": result.toJson(), "timestamp": time:utcNow() });
            }
            return response;
        }

        string|error email = token:validateToken(authorization);
        if email is error {
            response.statusCode = 401;
            response.setJsonPayload({ "error": email.message(), "timestamp": time:utcNow() });
            return response;
        }
        // Enforce admin role
        types:UserResponse|error adminUser = userService:getUserProfile(email);
        if adminUser is error || adminUser.role != types:ADMIN {
            response.statusCode = 403;
            response.setJsonPayload({ "error": "Forbidden: admin access required", "timestamp": time:utcNow() });
            return response;
        }
        types:RecipientPostResponse[]|error result = postService:getRejectedRecipientPosts();
        if result is error {
            response.statusCode = 400;
            response.setJsonPayload({ "error": result.message(), "timestamp": time:utcNow() });
        } else {
            response.statusCode = 200;
            response.setJsonPayload({ "data": result.toJson(), "timestamp": time:utcNow() });
        }
        return response;
    }

    // Admin: approve a pending recipient post
    resource function post admin/approve\-post/[int postId](@http:Header {name: "Authorization"} string? authorization) returns http:Response|error {
        http:Response response = new;
        // Support hardcoded admin token for development
        if authorization is string && authorization == "Bearer admin-mock-token" {
            types:RecipientPostResponse|error result = postService:approveRecipientPost(postId);
            if result is error {
                response.statusCode = 400;
                response.setJsonPayload({ "error": result.message(), "timestamp": time:utcNow() });
            } else {
                response.statusCode = 200;
                response.setJsonPayload({ "message": "Post approved", "data": result.toJson(), "timestamp": time:utcNow() });
            }
            return response;
        }

        string|error email = token:validateToken(authorization);
        if email is error {
            response.statusCode = 401;
            response.setJsonPayload({ "error": email.message(), "timestamp": time:utcNow() });
            return response;
        }
        // Enforce admin role
        types:UserResponse|error adminUser = userService:getUserProfile(email);
        if adminUser is error || adminUser.role != types:ADMIN {
            response.statusCode = 403;
            response.setJsonPayload({ "error": "Forbidden: admin access required", "timestamp": time:utcNow() });
            return response;
        }
        types:RecipientPostResponse|error result = postService:approveRecipientPost(postId);
        if result is error {
            response.statusCode = 400;
            response.setJsonPayload({ "error": result.message(), "timestamp": time:utcNow() });
        } else {
            response.statusCode = 200;
            response.setJsonPayload({ "message": "Post approved", "data": result.toJson(), "timestamp": time:utcNow() });
        }
        return response;
    }

    // Admin: reject a recipient post
    resource function post admin/reject\-post/[int postId](@http:Header {name: "Authorization"} string? authorization) returns http:Response|error {
        http:Response response = new;
        // Support hardcoded admin token for development
        if authorization is string && authorization == "Bearer admin-mock-token" {
            types:RecipientPostResponse|error result = postService:rejectRecipientPost(postId);
            if result is error {
                response.statusCode = 400;
                response.setJsonPayload({ "error": result.message(), "timestamp": time:utcNow() });
            } else {
                response.statusCode = 200;
                response.setJsonPayload({ "message": "Post rejected", "data": result.toJson(), "timestamp": time:utcNow() });
            }
            return response;
        }

        string|error email = token:validateToken(authorization);
        if email is error {
            response.statusCode = 401;
            response.setJsonPayload({ "error": email.message(), "timestamp": time:utcNow() });
            return response;
        }
        // Enforce admin role
        types:UserResponse|error adminUser = userService:getUserProfile(email);
        if adminUser is error || adminUser.role != types:ADMIN {
            response.statusCode = 403;
            response.setJsonPayload({ "error": "Forbidden: admin access required", "timestamp": time:utcNow() });
            return response;
        }
        types:RecipientPostResponse|error result = postService:rejectRecipientPost(postId);
        if result is error {
            response.statusCode = 400;
            response.setJsonPayload({ "error": result.message(), "timestamp": time:utcNow() });
        } else {
            response.statusCode = 200;
            response.setJsonPayload({ "message": "Post rejected", "data": result.toJson(), "timestamp": time:utcNow() });
        }
        return response;
    }

    // Admin: get full details of a recipient post by ID
    resource function get admin/post\-details/[int postId](@http:Header {name: "Authorization"} string? authorization) returns http:Response|error {
        http:Response response = new;
        // Allow hardcoded admin token in development
        if authorization is string && authorization == "Bearer admin-mock-token" {
            types:RecipientPostResponse|error result = postService:getRecipientPostDetails(postId);
            if result is error {
                response.statusCode = 404;
                response.setJsonPayload({ "error": result.message(), "timestamp": time:utcNow() });
            } else {
                response.statusCode = 200;
                response.setJsonPayload({ "data": result.toJson(), "timestamp": time:utcNow() });
            }
            return response;
        }

        string|error email = token:validateToken(authorization);
        if email is error {
            response.statusCode = 401;
            response.setJsonPayload({ "error": email.message(), "timestamp": time:utcNow() });
            return response;
        }
        // Enforce admin role
        types:UserResponse|error adminUser = userService:getUserProfile(email);
        if adminUser is error || adminUser.role != types:ADMIN {
            response.statusCode = 403;
            response.setJsonPayload({ "error": "Forbidden: admin access required", "timestamp": time:utcNow() });
            return response;
        }
        types:RecipientPostResponse|error result = postService:getRecipientPostDetails(postId);
        if result is error {
            response.statusCode = 404;
            response.setJsonPayload({ "error": result.message(), "timestamp": time:utcNow() });
        } else {
            response.statusCode = 200;
            response.setJsonPayload({ "data": result.toJson(), "timestamp": time:utcNow() });
        }
        return response;
    }

    // Admin: list all users
    resource function get admin/users(@http:Header {name: "Authorization"} string? authorization) returns http:Response|error {
        http:Response response = new;
        // Support hardcoded admin token for development
        if authorization is string && authorization == "Bearer admin-mock-token" {
            types:User[]|error users = database:getAllUsers();
            if users is error {
                response.statusCode = 400;
                response.setJsonPayload({ "error": users.message(), "timestamp": time:utcNow() });
            } else {
                // Map to public response (without password, with categories array)
                json[] safeUsers = [];
                foreach var u in users {
                    types:Category[]|error catRes = database:convertJsonToCategories(u.categories);
                    types:Category[] cats = [];
                    if catRes is types:Category[] {
                        cats = catRes;
                    }
                    // Convert to plain string array for JSON response
                    string[] catStrings = [];
                    foreach var c in cats { catStrings.push(c.toString()); }
                    safeUsers.push({
                        id: u.id ?: 0,
                        name: u.name,
                        phone_number: u.phone_number,
                        email: u.email,
                        role: u.role,
                        categories: catStrings,
                        created_at: u.created_at,
                        updated_at: u.updated_at
                    });
                }
                response.statusCode = 200;
                response.setJsonPayload({ "data": safeUsers, "timestamp": time:utcNow() });
            }
            return response;
        }

        string|error email = token:validateToken(authorization);
        if email is error {
            response.statusCode = 401;
            response.setJsonPayload({ "error": email.message(), "timestamp": time:utcNow() });
            return response;
        }
        // Enforce admin role
        types:UserResponse|error adminUser = userService:getUserProfile(email);
        if adminUser is error || adminUser.role != types:ADMIN {
            response.statusCode = 403;
            response.setJsonPayload({ "error": "Forbidden: admin access required", "timestamp": time:utcNow() });
            return response;
        }

        types:User[]|error users = database:getAllUsers();
        if users is error {
            response.statusCode = 400;
            response.setJsonPayload({ "error": users.message(), "timestamp": time:utcNow() });
        } else {
            json[] safeUsers = [];
            foreach var u in users {
                types:Category[]|error catRes = database:convertJsonToCategories(u.categories);
                types:Category[] cats = [];
                if catRes is types:Category[] {
                    cats = catRes;
                }
                string[] catStrings = [];
                foreach var c in cats { catStrings.push(c.toString()); }
                safeUsers.push({
                    id: u.id ?: 0,
                    name: u.name,
                    phone_number: u.phone_number,
                    email: u.email,
                    role: u.role,
                    categories: catStrings,
                    created_at: u.created_at,
                    updated_at: u.updated_at
                });
            }
            response.statusCode = 200;
            response.setJsonPayload({ "data": safeUsers, "timestamp": time:utcNow() });
        }
        return response;
    }

    // Update recipient post endpoint
    resource function put posts/[int postId](@http:Header {name: "Authorization"} string? authorization, types:RecipientPostUpdate request) returns http:Response|error {
        http:Response response = new;

        // Allow hardcoded admin token in development
        if authorization is string && authorization == "Bearer admin-mock-token" {
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

        // Allow hardcoded admin token in development
        if authorization is string && authorization == "Bearer admin-mock-token" {
            error? del = postService:deleteRecipientPost(postId);
            if del is error {
                response.statusCode = 400;
                response.setJsonPayload({
                    "error": del.message(),
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

    // Get all donor posts endpoint
    resource function get donor_post() returns http:Response|error {
        http:Response response = new;

        types:DonorPost[]|error result = donorPostService:getAllDonorPosts();

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

    // Get donor posts by user ID endpoint
    resource function get donor_post/user/[int userId]() returns http:Response|error {
        http:Response response = new;

        // Check if user exists
        types:UserResponse|error userResult = userService:getUserById(userId);
        if userResult is error {
            response.statusCode = 404;
            response.setJsonPayload({
                "error": "User not found",
                "timestamp": time:utcNow()
            });
            return response;
        }

        // Get posts by user ID
        types:DonorPost[]|error result = donorPostService:getDonorPostsByUser(userId);

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

    // MESSAGING ENDPOINTS

    // Send message endpoint
    resource function post messages(@http:Header {name: "Authorization"} string? authorization, msgModule:CreateMessageRequest request) returns http:Response|error {
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

        msgModule:MessageResponse|error result = msgModule:sendMessage(request);

        if result is error {
            response.statusCode = 400;
            response.setJsonPayload({
                "error": result.message(),
                "timestamp": time:utcNow()
            });
        } else {
            response.statusCode = 201;
            response.setJsonPayload(result.toJson());
        }

        return response;
    }

    // Get user messages endpoint
    resource function get messages/user/[int userId](@http:Header {name: "Authorization"} string? authorization, string? status = ()) returns http:Response|error {
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

        msgModule:MessagesListResponse|error result = msgModule:getMessagesForUser(userId, status);

        if result is error {
            response.statusCode = 400;
            response.setJsonPayload({
                "error": result.message(),
                "timestamp": time:utcNow()
            });
        } else {
            response.statusCode = 200;
            response.setJsonPayload(result.toJson());
        }

        return response;
    }

    // Get unread count endpoint
    resource function get messages/user/[int userId]/unread\-count(@http:Header {name: "Authorization"} string? authorization) returns http:Response|error {
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

        int|error result = msgModule:getUnreadCount(userId);

        if result is error {
            response.statusCode = 400;
            response.setJsonPayload({
                "error": result.message(),
                "timestamp": time:utcNow()
            });
        } else {
            response.statusCode = 200;
            response.setJsonPayload({
                "count": result,
                "timestamp": time:utcNow()
            });
        }

        return response;
    }

    // Mark message as read endpoint
    resource function put messages/[int messageId]/read(@http:Header {name: "Authorization"} string? authorization) returns http:Response|error {
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

        error? result = msgModule:markMessageAsRead(messageId);

        if result is error {
            response.statusCode = 400;
            response.setJsonPayload({
                "error": result.message(),
                "timestamp": time:utcNow()
            });
        } else {
            response.statusCode = 200;
            response.setJsonPayload({
                "message": "Message marked as read",
                "timestamp": time:utcNow()
            });
        }

        return response;
    }

    // Create blood camp endpoint
    resource function post blood\-camps(@http:Header {name: "Authorization"} string? authorization, types:BloodCampCreate request) returns http:Response|error {
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

        types:UserResponse|error userResult = userService:getUserProfile(email);
        if userResult is error {
            response.statusCode = 404;
            response.setJsonPayload({
                "error": "User not found",
                "timestamp": time:utcNow()
            });
            return response;
        }

        int|error result = database:createBloodCamp(userResult.id, request);

        if result is error {
            response.statusCode = 400;
            response.setJsonPayload({
                "error": result.message(),
                "timestamp": time:utcNow()
            });
        } else {
            response.statusCode = 201;
            response.setJsonPayload({
                "message": "Blood camp created successfully",
                "id": result,
                "timestamp": time:utcNow()
            });
        }

        return response;
    }

    // Get all blood camps endpoint (public access - no authorization required)
    resource function get blood\-camps() returns http:Response|error {
        http:Response response = new;

        types:BloodCamp[]|error result = database:getAllBloodCamps();

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
                "total": result.length(),
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
