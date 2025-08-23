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

    // Always start as pending regardless of client input
    types:DonorPostCreate pendingRequest = {
        donor_id: request.donor_id, // not used by DB insert; userId is authoritative
        title: request.title,
        category: request.category,
        content: request.content,
        location: request.location,
        status: "pending",
        urgency: request.urgency,
        contact: request.contact,
        bloodOffering: request.bloodOffering,
        fundraiserOffering: request.fundraiserOffering,
        medicineOffering: request.medicineOffering,
        organOffering: request.organOffering
    };

    // Insert into DB (include userId)
    int|error insertResult = database:createDonorPost(userId, pendingRequest);
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
    // Only include approved (open) posts in public feed
    types:DonorPost[] approved = from types:DonorPost p in posts
        where p.status == "open"
        select p;
    return approved;
}

# List donor posts with status 'pending'
# + return - Array of pending donor posts or error
public isolated function getPendingDonorPosts() returns types:DonorPost[]|error {
    types:DonorPost[]|error posts = database:getDonorPosts();
    if posts is error {
        return error("Failed to fetch donor posts: " + posts.message());
    }
    types:DonorPost[] pending = from types:DonorPost p in posts
        where p.status == "pending"
        select p;
    return pending;
}

# List donor posts with status 'rejected'
# + return - Array of rejected donor posts or error
public isolated function getRejectedDonorPosts() returns types:DonorPost[]|error {
    types:DonorPost[]|error posts = database:getDonorPosts();
    if posts is error {
        return error("Failed to fetch donor posts: " + posts.message());
    }
    types:DonorPost[] rejected = from types:DonorPost p in posts
        where p.status == "rejected"
        select p;
    return rejected;
}

# Approve a donor post (set status to 'open')
# + postId - ID of the donor post to approve
# + return - Updated donor post or error
public isolated function approveDonorPost(int postId) returns types:DonorPost|error {
    boolean|error res = database:updateDonorPost(postId, { status: "open" });
    if res is error {
        return error("Failed to approve donor post: " + res.message());
    }
    types:DonorPost|error|() fetched = database:getDonorPostById(postId);
    if fetched is error {
        return error("Failed to fetch donor post after approve: " + fetched.message());
    }
    if fetched is () { return error("Donor post not found after approve"); }
    return <types:DonorPost>fetched;
}

# Reject a donor post (set status to 'rejected')
# + postId - ID of the donor post to reject
# + return - Updated donor post or error
public isolated function rejectDonorPost(int postId) returns types:DonorPost|error {
    boolean|error res = database:updateDonorPost(postId, { status: "rejected" });
    if res is error {
        return error("Failed to reject donor post: " + res.message());
    }
    types:DonorPost|error|() fetched = database:getDonorPostById(postId);
    if fetched is error {
        return error("Failed to fetch donor post after reject: " + fetched.message());
    }
    if fetched is () { return error("Donor post not found after reject"); }
    return <types:DonorPost>fetched;
}

# Convert a DonorPost to RecipientPostResponse shape for admin UI reuse
# + p - Donor post to convert
# + return - RecipientPostResponse compatible object
isolated function toRecipientResponse(types:DonorPost p) returns types:RecipientPostResponse|error {
    types:User?|error uRes = database:getUserById(p.donor_id);
    if uRes is error { return error("Failed to load donor user: " + uRes.message()); }
    if uRes is () { return error("Donor user not found"); }
    types:User u = <types:User>uRes;

    // Convert categories JSON string to array
    types:Category[]|error catRes = database:convertJsonToCategories(u.categories);
    types:Category[] cats = [];
    if catRes is types:Category[] { cats = catRes; }

    types:RecipientPostResponse resp = {
        id: p.id,
        user: {
            id: u.id ?: 0,
            name: u.name,
            phone_number: u.phone_number,
            email: u.email,
            role: u.role,
            categories: cats
        },
        title: p.title,
        content: p.content,
        category: p.category,
        status: p.status,
        location: p.location,
        urgency: p.urgency,
        createdAt: p.createdAt,
        engagement: {
            likes: p.engagement.likes,
            comments: p.engagement.comments,
            shares: p.engagement.shares,
            views: p.engagement.views
        },
        contact: p.contact,
        fundraiserDetails: ()
    };
    return resp;
}

# Helper: map an array of DonorPost to RecipientPostResponse[]
# + posts - Array of donor posts to convert
# + return - Converted array or error
isolated function mapToRecipientResponses(types:DonorPost[] posts) returns types:RecipientPostResponse[]|error {
    types:RecipientPostResponse[] out = [];
    foreach var p in posts {
        types:RecipientPostResponse|error r = toRecipientResponse(p);
        if r is error { return r; }
        out.push(r);
    }
    return out;
}

# Admin-friendly pending donor posts as RecipientPostResponse[]
# + return - Array of pending donor posts in recipient response shape or error
public isolated function getPendingDonorPostsForAdmin() returns types:RecipientPostResponse[]|error {
    types:DonorPost[]|error pending = getPendingDonorPosts();
    if pending is error { return pending; }
    return mapToRecipientResponses(pending);
}

# Admin-friendly rejected donor posts as RecipientPostResponse[]
# + return - Array of rejected donor posts in recipient response shape or error
public isolated function getRejectedDonorPostsForAdmin() returns types:RecipientPostResponse[]|error {
    types:DonorPost[]|error rejected = getRejectedDonorPosts();
    if rejected is error { return rejected; }
    return mapToRecipientResponses(rejected);
}

# Admin-friendly active (open) donor posts as RecipientPostResponse[]
# + return - Array of open donor posts in recipient response shape or error
public isolated function getOpenDonorPostsForAdmin() returns types:RecipientPostResponse[]|error {
    // getAllDonorPosts already filters to only 'open'
    types:DonorPost[]|error open = getAllDonorPosts();
    if open is error { return open; }
    return mapToRecipientResponses(open);
}

# Admin-friendly single donor post detail as RecipientPostResponse
# + postId - Donor post ID to fetch
# + return - Post details in recipient response shape or error
public isolated function getDonorPostDetailsForAdmin(int postId) returns types:RecipientPostResponse|error {
    types:DonorPost|error|() fetched = database:getDonorPostById(postId);
    if fetched is error { return error("Failed to fetch donor post: " + fetched.message()); }
    if fetched is () { return error("Donor post not found"); }
    return toRecipientResponse(<types:DonorPost>fetched);
}

# Get donor posts by user ID
# + userId - ID of the user whose posts to fetch
# + return - Array of donor posts or error
public isolated function getDonorPostsByUser(int userId) returns types:DonorPost[]|error {
    types:DonorPost[]|error posts = database:getDonorPosts();
    if posts is error {
        return error("Failed to fetch donor posts: " + posts.message());
    }
    
    // Filter posts by user ID and only approved (open)
    types:DonorPost[] userPosts = from types:DonorPost post in posts
        where post.donor_id == userId && post.status == "open"
        select post;
    return userPosts;
}
