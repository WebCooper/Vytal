import ballerina/crypto;
import ballerina/log;
import ballerina/time;
import backend.database;
import backend.types;
import backend.token;

# Admin login with secure authentication
# + request - Admin login request containing email and password
# + return - Admin login response with token or error if authentication fails
public function adminLogin(types:AdminLoginRequest request) returns types:AdminLoginResponse|error {
    // Validate admin credentials
    types:User?|error adminResult = database:getUserByEmail(request.email);
    
    if adminResult is error {
        log:printError("Admin login failed - database error", email = request.email, 'error = adminResult);
        return error("Invalid credentials");
    }
    
    // Check if admin exists
    if adminResult is () {
        log:printError("Admin login failed - user not found", email = request.email);
        return error("Invalid credentials");
    }
    
    types:User admin = adminResult;
    
    // Verify admin role
    if admin.role != types:ADMIN {
        log:printError("Unauthorized admin access attempt", email = request.email, role = admin.role);
        return error("Unauthorized access");
    }
    
    // Verify password (simplified for now - use proper bcrypt in production)
    boolean isValidPassword = verifyPassword(request.password, admin.password);
    if !isValidPassword {
        log:printError("Admin login failed - invalid password", email = request.email);
        return error("Invalid credentials");
    }
    
    // Check if admin account is active
    if admin.status != "active" {
        log:printError("Admin login failed - account inactive", email = request.email, status = admin.status);
        return error("Account is not active");
    }
    
    // Generate JWT token with admin claims
    string|error tokenResult = generateAdminToken(admin);
    if tokenResult is error {
        log:printError("Failed to generate admin token", email = request.email, 'error = tokenResult);
        return error("Authentication failed");
    }
    
    // Update last login
    error? updateResult = database:updateLastLogin(admin.id ?: 0);
    if updateResult is error {
        log:printError("Failed to update last login", userId = admin.id, 'error = updateResult);
    }
    
    log:printInfo("Admin login successful", email = request.email, adminId = admin.id);
    
    return {
        token: tokenResult,
        email: admin.email,
        role: admin.role.toString(),
        message: "Login successful"
    };
}

# Verify admin token and return admin user
# + tokenValue - JWT token to verify
# + return - User record if token is valid, error if not
public function verifyAdminToken(string tokenValue) returns types:User|error {
    // Validate JWT token using existing token module
    string|error emailResult = token:validateToken("Bearer " + tokenValue);
    if emailResult is error {
        return error("Invalid token");
    }
    
    // Get user from database
    types:User?|error userResult = database:getUserByEmail(emailResult);
    if userResult is error {
        return error("User not found: " + userResult.message());
    }
    
    // Check if user exists
    if userResult is () {
        return error("User not found");
    }
    
    types:User user = userResult;
    
    // Verify admin role
    if user.role != types:ADMIN {
        return error("Insufficient privileges");
    }
    
    // Verify account status
    if user.status != "active" {
        return error("Account is not active");
    }
    
    return user;
}

# Generate admin JWT token with extended claims
# + admin - Admin user for which to generate token
# + return - JWT token string or error if generation fails
function generateAdminToken(types:User admin) returns string|error {
    // Use existing token generation function
    return token:generateToken(admin.email);
}

# Verify password using crypto (simplified - use bcrypt in production)
# + plainPassword - Plain text password from login request
# + hashedPassword - Hashed password from database
# + return - True if password matches, false otherwise
function verifyPassword(string plainPassword, string hashedPassword) returns boolean {
    byte[] plainBytes = plainPassword.toBytes();
    string hashedPlain = crypto:hashSha256(plainBytes).toBase16();
    return hashedPlain == hashedPassword;
}

# Get user list with filtering and pagination
# + request - User list request with filtering and pagination parameters
# + return - User list response with pagination info or error if operation fails
public function getUserList(types:UserListRequest request) returns types:UserListResponse|error {
    // Set default values
    int page = request.page ?: 1;
    int pageLimit = request.pageLimit ?: 10;
    
    // Validate pagination parameters
    if page < 1 {
        return error("Page number must be greater than 0");
    }
    
    if pageLimit < 1 || pageLimit > 100 {
        return error("Page limit must be between 1 and 100");
    }
    
    // Calculate offset
    int offset = (page - 1) * pageLimit;
    
    // Get filtered users from database
    types:UserSummary[]|error users = database:getFilteredUsers(request.search, request.role, 
                                                              request.status, pageLimit, offset);
    if users is error {
        log:printError("Failed to fetch users", 'error = users);
        return error("Failed to fetch users");
    }
    
    // Get total count for pagination
    int|error totalCount = database:getUserCount(request.search, request.role, request.status);
    if totalCount is error {
        log:printError("Failed to get user count", 'error = totalCount);
        return error("Failed to get user count");
    }
    
    // Calculate pagination info
    int totalPages = (totalCount + pageLimit - 1) / pageLimit;
    
    types:PaginationInfo pagination = {
        current_page: page,
        total_pages: totalPages,
        total_items: totalCount,
        items_per_page: pageLimit,
        has_next: page < totalPages,
        has_previous: page > 1
    };
    
    return {
        users: users,
        pagination: pagination
    };
}

# Get user details with statistics
# + userId - ID of the user to retrieve details for
# + return - User details response or error if user not found
public function getUserDetails(int userId) returns types:UserDetailsResponse|error {
    // Get user from database
    types:User?|error userResult = database:getUserById(userId);
    
    if userResult is error {
        return error("Error fetching user: " + userResult.message());
    }
    
    // Check if user exists
    if userResult is () {
        return error("User not found");
    }
    
    types:User user = userResult;
    
    // Get user statistics
    types:UserStats|error statsResult = database:getUserStats(userId);
    types:UserStats stats;
    
    if statsResult is error {
        log:printError("Failed to get user stats", userId = userId, 'error = statsResult);
        // Default stats
        stats = {
            total_posts: 0,
            active_posts: 0,
            completed_posts: 0,
            donations_made: (),
            donations_received: ()
        };
    } else {
        stats = statsResult;
    }
    
    // Parse categories from JSON string - simplified for now
    types:Category[] categories = []; // TODO: Add proper JSON parsing for categories
    
    // Build the response
    types:UserDetailsResponse response = {
        id: user.id ?: 0,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role,
        categories: categories,
        status: user.status,
        created_at: user.created_at ?: "",
        updated_at: user.updated_at,
        last_login: (), // Get from database if tracked
        stats: stats
    };
    
    return response;
}

# Update user status (activate, deactivate, suspend)
# + userId - ID of the user to update status
# + update - Status update request with new status and reason
# + return - Success response or error if update fails
public function updateUserStatus(int userId, types:UserStatusUpdate update) returns types:AdminSuccessResponse|error {
    // Validate status
    if update.status != "active" && update.status != "inactive" && update.status != "suspended" {
        return error("Invalid status. Must be 'active', 'inactive', or 'suspended'");
    }
    
    // Update user status in database
    error? result = database:updateUserStatus(userId, update.status, update.reason);
    if result is error {
        log:printError("Failed to update user status", userId = userId, 'error = result);
        return error("Failed to update user status");
    }
    
    log:printInfo("User status updated", userId = userId, status = update.status, reason = update.reason);
    
    return {
        status_code: 200,
        message: "User status updated successfully",
        data: ()
    };
}

# Get analytics overview (simplified implementation)
# + return - Analytics overview with various metrics or error if operation fails
public function getAnalyticsOverview() returns types:AnalyticsOverview|error {
    // Create mock analytics data - implement with real database queries
    types:UserAnalytics userAnalytics = {
        total_users: 150,
        active_users: 120,
        new_users_today: 5,
        new_users_this_week: 25,
        new_users_this_month: 80,
        users_by_role: {
            donors: 80,
            recipients: 60,
            organizations: 8,
            admins: 2
        },
        growth_data: []
    };
    
    types:PostAnalytics postAnalytics = {
        total_posts: 45,
        pending_posts: 8,
        active_posts: 25,
        completed_posts: 10,
        flagged_posts: 2,
        posts_by_category: {
            blood: 20,
            organs: 5,
            medicines: 8,
            supplies: 7,
            fundraiser: 5
        },
        posts_by_urgency: {
            low: 15,
            medium: 20,
            high: 10
        },
        trend_data: []
    };
    
    types:EngagementAnalytics engagementAnalytics = {
        total_views: 2500,
        total_likes: 450,
        total_comments: 120,
        total_shares: 80,
        avg_engagement_rate: 18.5,
        trend_data: []
    };
    
    types:SystemHealth systemHealth = {
        status: "healthy",
        uptime_percentage: 99,
        response_time_ms: 150,
        error_rate_percentage: 1,
        last_backup: time:utcToString(time:utcNow()),
        active_alerts: []
    };
    
    return {
        user_analytics: userAnalytics,
        post_analytics: postAnalytics,
        engagement_analytics: engagementAnalytics,
        system_health: systemHealth
    };
}
