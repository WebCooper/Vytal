import backend.database;
import backend.types;

# Create a new donation record
# + donorId - ID of the donor creating the donation
# + request - Donation creation request data
# + return - ID of the created donation or error if operation fails
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

# Get donations by donor with optional status filtering
# + donorId - ID of the donor to retrieve donations for
# + status - Optional status filter for donations
# + return - Array of donation responses or error if operation fails
public isolated function getDonationsByDonor(int donorId, string? status = ()) returns types:DonationResponse[]|error {
    return database:getDonationsByDonor(donorId, status);
}

# Update donation status and details
# + donationId - ID of the donation to update
# + request - Donation update request containing fields to modify
# + return - True if donation was updated successfully, false if not found, or error if operation fails
public isolated function updateDonation(int donationId, types:DonationUpdate request) returns boolean|error {
    return database:updateDonation(donationId, request);
}

# Get donor statistics summary
# + donorId - ID of the donor to retrieve statistics for
# + return - Donor statistics record or error if operation fails
public isolated function getDonorStats(int donorId) returns types:DonorStats|error {
    return database:getDonorStats(donorId);
}

# Get donor achievements list
# + donorId - ID of the donor to retrieve achievements for
# + return - Array of achievement records or error if operation fails
public isolated function getDonorAchievements(int donorId) returns types:Achievement[]|error {
    return database:getDonorAchievements(donorId);
}

# Get comprehensive donor dashboard data
# + donorId - ID of the donor to retrieve dashboard data for
# + return - Dashboard data including stats, recent donations, achievements, and availability or error if operation fails
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

# Calculate blood donation availability for a donor
# + donorId - ID of the donor to check availability for
# + return - Record containing blood donation availability information or error if operation fails
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
# + donorId - ID of the donor to award achievement to
# + achievementType - Type or category of achievement
# + achievementName - Display name of the achievement
# + description - Description of what the achievement represents
# + metadata - Optional additional metadata about the achievement
# + return - ID of the created achievement record or error if operation fails
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

# Helper function to get current date as string
# + return - Current date as a string in YYYY-MM-DD format
isolated function getCurrentDate() returns string {
    // Simplified - you should use proper date library
    return "2025-01-01"; // Replace with actual date logic
}