import backend.types;
type BloodOffering record {|
    string bloodType;
    string availability;
    string lastDonation;
|};


type FundraiserOffering record {|
    int maxAmount;
    string preferredUse;
    string requirements;
|};


type MedicineOffering record {|
    string[] medicineTypes;
    string quantity;
    string expiry;
|};


type OrganOffering record {|
    string organType;
    string healthStatus;
    string availability;
|};


type OfferingDetails BloodOffering|FundraiserOffering|MedicineOffering|OrganOffering;


# Description.
#
# + id - field description  
# + donor_id - field description  
# + title - field description  
# + status - field description  
# + category - field description  
# + content - field description  
# + location - field description  
# + createdAt - field description  
# + urgency - field description  
# + engagement - field description  
# + contact - field description  
# + offeringDetails - field description
public type DonorPost record {|
    int id;
    int donor_id;
    string title;
    types:Status status; 
    types:Category category;
    string content;
    string location;
    string createdAt; 
    types:Urgency urgency; 
    types:Engagement engagement;
    string contact;
    OfferingDetails offeringDetails;
|};

# Create donor post (input)
#
# + donor_id - ID of the donor creating the post  
# + title - Title of the post  
# + category - Category of the offering  
# + content - Content/description of the post  
# + location - Location information  
# + urgency - Urgency level of the offering  
# + contact - Contact information  
# + offeringDetails - Details specific to the offering type
public type DonorPostCreate record {|
    int donor_id;
    string title;
    types:Category category;
    string content;
    string location;
    types:Status status = "pending";
    types:Urgency urgency;
    string contact;
    OfferingDetails offeringDetails;
|};

# Update donor post (partial update)
#
# + title - Title of the post  
# + category - Category of the offering  
# + content - Content/description of the post  
# + status - Status of the post  
# + location - Location information  
# + urgency - Urgency level of the offering  
# + contact - Contact information  
# + offeringDetails - Details specific to the offering type
public type DonorPostUpdate record {|
    string? title = ();
    types:Category? category = ();
    string? content = ();
    types:Status? status = ();
    string? location = ();
    types:Urgency? urgency = ();
    string? contact = ();
    OfferingDetails? offeringDetails = ();
|};
