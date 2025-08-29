// Main service file for Vytal Authentication API

import backend.database;
import backend.donationOp as donationService;
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
        allowOrigins: ["http://localhost:3000", "http://127.0.0.1:3000", "https://iwb25-198-nova.vercel.app"],
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

    resource function post messages(@http:Header {name: "Authorization"} string? authorization, msgModule:CreateMessageRequest request) returns http:Response|error {
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

        // Prevent self-messaging
        if request.sender_id == request.receiver_id {
            response.statusCode = 400;
            response.setJsonPayload({
                "error": "You cannot send a message to yourself",
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

    // Get sent messages endpoint
    resource function get messages/sent/[int userId](@http:Header {name: "Authorization"} string? authorization, string? status = ()) returns http:Response|error {
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

        msgModule:MessagesListResponse|error result = msgModule:getSentMessagesForUser(userId, status);

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

    // Get conversation between two users endpoint
    resource function get messages/conversation/[int userId1]/[int userId2](@http:Header {name: "Authorization"} string? authorization) returns http:Response|error {
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

        msgModule:MessagesListResponse|error result = msgModule:getConversationBetweenUsers(userId1, userId2);

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

    // Get all conversations for a user endpoint
    resource function get messages/conversations/[int userId](@http:Header {name: "Authorization"} string? authorization) returns http:Response|error {
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

        msgModule:ConversationsListResponse|error result = msgModule:getUserConversations(userId);

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

    // Mark conversation as read endpoint
    resource function put messages/conversation/[int userId1]/[int userId2]/read(@http:Header {name: "Authorization"} string? authorization) returns http:Response|error {
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

        error? result = msgModule:markConversationAsRead(userId1, userId2);

        if result is error {
            response.statusCode = 400;
            response.setJsonPayload({
                "error": result.message(),
                "timestamp": time:utcNow()
            });
        } else {
            response.statusCode = 200;
            response.setJsonPayload({
                "message": "Conversation marked as read",
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

    # Create donation endpoint
    # + authorization - Authorization header containing bearer token
    # + request - Donation creation request data
    # + return - HTTP response with donation creation result or error
    resource function post donations(@http:Header {name: "Authorization"} string? authorization, types:DonationCreate request) returns http:Response|error {
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

        int|error result = donationService:createDonation(userResult.id, request);

        if result is error {
            response.statusCode = 400;
            response.setJsonPayload({
                "error": result.message(),
                "timestamp": time:utcNow()
            });
        } else {
            response.statusCode = 201;
            response.setJsonPayload({
                "message": "Donation recorded successfully",
                "id": result,
                "timestamp": time:utcNow()
            });
        }

        return response;
    }

    # Get donor donations endpoint
    # + donorId - ID of the donor to retrieve donations for
    # + authorization - Authorization header containing bearer token
    # + status - Optional status filter for donations
    # + return - HTTP response with donor's donations or error
    resource function get donations/donor/[int donorId](@http:Header {name: "Authorization"} string? authorization, string? status = ()) returns http:Response|error {
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

        types:DonationResponse[]|error result = donationService:getDonationsByDonor(donorId, status);

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

    # Update donation endpoint
    # + donationId - ID of the donation to update
    # + authorization - Authorization header containing bearer token
    # + request - Donation update request containing fields to modify
    # + return - HTTP response with update result or error
    resource function put donations/[int donationId](@http:Header {name: "Authorization"} string? authorization, types:DonationUpdate request) returns http:Response|error {
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

        boolean|error result = donationService:updateDonation(donationId, request);

        if result is error {
            response.statusCode = 400;
            response.setJsonPayload({
                "error": result.message(),
                "timestamp": time:utcNow()
            });
        } else if result {
            response.statusCode = 200;
            response.setJsonPayload({
                "message": "Donation updated successfully",
                "timestamp": time:utcNow()
            });
        } else {
            response.statusCode = 404;
            response.setJsonPayload({
                "error": "Donation not found",
                "timestamp": time:utcNow()
            });
        }

        return response;
    }

    # Get donor dashboard endpoint
    # + donorId - ID of the donor to retrieve dashboard data for
    # + authorization - Authorization header containing bearer token
    # + return - HTTP response with comprehensive dashboard data or error
    resource function get donations/dashboard/[int donorId](@http:Header {name: "Authorization"} string? authorization) returns http:Response|error {
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

        types:DonorDashboard|error result = donationService:getDonorDashboard(donorId);

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

    # Get donor statistics endpoint
    # + donorId - ID of the donor to retrieve statistics for
    # + authorization - Authorization header containing bearer token
    # + return - HTTP response with donor statistics or error
    resource function get donations/stats/[int donorId](@http:Header {name: "Authorization"} string? authorization) returns http:Response|error {
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

        types:DonorStats|error result = donationService:getDonorStats(donorId);

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

    # Get donor achievements endpoint
    # + donorId - ID of the donor to retrieve achievements for
    # + authorization - Authorization header containing bearer token
    # + return - HTTP response with donor achievements list or error
    resource function get donations/achievements/[int donorId](@http:Header {name: "Authorization"} string? authorization) returns http:Response|error {
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

        types:Achievement[]|error result = donationService:getDonorAchievements(donorId);

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

    # Get donation analytics data for a donor
    # + donorId - ID of the donor to retrieve analytics for
    # + authorization - Bearer token passed in the Authorization header for authentication
    # + range - Optional time range for analytics (defaults to "6months" if not provided).
    # Supported values: "1month", "3months", "6months", "1year"
    # + return - HTTP response containing analytics data in JSON or an error response
    resource function get donations/analytics/[int donorId](
            @http:Header {name: "Authorization"} string? authorization,
            string? range = "6months"
) returns http:Response|error {
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

        // Call donation service for donor analytics
        json|error result = donationService:getDonorAnalytics(donorId, range ?: "6months");

        if result is error {
            response.statusCode = 400;
            response.setJsonPayload({
                "error": result.message(),
                "timestamp": time:utcNow()
            });
        } else {
            response.statusCode = 200;
            response.setJsonPayload({
                "data": result,
                "timestamp": time:utcNow()
            });
        }

        return response;
    }

    # Get donation trends over time for a donor
    # + donorId - ID of the donor whose trends need to be retrieved
    # + authorization - Bearer token passed in the Authorization header for authentication
    # + return - HTTP response containing donor trends data in JSON or an error response
    resource function get donations/trends/[int donorId](@http:Header {name: "Authorization"} string? authorization) returns http:Response|error {
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

        json[]|error result = donationService:getDonorTrends(donorId);

        if result is error {
            response.statusCode = 400;
            response.setJsonPayload({
                "error": result.message(),
                "timestamp": time:utcNow()
            });
        } else {
            response.statusCode = 200;
            response.setJsonPayload({
                "data": result,
                "timestamp": time:utcNow()
            });
        }

        return response;
    }

    # Register for blood camp endpoint
    # + authorization - JWT token for user authentication
    # + request - Blood camp registration details
    # + return - HTTP response with registration result or error message
    resource function post blood\-camps/register(@http:Header {name: "Authorization"} string? authorization, types:BloodCampRegistrationCreate request) returns http:Response|error {
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

        // Check if user is eligible to donate
        types:EligibilityResponse|error eligibilityResult = donationService:checkDonationEligibility(userResult.id);
        if eligibilityResult is error {
            response.statusCode = 400;
            response.setJsonPayload({
                "error": "Failed to check eligibility: " + eligibilityResult.message(),
                "timestamp": time:utcNow()
            });
            return response;
        }

        if !eligibilityResult.eligible {
            response.statusCode = 400;
            response.setJsonPayload({
                "error": "You are not eligible to donate at this time",
                "reason": eligibilityResult.reason,
                "next_eligible_date": eligibilityResult.next_eligible_date,
                "timestamp": time:utcNow()
            });
            return response;
        }

        // Check if already registered for this camp
        boolean|error alreadyRegistered = database:checkExistingRegistration(userResult.id, request.camp_id);
        if alreadyRegistered is error {
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Failed to check existing registration",
                "timestamp": time:utcNow()
            });
            return response;
        }

        if alreadyRegistered {
            response.statusCode = 400;
            response.setJsonPayload({
                "error": "You are already registered for this blood camp",
                "timestamp": time:utcNow()
            });
            return response;
        }

        // Check camp capacity
        types:CampCapacityInfo|error capacityResult = database:checkCampCapacity(request.camp_id);
        if capacityResult is error {
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Failed to check camp capacity",
                "timestamp": time:utcNow()
            });
            return response;
        }

        if capacityResult.is_full {
            response.statusCode = 400;
            response.setJsonPayload({
                "error": "Blood camp is at full capacity",
                "available_spots": 0,
                "timestamp": time:utcNow()
            });
            return response;
        }

        int|error registrationId = database:createBloodCampRegistration(userResult.id, request);
        if registrationId is error {
            response.statusCode = 400;
            response.setJsonPayload({
                "error": registrationId.message(),
                "timestamp": time:utcNow()
            });
        } else {
            types:BloodCampRegistrationResponse|error registrationResult = database:getBloodCampRegistrationById(registrationId);
            if registrationResult is error {
                response.statusCode = 201;
                response.setJsonPayload({
                    "message": "Registration successful",
                    "id": registrationId,
                    "timestamp": time:utcNow()
                });
            } else {
                response.statusCode = 201;
                response.setJsonPayload({
                    "message": "Registration successful",
                    "id": registrationId,
                    "registration": registrationResult.toJson(),
                    "timestamp": time:utcNow()
                });
            }
        }

        return response;
    }

    # Get donor registrations endpoint
    # + donorId - ID of the donor to retrieve registrations for
    # + authorization - JWT token for user authentication
    # + return - HTTP response with donor's blood camp registrations or error message
    resource function get blood\-camps/registrations/donor/[int donorId](@http:Header {name: "Authorization"} string? authorization) returns http:Response|error {
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

        types:BloodCampRegistrationResponse[]|error result = database:getRegistrationsByDonor(donorId);

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

    # Get camp registrations endpoint
    # + campId - ID of the blood camp to retrieve registrations for
    # + authorization - JWT token for user authentication
    # + return - HTTP response with blood camp registrations or error message
    resource function get blood\-camps/[int campId]/registrations(@http:Header {name: "Authorization"} string? authorization) returns http:Response|error {
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

        types:BloodCampRegistrationResponse[]|error result = database:getRegistrationsByCamp(campId);

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

    # Update registration endpoint
    # + registrationId - ID of the registration to update
    # + authorization - JWT token for user authentication
    # + request - Registration update data containing fields to modify
    # + return - HTTP response with updated registration details or error message
    resource function put blood\-camps/registrations/[int registrationId](@http:Header {name: "Authorization"} string? authorization, types:BloodCampRegistrationUpdate request) returns http:Response|error {
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

        boolean|error result = database:updateBloodCampRegistration(registrationId, request);

        if result is error {
            response.statusCode = 400;
            response.setJsonPayload({
                "error": result.message(),
                "timestamp": time:utcNow()
            });
        } else if result {
            types:BloodCampRegistrationResponse|error updatedRegistration = database:getBloodCampRegistrationById(registrationId);
            if updatedRegistration is error {
                response.statusCode = 200;
                response.setJsonPayload({
                    "message": "Registration updated successfully",
                    "timestamp": time:utcNow()
                });
            } else {
                response.statusCode = 200;
                response.setJsonPayload({
                    "message": "Registration updated successfully",
                    "registration": updatedRegistration.toJson(),
                    "timestamp": time:utcNow()
                });
            }
        } else {
            response.statusCode = 404;
            response.setJsonPayload({
                "error": "Registration not found",
                "timestamp": time:utcNow()
            });
        }

        return response;
    }

    # Cancel registration endpoint
    # + registrationId - ID of the registration to cancel
    # + authorization - JWT token for user authentication
    # + return - HTTP response confirming cancellation or error message
    resource function delete blood\-camps/registrations/[int registrationId](@http:Header {name: "Authorization"} string? authorization) returns http:Response|error {
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

        // Get current user to verify ownership
        types:UserResponse|error userResult = userService:getUserProfile(email);
        if userResult is error {
            response.statusCode = 404;
            response.setJsonPayload({
                "error": "User not found",
                "timestamp": time:utcNow()
            });
            return response;
        }

        // Verify registration belongs to user
        types:BloodCampRegistrationResponse|error registrationResult = database:getBloodCampRegistrationById(registrationId);
        if registrationResult is error {
            response.statusCode = 404;
            response.setJsonPayload({
                "error": "Registration not found",
                "timestamp": time:utcNow()
            });
            return response;
        }

        if registrationResult.registration.donor_id != userResult.id {
            response.statusCode = 403;
            response.setJsonPayload({
                "error": "You can only cancel your own registrations",
                "timestamp": time:utcNow()
            });
            return response;
        }

        // Update status to cancelled instead of deleting
        types:BloodCampRegistrationUpdate cancelRequest = {
            status: "cancelled",
            health_status: (),
            contact_phone: (),
            emergency_contact_name: (),
            emergency_contact_phone: (),
            medical_conditions: (),
            medications: (),
            notes: ()
        };
        boolean|error result = database:updateBloodCampRegistration(registrationId, cancelRequest);

        if result is error {
            response.statusCode = 400;
            response.setJsonPayload({
                "error": result.message(),
                "timestamp": time:utcNow()
            });
        } else if result {
            response.statusCode = 200;
            response.setJsonPayload({
                "message": "Registration cancelled successfully",
                "timestamp": time:utcNow()
            });
        } else {
            response.statusCode = 404;
            response.setJsonPayload({
                "error": "Registration not found",
                "timestamp": time:utcNow()
            });
        }

        return response;
    }

    # Check donation eligibility endpoint
    # + donorId - ID of the donor to check eligibility for
    # + authorization - JWT token for user authentication
    # + return - HTTP response with eligibility status and details or error message
    resource function get blood\-camps/eligibility/[int donorId](@http:Header {name: "Authorization"} string? authorization) returns http:Response|error {
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

        types:EligibilityResponse|error result = donationService:checkDonationEligibility(donorId);

        if result is error {
            response.statusCode = 400;
            response.setJsonPayload({
                "error": result.message(),
                "timestamp": time:utcNow()
            });
        } else {
            response.statusCode = 200;
            response.setJsonPayload({
                "eligible": result.eligible,
                "reason": result.reason,
                "next_eligible_date": result.next_eligible_date,
                "last_donation_date": result.last_donation_date,
                "blood_type": result.blood_type,
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
