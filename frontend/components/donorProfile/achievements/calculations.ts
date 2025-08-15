import { Achievement, Donation, LevelInfo } from "@/components/types";
import { achievements, badges, levelThresholds } from "@/components/utils";
// Add imports for mock data
import { donorUser, bloodCamps } from "@/app/mockData";

// calculate total number of donations of a user (simple aggregation)
export function calcTotalNumberOfDonations(donations: Array<Donation>, userId: number): number {
    return donations.filter(donation => donation.donor.id === userId).length;
    console.log(`Total donations for user ${userId}: ${donations.length}`);
};

export function calcTotalPoints(donations: Array<Donation>, userId: number): number {
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

export function calculateLevel(totalPoints: number): LevelInfo {
    let currentLevel = levelThresholds[0];
    let nextLevel = null;

    for (let i = 0; i < levelThresholds.length; i++) {
        if (totalPoints >= levelThresholds[i].points) {
        currentLevel = levelThresholds[i];
        nextLevel = levelThresholds[i + 1] || null;
        }
    }

    if (!nextLevel) {
        return {
        level: currentLevel.level,
        title: currentLevel.title,
        pointsForNextLevel: null,
        pointsToNextLevel: null,
        progressPercent: 100
        };
    }

    const progress =
        ((totalPoints - currentLevel.points) /
        (nextLevel.points - currentLevel.points)) *
        100;

    return {
        level: currentLevel.level,
        title: currentLevel.title,
        pointsForNextLevel: nextLevel.points,
        pointsToNextLevel: nextLevel.points - totalPoints,
        progressPercent: Math.min(progress, 100)
    };
}

export function getDonorAchievementsProgress(donations: Array<Donation>, donorId: number) {
  // Helper aggregations
  const donorDonations = donations.filter(d => d.donor.id === donorId);
  const totalDonations = donorDonations.length;
  const totalLivesSaved = donorDonations.filter(d => d.category === "organs" || d.category === "blood").length;
  const totalAmountDonated = donorDonations
    .filter(d => d.category === "fundraiser" && typeof d.amount === "number")
    .reduce((sum, d) => sum + (d.amount || 0), 0);
  const totalMedicineValue = donorDonations
    .filter(d => d.category === "medicines" && typeof d.amount === "number")
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  // Case 3: Referral Rookie - use donorUser.referrals length if available
  const donorReferrals = donorUser && donorUser.referrals ? donorUser.referrals.length : 0;

  // Case 5: Blood Camp Hero - count attended blood camps (mock: attended if donorId matches donorUser.id and camp status is 'active' or 'completed')
  // For mock, assume donor attended all 'active' or 'completed' camps
  const donorCampsAttended = bloodCamps.filter(
    camp => (camp.status === "active" || camp.status === "completed")
  ).length;

  // Case 6: Blood Donor Champion - count blood donations
  const bloodDonations = donorDonations.filter(d => d.category === "blood").length;

  // Organ pledge: check if donor has at least one organ donation with type 'kidney'
  const organPledged = donorDonations.some(d => d.category === "organs") ? 1 : 0;

  // City hero and other achievements not computable from current mock data
  const cityHero = 0;

  return achievements.map(a => {
    let progress = 0;
    switch (a.id) {
      case 1: // First Step
        progress = totalDonations > 0 ? 1 : 0;
        break;
      case 2: // Monthly Challenge
        progress = Math.min(totalDonations, a.target);
        break;
      case 3: // Referral Rookie
        progress = Math.min(donorReferrals, a.target);
        break;
      // case 4: // Event Helper
      //   progress = donorCampsAttended > 0 ? 1 : 0;
      //   break;
      case 5: // Blood Camp Hero
        progress = Math.min(donorCampsAttended, a.target);
        break;
      case 6: // Blood Donor Champion
        progress = bloodDonations;
        break;
      case 7: // Medicine Giver
        progress = Math.min(totalMedicineValue, a.target);
        break;
      case 8: // Referral Master
        progress = Math.min(donorReferrals, a.target);
        break;
      case 9: // Fundraiser Leader
        progress = Math.min(totalAmountDonated, a.target);
        break;
      case 10: // Life Saver
        progress = Math.min(totalLivesSaved, a.target);
        break;
      case 11: // Organ Donor Legend
        progress = organPledged;
        break;
      case 12: // City Hero
        progress = cityHero;
        break;
      case 13: // Lifetime Giver
        progress = Math.min(totalDonations, a.target);
        break;
      default:
        progress = 0;
    }
    return {
      ...a,
      progress,
      target: a.target,
    };
  });
}

// Map badge names to achievement titles for matching
const badgeAchievementMap: Record<string, string> = {
  'First Step': 'First Step',
  'Monthly Challenge': 'Monthly Challenge',
  'Blood Camp Hero': 'Blood Camp Hero',
  'Blood Champion': 'Blood Champion',
  'Fundraiser Leader': 'Fundraiser Leader',
  'Life Saver': 'Life Saver',
  'Community Hero': 'Community Hero',
  'Lifetime Giver': 'Lifetime Giver'
};

// Function to determine earned badges based on completed achievements
export function getEarnedBadges(userAchievements: Achievement[]) {
  return badges.map(badge => {
    const achievementTitle = badgeAchievementMap[badge.name];
    const earned = achievementTitle
      ? userAchievements.some(a => a.title === achievementTitle && a.completed)
      : false;
    return { ...badge, earned };
  });
}
