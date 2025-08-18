# Admin-specific request/response types

# Admin authentication request
public type AdminLoginRequest record {|
    # Email address of the admin
    string email;
    # Password for authentication
    string password;
|};

# Admin authentication response
public type AdminLoginResponse record {|
    # JWT token for authenticated admin
    string token;
    # Email of the authenticated admin
    string email;
    # Role of the authenticated user
    string role;
    # Status or success message
    string message;
|};

# User management types
public type UserListRequest record {|
    # Page number for pagination
    int? page;
    # Number of items per page
    int? pageLimit;
    # Search string for filtering users
    string? search;
    # Role to filter users by
    Role? role;
    # Status to filter users by (active, inactive, suspended)
    string? status; // active, inactive, suspended
|};

# Response for user list request
public type UserListResponse record {|
    # Array of user summaries
    UserSummary[] users;
    # Pagination information
    PaginationInfo pagination;
|};

# Summary of user information for admin views
public type UserSummary record {|
    # User ID
    int id;
    # User's full name
    string name;
    # User's email address
    string email;
    # User's phone number
    string phone_number;
    # User's role in the system
    Role role;
    # User's account status
    string status;
    # Date and time when user was created
    string created_at;
    # Date and time of last login
    string? last_login;
|};

# Detailed user information response
public type UserDetailsResponse record {|
    # User ID
    int id;
    # User's full name
    # User's full name
    string name;
    # User's email address
    string email;
    # User's phone number
    string phone_number;
    # User's role in the system
    Role role;
    # User's categories of interest
    Category[] categories;
    # User's account status
    string status;
    # Date and time when user was created
    string created_at;
    # Date and time of last update
    string? updated_at;
    # Date and time of last login
    string? last_login;
    # User's activity statistics
    UserStats stats;
|};

# User statistics for admin dashboard
public type UserStats record {|
    # Total number of posts created by user
    int total_posts;
    # Number of active posts
    int active_posts;
    # Number of completed posts
    int completed_posts;
    # Number of donations made (for donors)
    int? donations_made; // for donors
    # Number of donations received (for recipients)
    int? donations_received; // for recipients
|};

# Request to update user status
public type UserStatusUpdate record {|
    # New status value (active, inactive, suspended)
    string status; // active, inactive, suspended
    # Reason for status change
    string? reason;
|};

# Post management types
public type PostListRequest record {|
    # Page number for pagination
    int? page;
    # Number of items per page
    int? pageLimit;
    # Search string for filtering posts
    string? search;
    # Category to filter posts by
    Category? category;
    # Status to filter posts by
    Status? status;
    # Urgency to filter posts by
    Urgency? urgency;
    # Start date for filtering posts
    string? date_from;
    # End date for filtering posts
    string? date_to;
|};

public type PostListResponse record {|
    PostSummary[] posts;
    PaginationInfo pagination;
|};

public type PostSummary record {|
    int id;
    string title;
    Category category;
    Status status;
    Urgency? urgency;
    string author_name;
    string author_email;
    string created_at;
    int views;
    int likes;
    boolean needs_review;
|};

public type PostDetailsResponse record {|
    int id;
    string title;
    string content;
    Category category;
    Status status;
    Urgency? urgency;
    string? location;
    string? contact;
    UserSummary author;
    string created_at;
    string? updated_at;
    Engagement engagement;
    FundraiserDetails? fundraiser_details;
    PostModerationInfo moderation;
|};

public type PostModerationInfo record {|
    boolean flagged;
    string[] flags; // inappropriate, spam, fake, etc.
    int report_count;
    string? moderator_notes;
    string? last_reviewed;
    string? last_reviewer;
|};

public type PostStatusUpdate record {|
    Status status;
    string? moderator_notes;
|};

# Analytics types
public type AnalyticsOverview record {|
    # User-related analytics data
    UserAnalytics user_analytics;
    # Post-related analytics data
    PostAnalytics post_analytics;
    # Engagement analytics data
    EngagementAnalytics engagement_analytics;
    # System health information
    SystemHealth system_health;
|};

public type UserAnalytics record {|
    int total_users;
    int active_users;
    int new_users_today;
    int new_users_this_week;
    int new_users_this_month;
    UsersByRole users_by_role;
    UserGrowthData[] growth_data;
|};

public type UsersByRole record {|
    int donors;
    int recipients;
    int organizations;
    int admins;
|};

public type UserGrowthData record {|
    string date;
    int new_users;
    int total_users;
|};

public type PostAnalytics record {|
    int total_posts;
    int pending_posts;
    int active_posts;
    int completed_posts;
    int flagged_posts;
    PostsByCategory posts_by_category;
    PostsByUrgency posts_by_urgency;
    PostTrendData[] trend_data;
|};

public type PostsByCategory record {|
    int blood;
    int organs;
    int medicines;
    int supplies;
    int fundraiser;
|};

public type PostsByUrgency record {|
    int low;
    int medium;
    int high;
|};

public type PostTrendData record {|
    string date;
    int new_posts;
    int completed_posts;
|};

public type EngagementAnalytics record {|
    int total_views;
    int total_likes;
    int total_comments;
    int total_shares;
    decimal avg_engagement_rate;
    EngagementTrendData[] trend_data;
|};

public type EngagementTrendData record {|
    string date;
    int views;
    int likes;
    int comments;
    int shares;
|};

public type SystemHealth record {|
    string status; // healthy, warning, critical
    int uptime_percentage;
    int response_time_ms;
    int error_rate_percentage;
    string last_backup;
    SystemAlerts[] active_alerts;
|};

public type SystemAlerts record {|
    string id;
    string severity; // info, warning, error, critical
    string message;
    string created_at;
|};

# Pagination utility
public type PaginationInfo record {|
    # Current page number
    int current_page;
    # Total number of pages
    int total_pages;
    # Total number of items across all pages
    int total_items;
    # Number of items per page
    int items_per_page;
    # Whether there is a next page
    boolean has_next;
    # Whether there is a previous page
    boolean has_previous;
|};

# Error response type
public type AdminErrorResponse record {|
    # HTTP status code
    int status_code;
    # Error message for developers
    string errorMessage;
    # User-friendly error message
    string message;
    # Additional error details
    string? details;
|};

# Success response type
public type AdminSuccessResponse record {|
    # HTTP status code
    int status_code;
    # Success message
    string message;
    # Additional response data
    anydata? data;
|};

# Settings management types
public type SystemSettings record {|
    # General system settings
    GeneralSettings general;
    # Security-related settings
    SecuritySettings security;
    # Notification configuration
    NotificationSettings notifications;
    # Content moderation settings
    ModerationSettings moderation;
|};

public type GeneralSettings record {|
    string site_name;
    string site_description;
    boolean maintenance_mode;
    boolean registration_enabled;
    string? maintenance_message;
|};

public type SecuritySettings record {|
    boolean require_email_verification;
    int password_min_length;
    int session_timeout_minutes;
    int max_login_attempts;
    boolean two_factor_enabled;
|};

public type NotificationSettings record {|
    boolean email_notifications;
    boolean new_user_alerts;
    boolean post_approval_alerts;
    boolean system_alerts;
    string admin_email;
|};

public type ModerationSettings record {|
    boolean auto_approve_users;
    boolean auto_approve_posts;
    boolean require_post_review;
    boolean allow_anonymous_posts;
    string[] flagged_keywords;
|};

public type SettingsUpdateRequest record {|
    GeneralSettings? general;
    SecuritySettings? security;
    NotificationSettings? notifications;
    ModerationSettings? moderation;
|};
