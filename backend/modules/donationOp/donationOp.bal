import backend.database;
import backend.types;

# Create a new donation
public isolated function createDonation(int donorId, types:DonationCreate request) returns int|error {
    // Insert main donation record
    record {
        int donor_id;
        int? recipient_id;
        int? post_id;
        string donation_type;
        decimal? amount;
        string? quantity;
        string? description;
        string donation_date;
        string status;
        string? location;
        string? notes;
    } donationData = {
        donor_id: donorId,
        recipient_id: request.recipient_id,
        post_id: request.post_id,
        donation_type: request.donation_type,
        amount: request.amount,
        quantity: request.quantity,
        description: request.description,
        donation_date: request.donation_date,
        status: "completed",
        location: request.location,
        notes: request.notes
    };

    int donationId = check database:insertDonation(donationData);

    // If blood donation, insert blood-specific details
    if request.donation_type == "blood" && request.blood_type is string {
        record {
            int donation_id;
            string blood_type;
            int volume_ml;
            decimal? hemoglobin_level;
            string? donation_center;
        } bloodData = {
            donation_id: donationId,
            blood_type: <string>request.blood_type,
            volume_ml: request.volume_ml ?: 450, // Default 450ml
            hemoglobin_level: request.hemoglobin_level,
            donation_center: request.donation_center
        };
        _ = check database:insertBloodDonation(bloodData);
    }

    return donationId;
}

# Get donations by donor
public isolated function getDonationsByDonor(int donorId, string? status = ()) returns types:DonationResponse[]|error {
    return database:getDonationsByDonor(donorId, status);
}

# Update donation status
public isolated function updateDonation(int donationId, types:DonationUpdate request) returns boolean|error {
    return database:updateDonation(donationId, request);
}

# Get donor statistics
public isolated function getDonorStats(int donorId) returns types:DonorStats|error {
    return database:getDonorStats(donorId);
}

# Get donor achievements
public isolated function getDonorAchievements(int donorId) returns types:Achievement[]|error {
    return database:getDonorAchievements(donorId);
}

# Get donor dashboard data
public isolated function getDonorDashboard(int donorId) returns types:DonorDashboard|error {
    // Get stats
    types:DonorStats stats = check getDonorStats(donorId);
    
    // Get recent donations (last 10)
    types:DonationResponse[] recentDonations = check database:getRecentDonationsByDonor(donorId, 10);
    
    // Get achievements
    types:Achievement[] achievements = check getDonorAchievements(donorId);
    
    // Calculate blood donation eligibility
    record {|
        boolean can_donate_blood;
        string? next_eligible_date;
        string? last_donation_date;
    |} availability = check calculateBloodDonationAvailability(donorId);
    
    return {
        stats: stats,
        recent_donations: recentDonations,
        achievements: achievements,
        availability: availability
    };
}

# Calculate blood donation availability
isolated function calculateBloodDonationAvailability(int donorId) returns record {|
    boolean can_donate_blood;
    string? next_eligible_date;
    string? last_donation_date;
|}|error {
    // Get last blood donation
    types:BloodDonation? lastBloodDonation = check database:getLastBloodDonation(donorId);
    
    if lastBloodDonation is () {
        return {
            can_donate_blood: true,
            next_eligible_date: (),
            last_donation_date: ()
        };
    }
    
    // Calculate next eligible date (8 weeks = 56 days for whole blood)
    string? nextEligibleDate = lastBloodDonation.next_eligible_date;
    
    // For now, return basic availability
    // You can add more complex date calculations here
    return {
        can_donate_blood: true, // Simplified - add real date logic
        next_eligible_date: nextEligibleDate,
        last_donation_date: lastBloodDonation.created_at
    };
}

# Award achievement to donor
public isolated function awardAchievement(int donorId, string achievementType, string achievementName, string description, json? metadata = ()) returns int|error {
    record {
        int donor_id;
        string achievement_type;
        string achievement_name;
        string description;
        string earned_date;
        json? metadata;
    } achievementData = {
        donor_id: donorId,
        achievement_type: achievementType,
        achievement_name: achievementName,
        description: description,
        earned_date: getCurrentDate(),
        metadata: metadata
    };

    return database:insertAchievement(achievementData);
}

# Helper function to get current date
isolated function getCurrentDate() returns string {
    // Simplified - you should use proper date library
    return "2025-01-01"; // Replace with actual date logic
}