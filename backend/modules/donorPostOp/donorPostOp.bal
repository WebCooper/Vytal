import backend.database;
import backend.types;
import backend.utils as validation;


public isolated function createDonorPost(types:DonorPostCreate request) returns types:DonorPost|error {
    // Validate input (you can extend validation module if needed)
    error? validationResult = validation:validateDonorPostCreate(request);
    if validationResult is error {
        return validationResult;
    }

    int|error insertResult = database:createDonorPost(request);
    if insertResult is error {
        return error("Failed to create donor post: " + insertResult.message());
    }

    int newId = <int>insertResult;
    
    // Safely handle the donor post retrieval
    types:DonorPost|error|() dbPost = database:getDonorPostById(newId);
    
    if dbPost is error {
        return error("Failed to fetch donor post after creation: " + dbPost.message());
    }
    if dbPost is () {
        return error("Donor post not found after creation");
    }

        return <types:DonorPost>dbPost;
}

# Get a donor post by ID
# + id - ID of the donor post to retrieve
# + return - Donor post record or error
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

# Get all donor posts
# + return - Array of donor posts or error
public isolated function getAllDonorPosts() returns types:DonorPost[]|error {
    types:DonorPost[]|error posts = database:getDonorPosts();
    if posts is error {
        return error("Failed to fetch donor posts: " + posts.message());
    }
    return posts;
}

// # Update a donor post
// # + id - ID of the donor post to update
// # + request - Updated donor post data
// # + return - Updated donor post or error
// public isolated function updateDonorPost(int id, types:DonorPostUpdate request) returns types:DonorPost|error {
//     // Validate post exists
//     types:DonorPost|error currentPost = getDonorPost(id);
//     if currentPost is error {
//         return currentPost;
//     }
    
//     // Validate update data (you can extend validation module if needed)
//     // error? validationResult = validation:validateDonorPostUpdate(request);
//     // if validationResult is error {
//     //     return validationResult;
//     // }
    
//     // Update the post
//     sql:ExecutionResult|error updateResult = database:updateDonorPost(id, request);
//     if updateResult is error {
//         return error("Failed to update donor post: " + updateResult.message());
//     }
    
//     // Fetch the updated post
//     return getDonorPost(id);
// }

// # Delete a donor post
// # + id - ID of the donor post to delete
// # + return - True if successful, error otherwise
// public isolated function deleteDonorPost(int id) returns boolean|error {
//     // Validate post exists
//     types:DonorPost|error currentPost = getDonorPost(id);
//     if currentPost is error {
//         return currentPost;
//     }
    
//     sql:ExecutionResult|error deleteResult = database:deleteDonorPost(id);
//     if deleteResult is error {
//         return error("Failed to delete donor post: " + deleteResult.message());
//     }
    
//     return true;
// }
