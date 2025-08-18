import ballerina/http;
import ballerina/log;
import backend.admin;
import backend.types;

# Admin service for handling admin-specific HTTP requests
@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:3000", "http://127.0.0.1:3000"],
        allowCredentials: true,
        allowHeaders: ["Authorization", "Content-Type"],
        exposeHeaders: ["X-CUSTOM-HEADER"],
        maxAge: 86400
    }
}
service /admin on new http:Listener(9092) {
    
    # Admin login endpoint
    resource function post login(types:AdminLoginRequest request) returns types:AdminLoginResponse|types:AdminErrorResponse {
        types:AdminLoginResponse|error result = admin:adminLogin(request);
        
        if result is error {
            log:printError("Admin login failed", 'error = result);
            return {
                status_code: 401,
                errorMessage: "Authentication failed",
                message: result.message(),
                details: ()
            };
        }
        
        return result;
    }
    
    # Get all users with filtering and pagination
    resource function get users(http:Request req, 
                               int page = 1, 
                               int 'limit = 10, 
                               string? search = (), 
                               string? role = (), 
                               string? status = ()) returns types:UserListResponse|types:AdminErrorResponse {
        
        // Verify admin token
        types:User|error adminUser = verifyAdminRequest(req);
        if adminUser is error {
            return createAuthError(adminUser.message());
        }
        
        // Parse query parameters
        types:UserListRequest listRequest = {
            page: page,
            pageLimit: 'limit,
            search: search,
            role: role != () ? getRoleFromString(role) : (),
            status: status
        };
        
        // Get user list
        types:UserListResponse|error result = admin:getUserList(listRequest);
        if result is error {
            log:printError("Failed to get user list", 'error = result);
            return {
                status_code: 500,
                errorMessage: "Internal server error",
                message: result.message(),
                details: ()
            };
        }
        
        return result;
    }
    
    # Get user details by ID
    resource function get users/[int userId](http:Request req) returns types:UserDetailsResponse|types:AdminErrorResponse {
        // Verify admin token
        types:User|error adminUser = verifyAdminRequest(req);
        if adminUser is error {
            return createAuthError(adminUser.message());
        }
        
        // Get user details
        types:UserDetailsResponse|error result = admin:getUserDetails(userId);
        if result is error {
            return {
                status_code: 404,
                errorMessage: "User not found",
                message: result.message(),
                details: ()
            };
        }
        
        return result;
    }
    
    # Update user status
    resource function put users/[int userId]/status(types:UserStatusUpdate update, http:Request req) 
            returns types:AdminSuccessResponse|types:AdminErrorResponse {
        
        // Verify admin token
        types:User|error adminUser = verifyAdminRequest(req);
        if adminUser is error {
            return createAuthError(adminUser.message());
        }
        
        // Update user status
        types:AdminSuccessResponse|error result = admin:updateUserStatus(userId, update);
        if result is error {
            return {
                status_code: 400,
                errorMessage: "Update failed",
                message: result.message(),
                details: ()
            };
        }
        
        return result;
    }
    
    # Get all posts with filtering and pagination
    resource function get posts(http:Request req,
                               int page = 1,
                               int 'limit = 10,
                               string? search = (),
                               string? category = (),
                               string? status = (),
                               string? urgency = (),
                               string? date_from = (),
                               string? date_to = ()) returns types:PostListResponse|types:AdminErrorResponse {
        
        // Verify admin token
        types:User|error adminUser = verifyAdminRequest(req);
        if adminUser is error {
            return createAuthError(adminUser.message());
        }
        
        // Parse query parameters
        types:PostListRequest listRequest = {
            page: page,
            pageLimit: 'limit,
            search: search,
            category: category != () ? getCategoryFromString(category) : (),
            status: status != () ? getStatusFromString(status) : (),
            urgency: urgency != () ? getUrgencyFromString(urgency) : (),
            date_from: date_from,
            date_to: date_to
        };
        
        // Get post list
        types:PostListResponse|error result = admin:getPostList(listRequest);
        if result is error {
            log:printError("Failed to get post list", 'error = result);
            return {
                status_code: 500,
                errorMessage: "Internal server error",
                message: result.message(),
                details: ()
            };
        }
        
        return result;
    }
    
    # Get post details by ID
    resource function get posts/[int postId](http:Request req) returns types:PostDetailsResponse|types:AdminErrorResponse {
        // Verify admin token
        types:User|error adminUser = verifyAdminRequest(req);
        if adminUser is error {
            return createAuthError(adminUser.message());
        }
        
        // Get post details (implement this in admin module)
        // types:PostDetailsResponse|error result = admin:getPostDetails(postId);
        
        return {
            status_code: 501,
            errorMessage: "Not implemented",
            message: "Post details endpoint not implemented yet",
            details: ()
        };
    }
    
    # Update post status
    resource function put posts/[int postId]/status(types:PostStatusUpdate update, http:Request req) 
            returns types:AdminSuccessResponse|types:AdminErrorResponse {
        
        // Verify admin token
        types:User|error adminUser = verifyAdminRequest(req);
        if adminUser is error {
            return createAuthError(adminUser.message());
        }
        
        // Update post status
        types:AdminSuccessResponse|error result = admin:updatePostStatus(postId, update);
        if result is error {
            return {
                status_code: 400,
                errorMessage: "Update failed",
                message: result.message(),
                details: ()
            };
        }
        
        return result;
    }
    
    # Get analytics overview
    resource function get analytics(http:Request req) returns types:AnalyticsOverview|types:AdminErrorResponse {
        // Verify admin token
        types:User|error adminUser = verifyAdminRequest(req);
        if adminUser is error {
            return createAuthError(adminUser.message());
        }
        
        // Get analytics
        types:AnalyticsOverview|error result = admin:getAnalyticsOverview();
        if result is error {
            log:printError("Failed to get analytics", 'error = result);
            return {
                status_code: 500,
                errorMessage: "Internal server error",
                message: result.message(),
                details: ()
            };
        }
        
        return result;
    }
    
    # Get system settings
    resource function get settings(http:Request req) returns types:SystemSettings|types:AdminErrorResponse {
        // Verify admin token
        types:User|error adminUser = verifyAdminRequest(req);
        if adminUser is error {
            return createAuthError(adminUser.message());
        }
        
        // Return current system settings (implement database storage)
        types:SystemSettings settings = {
            general: {
                site_name: "Vytal",
                site_description: "Blood donation and medical assistance platform",
                maintenance_mode: false,
                registration_enabled: true,
                maintenance_message: ()
            },
            security: {
                require_email_verification: true,
                password_min_length: 8,
                session_timeout_minutes: 60,
                max_login_attempts: 5,
                two_factor_enabled: false
            },
            notifications: {
                email_notifications: true,
                new_user_alerts: true,
                post_approval_alerts: true,
                system_alerts: true,
                admin_email: "admin@vytal.com"
            },
            moderation: {
                auto_approve_users: false,
                auto_approve_posts: false,
                require_post_review: true,
                allow_anonymous_posts: false,
                flagged_keywords: ["spam", "fake", "scam"]
            }
        };
        
        return settings;
    }
    
    # Update system settings
    resource function put settings(types:SettingsUpdateRequest update, http:Request req) 
            returns types:AdminSuccessResponse|types:AdminErrorResponse {
        
        // Verify admin token
        types:User|error adminUser = verifyAdminRequest(req);
        if adminUser is error {
            return createAuthError(adminUser.message());
        }
        
        // Update settings (implement database storage)
        log:printInfo("Settings update requested", adminId = adminUser.id, update = update);
        
        return {
            status_code: 200,
            message: "Settings updated successfully",
            data: ()
        };
    }
}

# Helper function to verify admin request
function verifyAdminRequest(http:Request req) returns types:User|error {
    string|error authHeader = req.getHeader("Authorization");
    if authHeader is error {
        return error("Authorization header missing");
    }
    
    // Extract token from "Bearer <token>"
    string[] authParts = re`\s+`.split(authHeader);
    if authParts.length() != 2 || authParts[0] != "Bearer" {
        return error("Invalid authorization format");
    }
    
    string token = authParts[1];
    
    // Verify admin authentication
    return admin:verifyAdminToken(token);
}

# Helper function to create authentication error response
function createAuthError(string message) returns types:AdminErrorResponse {
    return {
        status_code: 401,
        errorMessage: "Authentication failed",
        message: message,
        details: ()
    };
}
