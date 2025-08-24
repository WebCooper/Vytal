// utils/shareUtils.ts
import { DonorCardData, ShareContent, DonorCardCategory } from '../types/donorCard';
import { CATEGORY_CONFIG } from './constants';

export class ShareUtils {
  static generateShareContent(cardData: DonorCardData): ShareContent {
    const categoryConfig = CATEGORY_CONFIG[cardData.category];
    const categoryInfo = this.getCategorySpecificInfo(cardData);
    
    const text = `*${categoryConfig.label.toUpperCase()} AVAILABLE*

*Donor:* ${cardData.donorName}
${categoryInfo.details}
*Location:* ${cardData.location}
*Availability:* ${cardData.availability}
${categoryInfo.additionalInfo}

*Contact Information:*
${cardData.contactPerson} (${cardData.relationship})
Primary: ${cardData.primaryPhone}
${cardData.secondaryPhone ? `Secondary: ${cardData.secondaryPhone}` : ''}

*Message:* ${cardData.message}

${categoryInfo.callToAction}

${categoryInfo.hashtags}

Generated via Vytal - Community Donation Platform`;

    return {
      title: `${categoryInfo.title} - ${cardData.donorName}`,
      text
    };
  }

  private static getCategorySpecificInfo(cardData: DonorCardData) {
    switch (cardData.category) {
      case DonorCardCategory.BLOOD:
        return {
          title: `${cardData.bloodOffering?.bloodType || 'Blood'} Blood Donor Available`,
          details: `*Blood Type:* ${cardData.bloodOffering?.bloodType || 'Not specified'}`,
          additionalInfo: `*Previous Donations:* ${cardData.bloodOffering?.donationCount || '0'} times
*Last Donation:* ${cardData.bloodOffering?.lastDonation || 'Not specified'}`,
          callToAction: 'Ready to help save lives! Contact me if you need blood donation.',
          hashtags: `#BloodDonor #SaveALife #${cardData.bloodOffering?.bloodType || ''}Blood #Vytal #LifeSaver`
        };

      case DonorCardCategory.ORGANS:
        return {
          title: `${cardData.organOffering?.organType || 'Organ'} Donor Available`,
          details: `*Organ Type:* ${cardData.organOffering?.organType || 'Not specified'}`,
          additionalInfo: `*Health Status:* ${cardData.organOffering?.healthStatus || 'Not specified'}`,
          callToAction: 'Registered organ donor willing to help save lives through organ donation.',
          hashtags: `#OrganDonor #SaveALife #${cardData.organOffering?.organType?.replace(/\s+/g, '') || 'Organ'}Donation #Vytal #LifeSaver`
        };

      case DonorCardCategory.FUNDRAISER:
        const maxAmount = cardData.fundraiserOffering?.maxAmount;
        return {
          title: `Financial Support Available - Up to LKR ${maxAmount ? Number(maxAmount).toLocaleString() : '0'}`,
          details: `*Maximum Amount:* LKR ${maxAmount ? Number(maxAmount).toLocaleString() : 'Not specified'}`,
          additionalInfo: `*Preferred Use:* ${cardData.fundraiserOffering?.preferredUse || 'Medical treatments'}
*Requirements:* ${cardData.fundraiserOffering?.requirements || 'None specified'}`,
          callToAction: 'Ready to provide financial support for medical emergencies and treatments.',
          hashtags: `#FinancialSupport #MedicalAid #Fundraiser #Vytal #HelpingHands`
        };

      case DonorCardCategory.MEDICINES:
        const medicines = cardData.medicineOffering?.medicineTypes?.filter(med => med.trim()) || [];
        return {
          title: `Medicine Donation Available - ${medicines.length} Types`,
          details: `*Available Medicines:* ${medicines.length > 0 ? medicines.join(', ') : 'Not specified'}`,
          additionalInfo: `*Quantity:* ${cardData.medicineOffering?.quantity || 'Not specified'}
*Expiry Date:* ${cardData.medicineOffering?.expiry ? new Date(cardData.medicineOffering.expiry).toLocaleDateString() : 'Not specified'}`,
          callToAction: 'Available medicines for those in need. All medications are properly stored and within expiry.',
          hashtags: `#MedicineDonation #Healthcare #${medicines[0]?.replace(/\s+/g, '') || 'Medicine'} #Vytal #HealthSupport`
        };

      case DonorCardCategory.SUPPLIES:
        return {
          title: `Medical Supplies Available - ${cardData.suppliesOffering?.suppliesType || 'Various'}`,
          details: `*Supply Type:* ${cardData.suppliesOffering?.suppliesType || 'Not specified'}`,
          additionalInfo: `*Quantity:* ${cardData.suppliesOffering?.quantity || 'Not specified'}`,
          callToAction: 'Medical supplies and equipment available for those who need them.',
          hashtags: `#MedicalSupplies #Healthcare #${cardData.suppliesOffering?.suppliesType?.replace(/\s+/g, '') || 'Supplies'} #Vytal #MedicalAid`
        };

      default:
        return {
          title: 'Donation Available',
          details: '*Type:* General donation',
          additionalInfo: '',
          callToAction: 'Ready to help those in need.',
          hashtags: '#Donation #Help #Vytal #Community'
        };
    }
  }

  static async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      throw new Error(`Failed to copy to clipboard: ${error}`);
    }
  }

  static shareToWhatsApp(message: string): void {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  }

  static downloadImage(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static showWhatsAppInstructions(): void {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
      background: rgba(0,0,0,0.8); display: flex; align-items: center; 
      justify-content: center; z-index: 10000; font-family: system-ui;
    `;
    
    modal.innerHTML = `
      <div style="background: white; padding: 30px; border-radius: 20px; max-width: 500px; text-align: center;">
        <h2 style="color: #059669; margin-bottom: 20px;">Ready to Share!</h2>
        <div style="background: #f0f9ff; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
          <p style="margin: 0; font-weight: bold; color: #0369a1;">Donor card image downloaded</p>
          <p style="margin: 5px 0 0 0; font-weight: bold; color: #0369a1;">Text copied to clipboard</p>
        </div>
        <div style="text-align: left; background: #f9fafb; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
          <p style="font-weight: bold; margin: 0 0 10px 0;">How to share on WhatsApp:</p>
          <p style="margin: 5px 0;">1. Open WhatsApp on your phone/computer</p>
          <p style="margin: 5px 0;">2. Select the contact or group</p>
          <p style="margin: 5px 0;">3. Paste the text (Ctrl+V or Cmd+V)</p>
          <p style="margin: 5px 0;">4. Click the attachment button</p>
          <p style="margin: 5px 0;">5. Choose "Photos & Media"</p>
          <p style="margin: 5px 0;">6. Select the downloaded donor card image</p>
          <p style="margin: 5px 0;">7. Send both message and image together!</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: #059669; color: white; padding: 12px 24px; border: none; border-radius: 10px; font-weight: bold; cursor: pointer;">
          Got it!
        </button>
      </div>
    `;
    
    document.body.appendChild(modal);
  }
}