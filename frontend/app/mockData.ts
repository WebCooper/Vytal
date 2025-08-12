import { PostCategory, UserType } from "@/components/types";

  // Mock user data (donor)
export const user = {
    id: "1",
    email: "sarah@mail.com",
    name: "Sarah Chen",
    avatar: "SC",
    verified: true,
    joinedDate: "March 2024",
    type: UserType.RECIPIENT,
    location: "Colombo",
  };

  // Mock recipient posts
export const myPosts = [
    {
      id: 1,
      user: user,
      title: "Urgent: Need 1,000,000 LKR for Emergency Surgery",
      status: "open",
      category: PostCategory.FUNDRAISER,
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
      id: 2,
      user: user,
      title: "Looking for Kidney Donor - Living Donor Needed",
      status: "open",
      category: PostCategory.ORGANS,
      content: "Hi, I'm a 34-year-old teacher with end-stage kidney disease. I'm looking for a living kidney donor. I have a great support system and am committed to following all medical protocols.",
      location: "Kandy",
      createdAt: "2024-01-10T14:20:00Z",
      urgency: "high",
      engagement: { likes: 67, comments: 34, shares: 28, views: 150 },
      contact: "phone: +94773456789, email: r.perera@email.com"
    },
    {
      id: 3,
      user: user,
      title: "Seeking Insulin Donations - Type 1 Diabetic",
      status: "open",
      category: PostCategory.MEDICINES,
      content: "I'm a college student with Type 1 diabetes struggling to afford insulin. If anyone has extra supplies or knows of assistance programs, I would be incredibly grateful.",
      location: "Galle",
      createdAt: "2024-01-08T09:15:00Z",
      urgency: "medium",
      engagement: { likes: 89, comments: 23, shares: 15, views: 150 },
      contact: "phone: +94775678901, email: amara.f@email.com"
    },
    {
      id: 4,
      user: user,
      title: "Rare Medicine Needed for Skin Disease",
      status: "open",
      category: PostCategory.MEDICINES,
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
      id: 1,
      title: "Urgent: Need LKR 1,000,000 for Emergency Surgery",
      category: PostCategory.FUNDRAISER,
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
      user: user,
      contact: "phone: +94777890123, email: n.jayasinghe@email.com",
      fundraiserDetails: fundraiserDetails
    },
    {
      id: 2,
      title: "Looking for Kidney Donor - Living Donor Needed",
      category: PostCategory.ORGANS,
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
      user: user,
      contact: "phone: +94777890123, email: n.jayasinghe@email.com"
    },
    {
      id: 3,
      title: "Seeking Insulin Donations - Type 1 Diabetic",
      category: PostCategory.MEDICINES,
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
      user: user,
      contact: "phone: +94777890123, email: n.jayasinghe@email.com"
    },
    {
      id: 4,
      title: "Looking for Kidney Donor - Living Donor Needed",
      category: PostCategory.ORGANS,
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
      user: user,
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
export const donationOpportunities = [
  {
    id: 1,
    user: user,
    title: "Kidney Transplant Required Urgently",
    status: "open",
    category: PostCategory.ORGANS,
    content: "Patient requires a kidney transplant. Blood group O+. All medical reports available on request.",
    location: "City Hospital, 3km away",
    createdAt: "2024-02-05T09:00:00Z",
    urgency: "high",
    engagement: { likes: 12, comments: 3, shares: 5, views: 0 },
    contact: "phone: +94770000001, email: organrequests@cityhospital.org"
  },
  {
    id: 2,
    user: user,
    title: "Fundraiser for Cancer Treatment",
    status: "open",
    category: PostCategory.FUNDRAISER,
    content: "We are raising funds for a 12-year-old undergoing chemotherapy. All contributions will directly help cover medical expenses.",
    location: "Northside Community Center, 5km away",
    createdAt: "2024-02-04T15:30:00Z",
    urgency: "medium",
    engagement: { likes: 5, comments: 1, shares: 2, views: 2 },
    contact: "phone: +94770000002, email: fundraiser@northside.org"
  }
];

export const myDonations = [
  {
    id: 1,
    user: user,
    title: "Medicine Donation for Rural Clinic",
    status: "completed",
    category: PostCategory.MEDICINES,
    content: "Donated essential antibiotics and pain relief medication to the rural clinic serving over 500 families.",
    location: "Rural Health Clinic",
    createdAt: "2023-08-10T10:00:00Z",
    urgency: "low",
    engagement: { likes: 8, comments: 0, shares: 1, views: 20 },
    contact: "phone: +94770000003, email: ruralclinic@health.org"
  }
];


