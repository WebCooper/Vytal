import backend.database;
import backend.types;
import backend.utils as validation;

# Create a donor post linked to a specific user
# + userId - ID of the user creating the post
# + request - Donor post creation payload
# + return - Created donor post or error
public isolated function createDonorPost(int userId, types:DonorPostCreate request) returns types:DonorPost|error {
    // Validate input
    error? validationResult = validation:validateDonorPostCreate(request);
    if validationResult is error {
        return validationResult;
    }

    // Insert into DB (include userId)
    int|error insertResult = database:createDonorPost(userId, request);
    if insertResult is error {
        return error("Failed to create donor post: " + insertResult.message());
    }

    int newId = <int>insertResult;

    // Retrieve the newly created donor post
    types:DonorPost|error|() dbPost = database:getDonorPostById(newId);

    if dbPost is error {
        return error("Failed to fetch donor post after creation: " + dbPost.message());
    }
    if dbPost is () {
        return error("Donor post not found after creation");
    }

    return <types:DonorPost>dbPost;
}


public isolated function getDonorPost(int id) returns types:DonorPost|error {
    types:DonorPost|error|() dbPost = database:getDonorPostById(id);

    if dbPost is error {
        return error("Failed to fetch donor post: " + dbPost.message());
    }
    if dbPost is () {
        return error("Donor post not found");
    }

    return <types:DonorPost>dbPost;
}


public isolated function getAllDonorPosts() returns types:DonorPost[]|error {
    types:DonorPost[]|error posts = database:getDonorPosts();
    if posts is error {
        return error("Failed to fetch donor posts: " + posts.message());
    }
    return posts;
}

# Get donor posts by user ID
# + userId - ID of the user whose posts to fetch
# + return - Array of donor posts or error
public isolated function getDonorPostsByUser(int userId) returns types:DonorPost[]|error {
    types:DonorPost[]|error posts = database:getDonorPosts();
    if posts is error {
        return error("Failed to fetch donor posts: " + posts.message());
    }
    
    // Filter posts by user ID
    types:DonorPost[] userPosts = [];
    foreach types:DonorPost post in posts {
        if post.donor_id == userId {
            userPosts.push(post);
        }
    }
    
    return userPosts;
}
