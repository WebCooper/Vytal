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
    PostPreview? post; // ✅ corrected: nullable, but field always exists
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
        MessageWithUsers converted = {
            id: msg.id,
            sender_id: msg.sender_id,
            receiver_id: msg.receiver_id,
            post_id: msg.post_id,
            subject: msg.subject,
            content: msg.content,
            message_type: msg.message_type,
            status: msg.status,
            created_at: msg.created_at,
            updated_at: msg.updated_at,
            sender: msg.sender,
            receiver: msg.receiver,
            post: msg?.post // ✅ safe access
        };
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
    return ();
}

// Get unread count
public function getUnreadCount(int userId) returns int|error {
    return database:getUnreadMessageCount(userId);
}
