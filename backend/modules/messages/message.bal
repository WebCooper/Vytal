// backend/modules/messages/message.bal
import backend.types;
import backend.database;
import ballerina/time;
import ballerina/sql;

public type PostPreview record {
    int id;
    string title;
    string category;
};

public type MessageWithUsers record {
    int id;
    int sender_id;
    int receiver_id;
    int? post_id;
    string subject;
    string content;
    string message_type;
    string status;
    string created_at;
    string updated_at;
    types:UserPreview sender;
    types:UserPreview receiver;
    PostPreview? post; // Keep as PostPreview?
};

public type CreateMessageRequest record {
    int sender_id;
    int receiver_id;
    int? post_id;
    string subject;
    string content;
    string message_type;
};

public type MessageResponse record {
    string message;
    MessageWithUsers data;
    string timestamp;
};

public type MessagesListResponse record {
    MessageWithUsers[] data;
    int total;
    string timestamp;
};

// New types for conversation handling
public type ConversationSummary record {
    int other_user_id;
    types:UserPreview other_user;
    MessageWithUsers latest_message;
    int unread_count;
    string last_activity;
};

public type ConversationsListResponse record {
    ConversationSummary[] data;
    int total;
    string timestamp;
};

// Helper function to convert database record to PostPreview
function convertToPostPreview(record {int id; string title; string category;}? dbPost) returns PostPreview? {
    if dbPost is () {
        return ();
    }
    return {
        id: dbPost.id,
        title: dbPost.title,
        category: dbPost.category
    };
}

// Helper function to convert database message to MessageWithUsers
function convertDbMessageToMessageWithUsers(record {
    int id;
    int sender_id;
    int receiver_id;
    int? post_id;
    string subject;
    string content;
    string message_type;
    string status;
    string created_at;
    string updated_at;
    types:UserPreview sender;
    types:UserPreview receiver;
    record {int id; string title; string category;}? post?;
} dbMsg) returns MessageWithUsers {
    return {
        id: dbMsg.id,
        sender_id: dbMsg.sender_id,
        receiver_id: dbMsg.receiver_id,
        post_id: dbMsg.post_id,
        subject: dbMsg.subject,
        content: dbMsg.content,
        message_type: dbMsg.message_type,
        status: dbMsg.status,
        created_at: dbMsg.created_at,
        updated_at: dbMsg.updated_at,
        sender: dbMsg.sender,
        receiver: dbMsg.receiver,
        post: convertToPostPreview(dbMsg?.post)
    };
}

// Send a new message - saves to database
public function sendMessage(CreateMessageRequest messageData) returns MessageResponse|error {
    time:Utc currentTime = time:utcNow();
    string timestamp = time:utcToString(currentTime);

    // Save message to database
    sql:ExecutionResult result = check database:insertMessage(messageData);

    int|string? lastInsertId = result.lastInsertId;
    if lastInsertId is int {
        // Return response with the real database ID
        MessageWithUsers savedMessage = {
            id: lastInsertId,
            sender_id: messageData.sender_id,
            receiver_id: messageData.receiver_id,
            post_id: messageData.post_id,
            subject: messageData.subject,
            content: messageData.content,
            message_type: messageData.message_type,
            status: "unread",
            created_at: timestamp,
            updated_at: timestamp,
            sender: {
                id: messageData.sender_id,
                name: "Sender",
                email: "sender@example.com",
                role: "user"
            },
            receiver: {
                id: messageData.receiver_id,
                name: "Receiver", 
                email: "receiver@example.com",
                role: "user"
            },
            post: () // optional, can be nil
        };

        return {
            message: "Message sent successfully",
            data: savedMessage,
            timestamp: timestamp
        };
    }

    return error("Failed to send message - no lastInsertId");
}

// Get messages for user - fetches from database
public function getMessagesForUser(int userId, string? status = ()) returns MessagesListResponse|error {
    time:Utc currentTime = time:utcNow();
    string timestamp = time:utcToString(currentTime);

    // Fetch messages from database
    var messages = check database:getMessagesForUser(userId, status);

    // Convert database records to MessageWithUsers
    MessageWithUsers[] convertedMessages = [];
    foreach var msg in messages {
        MessageWithUsers converted = convertDbMessageToMessageWithUsers(msg);
        convertedMessages.push(converted);
    }

    return {
        data: convertedMessages,
        total: convertedMessages.length(),
        timestamp: timestamp
    };
}

// Get conversation between two users
public function getConversation(int userId1, int userId2) returns MessagesListResponse|error {
    time:Utc currentTime = time:utcNow();
    string timestamp = time:utcToString(currentTime);

    return {
        data: [],
        total: 0,
        timestamp: timestamp
    };
}

// Mark message as read
public function markMessageAsRead(int messageId) returns error? {
    return database:markMessageAsRead(messageId);
}

// Mark conversation as read
public function markConversationAsRead(int senderId, int receiverId) returns error? {
    return database:markConversationAsRead(senderId, receiverId);
}

// Get unread count
public function getUnreadCount(int userId) returns int|error {
    return database:getUnreadMessageCount(userId);
}

// Get sent messages for user
public function getSentMessagesForUser(int userId, string? status = ()) returns MessagesListResponse|error {
    time:Utc currentTime = time:utcNow();
    string timestamp = time:utcToString(currentTime);

    // Fetch sent messages from database
    var messages = check database:getSentMessagesForUser(userId, status);

    // Convert database records to MessageWithUsers
    MessageWithUsers[] convertedMessages = [];
    foreach var msg in messages {
        MessageWithUsers converted = convertDbMessageToMessageWithUsers(msg);
        convertedMessages.push(converted);
    }

    return {
        data: convertedMessages,
        total: convertedMessages.length(),
        timestamp: timestamp
    };
}

// Get conversation between two users (both sent and received)
public function getConversationBetweenUsers(int userId1, int userId2) returns MessagesListResponse|error {
    time:Utc currentTime = time:utcNow();
    string timestamp = time:utcToString(currentTime);

    // Fetch conversation from database
    var messages = check database:getConversationBetweenUsers(userId1, userId2);

    // Convert database records to MessageWithUsers
    MessageWithUsers[] convertedMessages = [];
    foreach var msg in messages {
        MessageWithUsers converted = convertDbMessageToMessageWithUsers(msg);
        convertedMessages.push(converted);
    }

    return {
        data: convertedMessages,
        total: convertedMessages.length(),
        timestamp: timestamp
    };
}

// Get all conversations for a user (summary view)
public function getUserConversations(int userId) returns ConversationsListResponse|error {
    time:Utc currentTime = time:utcNow();
    string timestamp = time:utcToString(currentTime);

    // Get conversations from database
    var conversations = check database:getUserConversations(userId);

    ConversationSummary[] conversationSummaries = [];
    foreach var conv in conversations {
        ConversationSummary summary = {
            other_user_id: conv.other_user_id,
            other_user: conv.other_user,
            latest_message: convertDbMessageToMessageWithUsers(conv.latest_message),
            unread_count: conv.unread_count,
            last_activity: conv.last_activity
        };
        conversationSummaries.push(summary);
    }

    return {
        data: conversationSummaries,
        total: conversationSummaries.length(),
        timestamp: timestamp
    };
}