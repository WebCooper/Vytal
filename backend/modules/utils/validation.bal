import ballerina/regex;
import backend.types;

public isolated function isValidEmail(string email) returns boolean {
    string emailPattern = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
    return regex:matches(email, emailPattern);
}

public isolated function validateRegistrationInput(types:RegisterRequest request) returns error? {
    if request.name.trim() == "" {
        return error("Name is required");
    }
    if request.phone_number.trim() == "" {
        return error("Phone number is required");
    }
    if !isValidEmail(request.email) {
        return error("Invalid email format");
    }
    if request.password.length() < 6 {
        return error("Password must be at least 6 characters long");
    }
    if request.categories.length() == 0 {
        return error("At least one category must be selected");
    }
}

public isolated function validateLoginInput(types:LoginRequest request) returns error? {
    if !isValidEmail(request.email) {
        return error("Invalid email format");
    }
    if request.password.trim() == "" {
        return error("Password is required");
    }
}

public isolated function validateDonorPostCreate(types:DonorPostCreate request) returns error? {
    // Validate title
    if request.title.trim() == "" {
        return error("Title is required");
    }
    
    // Validate content
    if request.content.trim() == "" {
        return error("Content is required");
    }
    
    // Validate location
    if request.location.trim() == "" {
        return error("Location is required");
    }
    
    // Validate contact
    if request.contact.trim() == "" {
        return error("Contact information is required");
    }
    
    // Validate donor_id
    if request.donor_id <= 0 {
        return error("Valid donor ID is required");
    }
    
    // Validate offering details based on category
    match request.category {
        "blood" => {
            // Check if blood offering details are provided
            if request.bloodOffering is () {
                return error("Blood category requires blood offering details");
            }
            
            types:BloodOffering bloodOffering = <types:BloodOffering>request.bloodOffering;
            if bloodOffering.bloodType.trim() == "" {
                return error("Blood type is required for blood category");
            }
            if bloodOffering.availability.trim() == "" {
                return error("Availability is required for blood category");
            }
            if bloodOffering.lastDonation.trim() == "" {
                return error("Last donation date is required for blood category");
            }
        }
        "organs" => {
            // Check if organ offering details are provided
            if request.organOffering is () {
                return error("Organ category requires organ offering details");
            }
            
            types:OrganOffering organOffering = <types:OrganOffering>request.organOffering;
            if organOffering.organType.trim() == "" {
                return error("Organ type is required for organ category");
            }
            if organOffering.healthStatus.trim() == "" {
                return error("Health status is required for organ category");
            }
            if organOffering.availability.trim() == "" {
                return error("Availability is required for organ category");
            }
        }
        "medicines" => {
            // Check if medicine offering details are provided
            if request.medicineOffering is () {
                return error("Medicine category requires medicine offering details");
            }
            
            types:MedicineOffering medicineOffering = <types:MedicineOffering>request.medicineOffering;
            if medicineOffering.medicineTypes.length() == 0 {
                return error("Medicine types are required for medicine category");
            }
            if medicineOffering.quantity.trim() == "" {
                return error("Quantity is required for medicine category");
            }
            if medicineOffering.expiry.trim() == "" {
                return error("Expiry date is required for medicine category");
            }
        }
        "fundraiser" => {
            // Check if fundraiser offering details are provided
            if request.fundraiserOffering is () {
                return error("Fundraiser category requires fundraiser offering details");
            }
            
            types:FundraiserOffering fundraiserOffering = <types:FundraiserOffering>request.fundraiserOffering;
            if fundraiserOffering.maxAmount <= 0 {
                return error("Maximum amount must be greater than zero for fundraiser category");
            }
            if fundraiserOffering.preferredUse.trim() == "" {
                return error("Preferred use is required for fundraiser category");
            }
            if fundraiserOffering.requirements.trim() == "" {
                return error("Requirements are required for fundraiser category");
            }
        }
        "supplies" => {
            // For supplies, we could reuse one of the existing types or create a new one
            // For now, let's validate it minimally
            // If a specific type is needed, you would add it to types.bal first
        }
        _ => {
            return error("Invalid category: " + request.category.toString());
        }
    }
}