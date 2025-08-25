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
# Get donor analytics data
# + donorId - ID of the donor
# + range - Time range for analytics (1month, 3months, 6months, 1year)
# + return - Analytics data in JSON format or error if operation fails
public isolated function getDonorAnalytics(int donorId, string range) returns json|error {
    // Get donor stats and donations
    types:DonorStats stats = check database:getDonorStats(donorId);
    types:DonationResponse[] donations = check database:getDonationsByDonor(donorId);
    
    // Calculate monthly trends
    json[] monthlyTrends = [];
    string[] months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    
    foreach string month in months {
        json monthData = {
            "month": month,
            "donations": calculateDonationsForMonth(donations, month),
            "amount": calculateAmountForMonth(donations, month),
            "blood": calculateBloodDonationsForMonth(donations, month),
            "medicines": calculateMedicineDonationsForMonth(donations, month),
            "supplies": calculateSupplyDonationsForMonth(donations, month),
            "organs": calculateOrganDonationsForMonth(donations, month),
            "fundraiser": calculateFundraiserAmountForMonth(donations, month)
        };
        monthlyTrends.push(monthData);
    }
    
    // Calculate category distribution with proper type handling
    int totalDonations = stats.total_donations;
json[] categoryDistribution = [
    {
        "name": "Blood",
        "value": totalDonations > 0 ? (<decimal>stats.blood_donations * 100d) / <decimal>totalDonations : 0d,
        "color": "#ef4444"
    },
    {
        "name": "Medicines", 
        "value": totalDonations > 0 ? (<decimal>stats.medicine_donations * 100d) / <decimal>totalDonations : 0d,
        "color": "#10b981"
    },
    {
        "name": "Supplies",
        "value": totalDonations > 0 ? (<decimal>stats.supply_donations * 100d) / <decimal>totalDonations : 0d, 
        "color": "#3b82f6"
    },
    {
        "name": "Organs",
        "value": totalDonations > 0 ? (<decimal>stats.organ_donations * 100d) / <decimal>totalDonations : 0d,
        "color": "#8b5cf6"
    },
    {
        "name": "Fundraiser",
        "value": totalDonations > 0 && stats.total_fundraiser_amount > 0d ? 5d : 0d,
        "color": "#f59e0b"
    }
];
    
    // Calculate impact metrics
    json[] impactMetrics = [
        {
            "metric": "Lives Potentially Saved",
            "value": stats.blood_donations * 3, // Rough estimate
            "icon": "FaHeart",
            "color": "text-red-600", 
            "bg": "bg-red-50",
            "trend": 12.5
        },
        {
            "metric": "People Helped",
            "value": stats.total_donations,
            "icon": "FaUsers",
            "color": "text-blue-600",
            "bg": "bg-blue-50", 
            "trend": 8.2
        },
        {
            "metric": "Donations Made",
            "value": stats.total_donations,
            "icon": "FaGift",
            "color": "text-green-600",
            "bg": "bg-green-50",
            "trend": 15.3
        },
        {
            "metric": "Total Value",
            "value": "$" + stats.total_fundraiser_amount.toString(),
            "icon": "FaDollarSign", 
            "color": "text-yellow-600",
            "bg": "bg-yellow-50",
            "trend": -2.1
        }
    ];
    
    json analyticsData = {
        "overview": {
            "totalDonations": stats.total_donations,
            "totalImpact": stats.blood_donations * 3,
            "monthlyGrowth": 12.5,
            "currentStreak": 3,
            "totalValue": stats.total_fundraiser_amount
        },
        "donationTrends": monthlyTrends,
        "categoryDistribution": categoryDistribution,
        "impactMetrics": impactMetrics,
        "bloodDonationStats": {
            "totalDonations": stats.blood_donations,
            "totalVolume": stats.blood_donations * 500,
            "lastDonation": stats.last_donation_date ?: "",
            "nextEligible": calculateNextEligibleDate(stats.last_donation_date),
            "bloodType": "Unknown", // You'd get this from user profile
            "avgHemoglobin": 14.2,
            "monthlyTrend": calculateBloodTrendData(donations)
        },
        "weeklyActivity": generateWeeklyActivity(),
        "monthlyComparison": calculateMonthlyComparison(donations)
    };
    
    return analyticsData;
}

# Get donor trend data
# + donorId - ID of the donor
# + return - Array of trend data points or error  
public isolated function getDonorTrends(int donorId) returns json[]|error {
    types:DonationResponse[] donations = check database:getDonationsByDonor(donorId);
    
    json[] trends = [];
    string[] months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    
    foreach string month in months {
        json trendData = {
            "month": month,
            "donations": calculateDonationsForMonth(donations, month),
            "amount": calculateAmountForMonth(donations, month),
            "blood": calculateBloodDonationsForMonth(donations, month),
            "medicines": calculateMedicineDonationsForMonth(donations, month),
            "supplies": calculateSupplyDonationsForMonth(donations, month),
            "organs": calculateOrganDonationsForMonth(donations, month),
            "fundraiser": calculateFundraiserAmountForMonth(donations, month)
        };
        trends.push(trendData);
    }
    
    return trends;
}

# Get the number of months for a given time range
# + range - Time range string (e.g., "1month", "3months", "6months", "1year")
# + return - Number of months corresponding to the given range. Defaults to 6 if not matched.
isolated function getMonthsFromRange(string range) returns int {
    match range {
        "1month" => { return 1; }
        "3months" => { return 3; }
        "6months" => { return 6; }
        "1year" => { return 12; }
        _ => { return 6; } // default
    }
}


isolated function calculateDonationsForMonth(types:DonationResponse[] donations, string month) returns int {
    // Simple calculation - in a real implementation, you'd parse dates properly
    return donations.length() > 0 ? 2 : 0;
}

isolated function calculateAmountForMonth(types:DonationResponse[] donations, string month) returns decimal {
    decimal total = 0d;
    foreach var donation in donations {
        decimal? amount = donation.amount;
        if amount is decimal {
            total = total + amount;
        }
    }
    return donations.length() > 0 ? total / 6d : 0d;
}

isolated function calculateBloodDonationsForMonth(types:DonationResponse[] donations, string month) returns int {
    int count = 0;
    foreach var donation in donations {
        if donation.donation_type == "blood" {
            count = count + 1;
        }
    }
    return donations.length() > 0 ? count / 6 : 0; // Distribute across 6 months for demo
}

isolated function calculateMedicineDonationsForMonth(types:DonationResponse[] donations, string month) returns int {
    int count = 0;
    foreach var donation in donations {
        if donation.donation_type == "medicines" {
            count = count + 1;
        }
    }
    return donations.length() > 0 ? count / 6 : 0; // Distribute across 6 months for demo
}

isolated function calculateSupplyDonationsForMonth(types:DonationResponse[] donations, string month) returns int {
    int count = 0;
    foreach var donation in donations {
        if donation.donation_type == "supplies" {
            count = count + 1;
        }
    }
    return donations.length() > 0 ? count / 6 : 0; // Distribute across 6 months for demo
}

isolated function calculateOrganDonationsForMonth(types:DonationResponse[] donations, string month) returns int {
    int count = 0;
    foreach var donation in donations {
        if donation.donation_type == "organs" {
            count = count + 1;
        }
    }
    return donations.length() > 0 ? count / 6 : 0; // Distribute across 6 months for demo
}

isolated function calculateFundraiserAmountForMonth(types:DonationResponse[] donations, string month) returns decimal {
    decimal total = 0d;
    foreach var donation in donations {
        if donation.donation_type == "fundraiser" {
            decimal? amount = donation.amount;
            if amount is decimal {
                total = total + amount;
            }
        }
    }
    return donations.length() > 0 ? total / 6d : 0d;
}

isolated function calculateNextEligibleDate(string? lastDonationDate) returns string {
    if lastDonationDate is () {
        return "";
    }
    // In a real implementation, you'd add 56 days to the last donation date
    return "2025-03-15";
}

isolated function calculateBloodTrendData(types:DonationResponse[] donations) returns int[] {
    int[] trends = [0, 0, 0, 0, 0, 0];
    int bloodCount = 0;
    
    foreach var donation in donations {
        if donation.donation_type == "blood" {
            bloodCount = bloodCount + 1;
        }
    }
    
    // Distribute blood donations across 6 months for demo
    if bloodCount > 0 {
        trends = [2, 3, 2, 4, 3, 1];
    }
    
    return trends;
}

isolated function generateWeeklyActivity() returns json[] {
    return [
        {"day": "M", "donations": 2, "height": 40},
        {"day": "T", "donations": 1, "height": 20}, 
        {"day": "W", "donations": 3, "height": 60},
        {"day": "T", "donations": 0, "height": 0},
        {"day": "F", "donations": 2, "height": 40},
        {"day": "S", "donations": 1, "height": 20},
        {"day": "S", "donations": 1, "height": 20}
    ];
}

isolated function calculateMonthlyComparison(types:DonationResponse[] donations) returns json {
    // Simple mock data - in real implementation, you'd calculate actual monthly comparisons
    return {
        "thisMonth": {"donations": 4, "value": 320},
        "lastMonth": {"donations": 3, "value": 280},
        "change": {"donations": 33.3, "value": 14.3}
    };
}