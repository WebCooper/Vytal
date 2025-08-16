import backend.types;
import backend.database;
import ballerina/sql;
import backend.userOp as userService;
# Create a new recipient post
# + userId - ID of the user creating the post
# + request - Details of the post to create
# + return - Created post response or error
public isolated function createRecipientPost(int userId, types:RecipientPostCreate request) 
        returns types:RecipientPostResponse|error {

    types:RecipientPostCreate newPost = {
        recipient_id: userId,
        title: request.title,
        content: request.content,
        category: request.category,
        status: request.status,
        location: request.location,
        urgency: request.urgency,
        contact: request.contact,
        goal: request.goal
    };

    sql:ExecutionResult result = check database:insertRecipientPost(newPost);
    int postId = <int>result.lastInsertId;
    
    // Fetch the created post to return complete response
    types:RecipientPost? createdPost = check database:getRecipientPostById(postId);
    if createdPost is () {
        return error("Failed to retrieve created post");
    }

    // Get user details for the response
    types:UserResponse|error userResult = getUserById(createdPost.recipient_id);
    if userResult is error {
        return error("Failed to retrieve user details");
    }

    return mapPostToResponse(createdPost, userResult);
}

# Helper function to get user by ID
# + userId - ID of the user to fetch
# + return - User response or error
isolated function getUserById(int userId) returns types:UserResponse|error {
    return userService:getUserById(userId);
}


# Helper function to map post data to response format
# + post - The post data from database
# + user - The user data
# + return - Formatted post response
isolated function mapPostToResponse(types:RecipientPost post, types:UserResponse user) returns types:RecipientPostResponse {
    types:Engagement engagement = {
        likes: post.likes,
        comments: post.comments,
        shares: post.shares,
        views: post.views
    };

    types:FundraiserDetails? fundraiserDetails = ();
    if (post.goal is decimal && post.received is decimal) {
        fundraiserDetails = {
            goal: post.goal ?: 0,
            received: post.received ?: 0
        };
    }

    return {
        id: post.id,
        user: user,
        title: post.title,
        content: post.content,
        category: post.category,
        status: post.status,
        location: post.location,
        urgency: post.urgency,
        createdAt: post.created_at ?: "",
        engagement: engagement,
        contact: post.contact,
        fundraiserDetails: fundraiserDetails
    };
}

# Fetch all recipient posts
# + return - Array of all recipient posts or error
public isolated function getAllRecipientPosts() returns types:RecipientPostResponse[]|error {
    types:RecipientPost[] posts = check database:getRecipientPosts();
    types:RecipientPostResponse[] responses = [];
    
    foreach types:RecipientPost post in posts {
        types:UserResponse|error userResult = getUserById(post.recipient_id);
        if userResult is error {
            continue; // Skip posts where we can't get user info
        }
        responses.push(mapPostToResponse(post, userResult));
    }
    
    return responses;
}

# Fetch recipient posts by user
# + userId - ID of the user whose posts to fetch
# + return - Array of recipient posts for the user or error
public isolated function getRecipientPostsByUser(int userId) returns types:RecipientPostResponse[]|error {
    types:RecipientPost[] allPosts = check database:getRecipientPosts();
    types:RecipientPost[] userPosts = from types:RecipientPost post in allPosts
        where post.recipient_id == userId
        select post;
    
    // Get user info once since all posts are from same user
    types:UserResponse|error userResult = getUserById(userId);
    if userResult is error {
        return error("Failed to retrieve user details");
    }
        
    types:RecipientPostResponse[] responses = [];
    foreach types:RecipientPost post in userPosts {
        responses.push(mapPostToResponse(post, userResult));
    }
    return responses;
}

# Update recipient post
# + postId - ID of the post to update
# + updateData - New data for the post
# + return - Updated post response or error
public isolated function updateRecipientPost(int postId, types:RecipientPostUpdate updateData) 
        returns types:RecipientPostResponse|error {
    
    // Get current post data
    types:RecipientPost? currentPost = check database:getRecipientPostById(postId);
    if currentPost is () {
        return error("Post not found");
    }
    
    // Create an updated post with non-null values from updateData
    types:RecipientPost updatedPost = {
        id: currentPost.id,
        recipient_id: currentPost.recipient_id,
        title: updateData.title ?: currentPost.title,
        content: updateData.content ?: currentPost.content,
        category: updateData.category ?: currentPost.category,
        status: updateData.status ?: currentPost.status,
        location: updateData.location ?: currentPost.location,
        urgency: updateData.urgency ?: currentPost.urgency,
        contact: updateData.contact ?: currentPost.contact,
        created_at: currentPost.created_at,
        updated_at: currentPost.updated_at,
        likes: currentPost.likes,
        comments: currentPost.comments,
        shares: currentPost.shares,
        views: currentPost.views,
        goal: updateData.goal ?: currentPost.goal,
        received: updateData.received ?: currentPost.received
    };

    _ = check database:updateRecipientPost(postId, updateData);
    
    // Get user details for the response
    types:UserResponse|error userResult = getUserById(updatedPost.recipient_id);
    if userResult is error {
        return error("Failed to retrieve user details");
    }

    return mapPostToResponse(updatedPost, userResult);
}

# Delete recipient post
# + postId - ID of the post to delete
# + return - Error if deletion fails
public isolated function deleteRecipientPost(int postId) returns error? {
    _ = check database:deleteRecipientPost(postId);
    return;
}
