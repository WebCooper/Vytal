// utils/cardCanvas.ts
import { DonorCardData, DonorCardCategory } from '../types/donorCard';
import { CATEGORY_CONFIG } from './constants';

export class DonorCardCanvas {
  static async drawDonorCard(ctx: CanvasRenderingContext2D, cardData: DonorCardData): Promise<void> {
    const width = 400;
    const height = 500;
    
    // Main card background (white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Add subtle card shadow/border
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);
    
    // Draw sections
    this.drawHeader(ctx, width, cardData);
    this.drawBody(ctx, cardData);
    this.drawContactSection(ctx, cardData);
    this.drawFooter(ctx, width);
    this.drawWatermark(ctx, width, height);
  }

  private static drawHeader(ctx: CanvasRenderingContext2D, width: number, cardData: DonorCardData): void {
    const categoryConfig = CATEGORY_CONFIG[cardData.category];
    
    // Header section with category-specific gradient
    const headerGradient = ctx.createLinearGradient(0, 0, width, 80);
    headerGradient.addColorStop(0, categoryConfig.primaryColor);
    headerGradient.addColorStop(1, categoryConfig.primaryColor + 'dd');
    ctx.fillStyle = headerGradient;
    ctx.fillRect(0, 0, width, 80);
    
    // Header donor icon (white circle)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(35, 40, 18, 0, 2 * Math.PI);
    ctx.fill();
    
    // Donor icon (heart symbol)
    ctx.fillStyle = categoryConfig.primaryColor;
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('♥', 35, 47);
    
    // Gift icon (top right)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(365, 40, 15, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.fillText('🎁', 365, 46);
    
    // Header text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Donation Offer Available', 65, 35);
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.fillText('Ready to Help & Save Lives', 65, 52);
  }

  private static drawBody(ctx: CanvasRenderingContext2D, cardData: DonorCardData): void {
    const categoryConfig = CATEGORY_CONFIG[cardData.category];
    
    // Donor name (large, bold)
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(cardData.donorName, 25, 125);
    
    // Get category-specific badge info
    const badgeInfo = this.getCategoryBadgeInfo(cardData);
    
    // Category badge (circular, with category color)
    ctx.fillStyle = categoryConfig.primaryColor;
    ctx.beginPath();
    ctx.arc(350, 115, 30, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DONOR', 350, 105);
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.fillText(badgeInfo, 350, 125);
    
    // Message text
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.textAlign = 'left';
    
    // Word wrap for message text
    this.drawWrappedText(ctx, cardData.message, 25, 150, 320, 18);
    
    // Info grid section
    let currentY = 195;
    
    // Category-specific offering info
    const offeringInfo = this.getCategoryOfferingInfo(cardData);
    this.drawInfoItem(ctx, '🎁', 'Offering', offeringInfo.type, 25, currentY);
    this.drawInfoItem(ctx, '📍', 'Location', cardData.location, 220, currentY);
    
    currentY += 50;
    
    // Availability and category-specific count
    this.drawInfoItem(ctx, '🕐', 'Availability', cardData.availability, 25, currentY);
    this.drawInfoItem(ctx, '🏆', offeringInfo.countLabel, offeringInfo.count, 220, currentY);
  }

  private static getCategoryBadgeInfo(cardData: DonorCardData): string {
    switch (cardData.category) {
      case DonorCardCategory.BLOOD:
        return cardData.bloodOffering?.bloodType || 'N/A';
      case DonorCardCategory.ORGANS:
        return cardData.organOffering?.organType?.substring(0, 6) || 'N/A';
      case DonorCardCategory.FUNDRAISER:
        const amount = cardData.fundraiserOffering?.maxAmount;
        return amount ? `${Math.round(Number(amount) / 1000)}K` : 'N/A';
      case DonorCardCategory.MEDICINES:
        return cardData.medicineOffering?.medicineTypes?.[0]?.substring(0, 8) || 'N/A';
      case DonorCardCategory.SUPPLIES:
        return cardData.suppliesOffering?.suppliesType?.substring(0, 8) || 'N/A';
      default:
        return 'N/A';
    }
  }

  private static getCategoryOfferingInfo(cardData: DonorCardData): { type: string; countLabel: string; count: string } {
    switch (cardData.category) {
      case DonorCardCategory.BLOOD:
        return {
          type: 'Blood Donation',
          countLabel: 'Donations Made',
          count: `${cardData.bloodOffering?.donationCount || '0'} times`
        };
      case DonorCardCategory.ORGANS:
        return {
          type: 'Organ Donation',
          countLabel: 'Health Status',
          count: cardData.organOffering?.healthStatus || 'Unknown'
        };
      case DonorCardCategory.FUNDRAISER:
        return {
          type: 'Financial Support',
          countLabel: 'Max Amount',
          count: `LKR ${cardData.fundraiserOffering?.maxAmount ? Number(cardData.fundraiserOffering.maxAmount).toLocaleString() : '0'}`
        };
      case DonorCardCategory.MEDICINES:
        return {
          type: 'Medicine Donation',
          countLabel: 'Medicine Types',
          count: `${cardData.medicineOffering?.medicineTypes?.length || 0} types`
        };
      case DonorCardCategory.SUPPLIES:
        return {
          type: 'Medical Supplies',
          countLabel: 'Supply Type',
          count: cardData.suppliesOffering?.suppliesType || 'Unknown'
        };
      default:
        return {
          type: 'Donation',
          countLabel: 'Status',
          count: 'Available'
        };
    }
  }

  private static drawContactSection(ctx: CanvasRenderingContext2D, cardData: DonorCardData): void {
    const width = 400;
    const categoryConfig = CATEGORY_CONFIG[cardData.category];
    
    // Contact section background
    ctx.fillStyle = categoryConfig.bgColor;
    ctx.fillRect(15, 280, width - 30, 130);
    ctx.strokeStyle = categoryConfig.primaryColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(15, 280, width - 30, 130);
    
    // Contact header
    ctx.fillStyle = categoryConfig.primaryColor;
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('📞 Contact for Donation', 25, 305);
    
    // Contact person
    this.drawContactItem(ctx, 'Contact Person', cardData.contactPerson, `(${cardData.relationship})`, 25, 330);
    this.drawContactItem(ctx, 'Primary Phone', cardData.primaryPhone, '', 200, 330);
    
    if (cardData.secondaryPhone) {
      this.drawContactItem(ctx, 'Secondary Phone', cardData.secondaryPhone, '', 25, 380);
    }
    
    // QR code area
    this.drawQRCodePlaceholder(ctx);
  }

  private static drawFooter(ctx: CanvasRenderingContext2D, width: number): void {
    // Footer section
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 420, width, 80);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 420, width, 80);
    
    // Vytal logo
    ctx.fillStyle = '#059669';
    ctx.fillRect(15, 435, 35, 35);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('V', 32.5, 457);
    
    // Footer text
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 11px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Powered by Vytal', 60, 447);
    ctx.font = 'bold 9px Arial, sans-serif';
    ctx.fillText(`ID: DON-${Math.floor(Math.random() * 10000)}`, 60, 460);
  }

  private static drawWatermark(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.fillStyle = 'rgba(5, 150, 105, 0.05)';
    ctx.font = 'bold 60px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.save();
    ctx.translate(width/2, height/2);
    ctx.rotate(-Math.PI/6);
    ctx.fillText('DONOR', 0, 0);
    ctx.restore();
  }

  private static drawWrappedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): void {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  }

  private static drawInfoItem(ctx: CanvasRenderingContext2D, icon: string, label: string, value: string, x: number, y: number): void {
    ctx.fillStyle = '#059669';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.fillText(icon, x, y);
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 11px Arial, sans-serif';
    ctx.fillText(label, x + 20, y);
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillText(value, x + 20, y + 15);
  }

  private static drawContactItem(ctx: CanvasRenderingContext2D, label: string, value: string, subtitle: string, x: number, y: number): void {
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 11px Arial, sans-serif';
    ctx.fillText(label, x, y);
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillText(value, x, y + 15);
    if (subtitle) {
      ctx.fillStyle = '#4b5563';
      ctx.font = 'bold 10px Arial, sans-serif';
      ctx.fillText(subtitle, x, y + 28);
    }
  }

  private static drawQRCodePlaceholder(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(310, 360, 50, 40);
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(310, 360, 50, 40);
    ctx.setLineDash([]);
    
    ctx.fillStyle = '#6b7280';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⬜', 335, 380);
    ctx.font = 'bold 8px Arial, sans-serif';
    ctx.fillText('Scan to contact', 335, 395);
  }

  static async generateCardBlob(cardData: DonorCardData): Promise<Blob | null> {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return null;
      
      const scale = 3;
      canvas.width = 400 * scale;
      canvas.height = 500 * scale;
      ctx.scale(scale, scale);
      
      await this.drawDonorCard(ctx, cardData);
      
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png', 1.0);
      });
    } catch (error) {
      console.error('Error generating card blob:', error);
      return null;
    }
  }
}