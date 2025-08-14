import { Donation } from "@/components/types";

// calculate total number of donations of a user (simple aggregation)
export const calcTotalNumberOfDonations = (donations: Array<Donation>, userId: number): number => {
    return donations.filter(donation => donation.donor.id === userId).length;
    console.log(`Total donations for user ${userId}: ${donations.length}`);
};

// Organ Donation (kidney, liver segment, etc.) 5000 pts
// Bone Marrow Donation 3500 pts
// Blood Donation 500 pts
// Supplies Donation 3 points per LKR 100
// Medicine Donation 2 points per LKR 100
// Fundraiser Monetary Donation 1 point per LKR 100
export const calcTotalPoints = (donations: Array<Donation>, userId: number): number => {
    return donations.reduce((total, donation) => {
        if (donation.donor.id === userId) {
            switch (donation.category) {
                case "organs":
                    return total + 5000;
                case "blood":
                    return total + 500;
                case "supplies":
                    return total + Math.floor((donation.amount ?? 0) / 100) * 3;
                case "medicines":
                    return total + Math.floor((donation.amount ?? 0) / 100) * 2;
                case "fundraiser":
                    return total + Math.floor((donation.amount ?? 0) / 100);
                default:
                    return total;
            }
        }
        return total;
    }, 0);
}