// utils/shareUtils.ts
import { DonorCardData, ShareContent } from '../types/donorCard';

export class ShareUtils {
  static generateShareContent(cardData: DonorCardData): ShareContent {
    const text = `*BLOOD DONOR AVAILABLE*

*Donor:* ${cardData.donorName}
*Blood Type:* ${cardData.bloodType}
*Location:* ${cardData.location}
*Offering:* ${cardData.donationType}
*Availability:* ${cardData.availability}
*Previous Donations:* ${cardData.donationCount} times
*Last Donation:* ${cardData.lastDonation}

*Contact Information:*
${cardData.contactPerson} (${cardData.relationship})
Primary: ${cardData.primaryPhone}
Secondary: ${cardData.secondaryPhone}

*Message:* ${cardData.message}

Ready to help save lives! Contact me if you need blood donation.

#BloodDonor #SaveALife #${cardData.bloodType}Blood #Vytal #LifeSaver

Generated via Vytal - Community Donation Platform`;

    return {
      title: `${cardData.bloodType} Blood Donor Available - ${cardData.donorName}`,
      text
    };
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
        <h2 style="color: #059669; margin-bottom: 20px;">🎉 Ready to Share!</h2>
        <div style="background: #f0f9ff; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
          <p style="margin: 0; font-weight: bold; color: #0369a1;">✅ Donor card image downloaded</p>
          <p style="margin: 5px 0 0 0; font-weight: bold; color: #0369a1;">✅ Text copied to clipboard</p>
        </div>
        <div style="text-align: left; background: #f9fafb; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
          <p style="font-weight: bold; margin: 0 0 10px 0;">📱 How to share on WhatsApp:</p>
          <p style="margin: 5px 0;">1. Open WhatsApp on your phone/computer</p>
          <p style="margin: 5px 0;">2. Select the contact or group</p>
          <p style="margin: 5px 0;">3. Paste the text (Ctrl+V or Cmd+V)</p>
          <p style="margin: 5px 0;">4. Click the attachment button (📎)</p>
          <p style="margin: 5px 0;">5. Choose "Photos & Media"</p>
          <p style="margin: 5px 0;">6. Select the downloaded donor card image</p>
          <p style="margin: 5px 0;">7. Send both message and image together!</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: #059669; color: white; padding: 12px 24px; border: none; border-radius: 10px; font-weight: bold; cursor: pointer;">
          Got it! 👍
        </button>
      </div>
    `;
    
    document.body.appendChild(modal);
  }
}