import { Category, UserType } from "@/components/types";

export const recipientUser = {
    id: 1,
    email: "sarah@mail.com",
    name: "Sarah Chen",
    avatar: "SC",
    verified: true,
    joinedDate: "March 2024",
    type: UserType.RECIPIENT,
    location: "Colombo",
  };

  // Mock donor user
export const donorUser = {
    id: 2,
    email: "john.smith@mail.com", 
    name: "John Smith",
    avatar: "JS",
    verified: true,
    joinedDate: "February 2024",
    type: UserType.DONOR,
    location: "Colombo",
    referrals: [3, 4] 
};

export const Users = [
  {
    donorUser
  },
  {
    recipientUser
  }
]

  // Mock recipient posts
export const myRecipientPosts = [
    {
      id: 101,
      user: recipientUser,
      title: "Urgent: Need 1,000,000 LKR for Emergency Surgery",
      status: "open",
      category: Category.FUNDRAISER,
      content: "Hello everyone, I'm scheduled for an emergency surgery tomorrow and need Type O- blood donors. The surgery is at City General Hospital. Please reach out if you can help or know someone who can.",
      location: "Colombo",
      createdAt: "2024-01-15T10:30:00Z",
      urgency: "high",
      engagement: { likes: 23, comments: 8, shares: 12, views: 150 },
      contact: "phone: +94771234567, email: sarah.chen@email.com",
      fundraiserDetails: {
      goal: 1000000,
      received: 250000 // Starts at 0 when created
    }
    },
    {
      id: 102,
      user: recipientUser,
      title: "Looking for Kidney Donor - Living Donor Needed",
      status: "open",
      category: Category.ORGANS,
      content: "Hi, I'm a 34-year-old teacher with end-stage kidney disease. I'm looking for a living kidney donor. I have a great support system and am committed to following all medical protocols.",
      location: "Kandy",
      createdAt: "2024-01-10T14:20:00Z",
      urgency: "high",
      engagement: { likes: 67, comments: 34, shares: 28, views: 150 },
      contact: "phone: +94773456789, email: r.perera@email.com"
    },
    {
      id: 103,
      user: recipientUser,
      title: "Seeking Insulin Donations - Type 1 Diabetic",
      status: "open",
      category: Category.MEDICINES,
      content: "I'm a college student with Type 1 diabetes struggling to afford insulin. If anyone has extra supplies or knows of assistance programs, I would be incredibly grateful.",
      location: "Galle",
      createdAt: "2024-01-08T09:15:00Z",
      urgency: "medium",
      engagement: { likes: 89, comments: 23, shares: 15, views: 150 },
      contact: "phone: +94775678901, email: amara.f@email.com"
    },
    {
      id: 104,
      user: recipientUser,
      title: "Rare Medicine Needed for Skin Disease",
      status: "open",
      category: Category.MEDICINES,
      content: "My daughter has a rare blood type AB- and needs regular transfusions due to her condition. We're always looking for donors who can help.",
      location: "Negombo",
      createdAt: "2024-01-05T16:45:00Z",
      urgency: "medium",
      engagement: { likes: 45, comments: 19, shares: 22, views: 150 },
      contact: "phone: +94777890123, email: n.jayasinghe@email.com"
    }
  ];

export const fundraiserDetails = {
  id: 1,
  goal: 1000000,
  received: 250000
}

// Mock posts data
export const recipientPosts = [
    {
      id: 501,
      title: "Urgent: Need LKR 1,000,000 for Emergency Surgery",
      category: Category.FUNDRAISER,
      content: "Hello everyone, I'm scheduled for an emergency surgery and need LKR 1,000,000. The surgery is at City General Hospital. Please reach out if you can help or know someone who can.",
      createdAt: "2024-01-15T10:30:00Z",
      status: "active",
      engagement: {
        views: 247,
        likes: 23,
        comments: 8,
        shares: 12
      },
      urgency: "high",
      user: recipientUser,
      contact: "phone: +94777890123, email: n.jayasinghe@email.com",
      fundraiserDetails: fundraiserDetails
    },
    {
      id: 502,
      title: "Looking for Kidney Donor - Living Donor Needed",
      category: Category.ORGANS,
      content: "Hi, I'm a 34-year-old teacher with end-stage kidney disease. I'm looking for a living kidney donor. I have a great support system and am committed to following all medical protocols. Please message me if you'd like to learn more about the process.",
      createdAt: "2024-01-10T14:20:00Z",
      status: "active",
      engagement: {
        views: 892,
        likes: 67,
        comments: 34,
        shares: 28
      },
      urgency: "high",
      user: recipientUser,
      contact: "phone: +94777890123, email: n.jayasinghe@email.com"
    },
    {
      id: 503,
      title: "Seeking Insulin Donations - Type 1 Diabetic",
      category: Category.MEDICINES,
      content: "I'm a college student with Type 1 diabetes struggling to afford insulin. If anyone has extra supplies or knows of assistance programs, I would be incredibly grateful for any help.",
      createdAt: "2024-01-08T09:15:00Z",
      status: "fulfilled",
      engagement: {
        views: 456,
        likes: 89,
        comments: 23,
        shares: 15
      },
      urgency: "medium",
      user: recipientUser,
      contact: "phone: +94777890123, email: n.jayasinghe@email.com"
    },
    {
      id: 504,
      title: "Looking for Kidney Donor - Living Donor Needed",
      category: Category.ORGANS,
      content: "My daughter has a rare blood type AB- and needs regular transfusions due to her condition. We're always looking for donors who can help. Located in downtown area.",
      createdAt: "2024-01-05T16:45:00Z",
      status: "active",
      engagement: {
        views: 623,
        likes: 45,
        comments: 19,
        shares: 22
      },
      urgency: "medium",
      user: recipientUser,
      contact: "phone: +94777890123, email: n.jayasinghe@email.com"
    }
  ];

// Mock blood donation camps data with Sri Lankan locations
export const bloodCamps = [
  {
    id: 1,
    name: "Red Cross Blood Drive",
    location: "Colombo General Hospital",
    coordinates: [5.9320, 80.5911],
    date: "2024-01-20",
    time: "9:00 AM - 5:00 PM",
    status: "upcoming",
    organizer: "Sri Lanka Red Cross",
    contact: "+94112691095",
    capacity: 200,
    bloodTypes: ["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"]
  },
  {
    id: 2,
    name: "University Blood Camp",
    location: "University of Peradeniya",
    coordinates: [9.7938, 80.2210],
    date: "2024-01-18",
    time: "10:00 AM - 4:00 PM",
    status: "active",
    organizer: "Medical Faculty",
    contact: "+94812388631",
    capacity: 150,
    bloodTypes: ["O+", "A+", "B+"]
  },
  {
    id: 3,
    name: "Community Health Drive",
    location: "Galle District Hospital",
    coordinates: [6.9271, 79.8612],
    date: "2024-01-25",
    time: "8:00 AM - 6:00 PM",
    status: "upcoming",
    organizer: "Ministry of Health",
    contact: "+94912234567",
    capacity: 300,
    bloodTypes: ["All Types"]
  },
  {
    id: 4,
    name: "Mobile Blood Unit",
    location: "Kandy City Center",
    coordinates: [8.5874, 81.2152],
    date: "2024-01-22",
    time: "11:00 AM - 3:00 PM",
    status: "upcoming",
    organizer: "National Blood Bank",
    contact: "+94812345678",
    capacity: 100,
    bloodTypes: ["O-", "A-", "AB-"]
  },
  {
    id: 5,
    name: "Corporate Blood Drive",
    location: "World Trade Center, Colombo",
    coordinates: [7.2906, 80.6337],
    date: "2024-01-19",
    time: "9:00 AM - 5:00 PM",
    status: "active",
    organizer: "Corporate Social Responsibility",
    contact: "+94115320000",
    capacity: 250,
    bloodTypes: ["All Types"]
  }
];

export const myDonorPosts = [
  {
    id: 5,
    user: donorUser,
    title: "Offering Blood Donation - Type O+ Available",
    status: "available", // available, committed, completed
    category: Category.ORGANS,
    content: "I'm a healthy 28-year-old male with Type O+ blood. I donate regularly and am available for emergency donations. Located in Colombo and can travel to nearby hospitals. Available most weekends and evenings.",
    location: "Colombo",
    createdAt: "2024-01-16T08:30:00Z",
    urgency: "medium", // How quickly they can help
    engagement: { likes: 15, comments: 4, shares: 8, views: 89 },
    contact: "phone: +94771122334, email: john.smith@email.com",
    offeringDetails: {
      bloodType: "O+",
      availability: "Weekends & Evenings",
      lastDonation: "2023-12-15"
    }
  },
  {
    id: 6,
    user: donorUser,
    title: "Can Contribute LKR 500,000 for Medical Emergencies",
    status: "available",
    category: Category.FUNDRAISER,
    content: "I have LKR 500,000 available to help with genuine medical emergencies in the Colombo area. Prefer to help with surgeries or critical treatments. Will require medical documentation and direct hospital payments.",
    location: "Colombo",
    createdAt: "2024-01-14T16:45:00Z",
    urgency: "low", // Not urgent from donor's side
    engagement: { likes: 42, comments: 12, shares: 18, views: 203 },
    contact: "phone: +94772233445, email: john.donations@email.com",
    offeringDetails: {
      maxAmount: 500000,
      preferredUse: "Emergency surgeries",
      requirements: "Medical documentation required"
    }
  },
  {
    id: 7,
    user: donorUser,
    title: "Extra Diabetes Supplies Available for Donation",
    status: "available",
    category: Category.MEDICINES,
    content: "I have unopened insulin supplies (Lantus & Humalog) and glucose test strips that I can donate. All are within expiry dates. Perfect for someone struggling with diabetes costs. Can meet in Colombo area.",
    location: "Colombo",
    createdAt: "2024-01-12T11:20:00Z",
    urgency: "low",
    engagement: { likes: 28, comments: 7, shares: 11, views: 134 },
    contact: "phone: +94773344556, email: john.meds@email.com",
    offeringDetails: {
      medicineTypes: ["Lantus Insulin", "Humalog", "Test Strips"],
      quantity: "3 months supply",
      expiry: "Valid until 2025"
    }
  },
  {
    id: 8,
    user: donorUser,
    title: "Willing to Be Living Kidney Donor - Healthy & Compatible",
    status: "available",
    category: Category.ORGANS,
    content: "I'm a 32-year-old healthy individual willing to be a living kidney donor. I've completed initial health screenings and am ready for compatibility testing. Looking to help someone who genuinely needs a transplant.",
    location: "Kandy",
    createdAt: "2024-01-10T09:30:00Z",
    urgency: "medium",
    engagement: { likes: 67, comments: 23, shares: 31, views: 287 },
    contact: "phone: +94774455667, email: kidney.donor.john@email.com",
    offeringDetails: {
      organType: "Kidney",
      healthStatus: "Excellent - All tests passed",
      availability: "Ready for compatibility testing"
    }
  }
];

export const donorPosts = [
  {
    id: 201,
    user: donorUser,
    title: "Medical Professional - Offering Free Health Consultations",
    status: "available",
    category: Category.MEDICINES,
    content: "I'm a qualified physician offering free health consultations for those who cannot afford medical care. Available for telemedicine consultations on weekends. Specialized in general medicine and diabetes care.",
    location: "Kandy",
    createdAt: "2024-01-14T10:30:00Z",
    urgency: "medium",
    engagement: { likes: 89, comments: 23, shares: 45, views: 456 },
    contact: "phone: +94771234567, email: dr.priya@email.com",
    offeringDetails: {
      serviceType: "Medical Consultation",
      specialization: "General Medicine, Diabetes",
      availability: "Weekends 9AM-5PM"
    }
  },
  {
    id: 202,
    user: donorUser,
    title: "Offering LKR 1,000,000 for Education Support",
    status: "available",
    category: Category.FUNDRAISER,
    content: "I want to help underprivileged students with their education expenses. Can contribute up to 1 million LKR for school fees, books, and uniforms. Priority given to students in rural areas.",
    location: "Colombo",
    createdAt: "2024-01-12T15:20:00Z",
    urgency: "low",
    engagement: { likes: 156, comments: 34, shares: 67, views: 789 },
    contact: "phone: +94772345678, email: kasun.education@email.com",
    offeringDetails: {
      maxAmount: 1000000,
      preferredUse: "Education expenses",
      requirements: "Rural area students preferred"
    }
  },
  {
    id: 203,
    user: donorUser,
    title: "Regular Blood Donor - Type A+ Available",
    status: "available",
    category: Category.ORGANS,
    content: "I'm a regular blood donor with Type A+ blood. Available for emergency donations and scheduled donations. Healthy lifestyle, no medications. Can donate every 3 months as per medical guidelines.",
    location: "Galle",
    createdAt: "2024-01-10T08:45:00Z",
    urgency: "medium",
    engagement: { likes: 67, comments: 12, shares: 23, views: 234 },
    contact: "phone: +94773456789, email: sangeetha.blood@email.com",
    offeringDetails: {
      bloodType: "A+",
      availability: "Every 3 months",
      lastDonation: "2023-11-15"
    }
  },
  {
    id: 204,
    user: donorUser,
    title: "Pharmaceutical Supplies - Cancer Medications Available",
    status: "available",
    category: Category.MEDICINES,
    content: "I have access to cancer medications at wholesale prices and can help patients get them at cost price. Working with registered pharmacies to ensure authenticity. Specialized in chemotherapy drugs.",
    location: "Negombo",
    createdAt: "2024-01-08T16:30:00Z",
    urgency: "high",
    engagement: { likes: 203, comments: 45, shares: 89, views: 567 },
    contact: "phone: +94774567890, email: ravi.pharma@email.com",
    offeringDetails: {
      medicineTypes: ["Chemotherapy drugs", "Cancer supportive care"],
      availability: "Wholesale pricing",
      requirements: "Valid prescription required"
    }
  },
  {
    id: 205,
    user: donorUser,
    title: "Transportation Support for Medical Appointments",
    status: "available",
    category: Category.FUNDRAISER,
    content: "Offering free transportation for patients who need to travel for medical appointments. Have a vehicle and can help with hospital visits, especially for elderly patients or those with mobility issues.",
    location: "Colombo",
    createdAt: "2024-01-06T11:15:00Z",
    urgency: "medium",
    engagement: { likes: 112, comments: 28, shares: 34, views: 345 },
    contact: "phone: +94775678901, email: ayesha.transport@email.com",
    offeringDetails: {
      serviceType: "Transportation",
      availability: "Weekdays 8AM-6PM",
      coverage: "Colombo and surrounding areas"
    }
  },
  {
    id: 206,
    user: donorUser,
    title: "Living Kidney Donor - Ready for Compatibility Testing",
    status: "committed", // This donor is already committed to someone
    category: Category.ORGANS,
    content: "I've decided to be a living kidney donor and have completed all preliminary health tests. Currently in compatibility testing process with a recipient. Sharing my journey to encourage others.",
    location: "Kandy",
    createdAt: "2024-01-04T09:20:00Z",
    urgency: "high",
    engagement: { likes: 234, comments: 67, shares: 123, views: 890 },
    contact: "phone: +94776789012, email: nuwan.kidney@email.com",
    offeringDetails: {
      organType: "Kidney",
      healthStatus: "All tests passed",
      availability: "Currently in process"
    }
  }
];

export const donations = [
  {
    id: 1,
    donor: donorUser,
    category: Category.FUNDRAISER,
    benificiary: recipientUser,
    amount: 500000,
    date: "2024-01-15T10:30:00Z",
    status: "completed",
    postId: 501,
  },
  {
    id: 2,
    donor: donorUser,
    category: Category.ORGANS,
    benificiary: recipientUser,
    amount: 1000000,
    type: "kidney",
    date: "2024-01-15T10:30:00Z",
    status: "completed",
    postId: 501,
  },
  {
    id: 3,
    donor: donorUser,
    category: Category.MEDICINES,
    benificiary: recipientUser,
    date: "2024-01-15T10:30:00Z",
    status: "completed",
    postId: 501,
    amount: 20000,
  },
  {
    id: 4,
    donor: donorUser,
    category: Category.BLOOD,
    benificiary: recipientUser,
    date: "2024-01-15T10:30:00Z",
    status: "completed",
    postId: 501,
  }
]

export const leaderboardDetails = [
        { rank: 1, name: 'Dr. Priya Silva', avatar: 'PS', points: 4250, badges: 15, donations: 42 },
        { rank: 2, name: 'Kasun Fernando', avatar: 'KF', points: 3890, badges: 13, donations: 38 },
        { rank: 3, name: 'Sarah Chen', avatar: 'SC', points: 3456, badges: 12, donations: 35 },
        { rank: 4, name: 'Ravi Mendis', avatar: 'RM', points: 3102, badges: 11, donations: 31 },
        { rank: 5, name: 'You', avatar: 'JS', points: 2847, badges: 12, donations: 23, isUser: true }
    ];