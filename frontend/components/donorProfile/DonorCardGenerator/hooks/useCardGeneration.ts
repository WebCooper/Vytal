// hooks/useCardGeneration.ts
import { useState } from 'react';
import { DonorCardData } from '../types/donorCard';
import { CATEGORY_CONFIG } from '../utils/constants';

export const useCardGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  // Method 1: HTML to Canvas conversion (No external dependencies)
  const generateDonorCardFromPreview = async (cardData: DonorCardData, cardRef: React.RefObject<HTMLDivElement | null>) => {
    if (!cardRef.current) {
      alert('Card preview not found. Please try again.');
      return;
    }

    setIsGenerating(true);
    
    try {
      const element = cardRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Canvas not supported');
      
      // Get element dimensions
      const rect = element.getBoundingClientRect();
      const scale = 3; // High resolution
      
      canvas.width = rect.width * scale;
      canvas.height = rect.height * scale;
      ctx.scale(scale, scale);
      
      // Draw improved card that matches preview
      await drawCardFromData(ctx, cardData, rect.width, rect.height);
      
      // Download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `donor-card-${cardData.donorName.replace(/\s+/g, '-')}-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
        setIsGenerating(false);
      }, 'image/png', 1.0);
      
    } catch (error) {
      console.error('Error generating card from preview:', error);
      setIsGenerating(false);
      // Fallback to manual screenshot
      generateDonorCardScreenshot(cardData);
    }
  };

  // Method 2: Manual screenshot with instructions
  const generateDonorCardScreenshot = async (cardData: DonorCardData, cardRef?: React.RefObject<HTMLDivElement | null>) => {
    if (cardRef && !cardRef.current) return;

    setIsGenerating(true);

    try {
      // Scroll the card into view and highlight it if cardRef is provided
      if (cardRef?.current) {
        cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add temporary highlight
        const originalStyle = cardRef.current.style.cssText;
        cardRef.current.style.outline = '4px solid #10b981';
        cardRef.current.style.outlineOffset = '4px';
        cardRef.current.style.backgroundColor = '#f0fdf4';
        
        setTimeout(() => {
          if (cardRef.current) {
            cardRef.current.style.cssText = originalStyle;
          }
        }, 10000); // 10 seconds highlight
      }
      
      const platform = navigator.platform.toLowerCase();
      const userAgent = navigator.userAgent.toLowerCase();
      
      let instructions = '';
      if (platform.includes('mac') || userAgent.includes('mac')) {
        instructions = `SCREENSHOT INSTRUCTIONS FOR MAC:

1. Press: Cmd + Shift + 4
2. Your cursor will change to a crosshair
3. Drag to select the highlighted green donor card area
4. Release to capture
5. The screenshot will be saved to your Desktop

The donor card is highlighted in green for 10 seconds.`;
      } else if (platform.includes('win') || userAgent.includes('windows')) {
        instructions = `SCREENSHOT INSTRUCTIONS FOR WINDOWS:

1. Press: Windows Key + Shift + S
2. Select "Rectangular snip" from the toolbar
3. Drag to select the highlighted green donor card area
4. Click the notification to edit/save
5. Save the image

The donor card is highlighted in green for 10 seconds.`;
      } else {
        instructions = `SCREENSHOT INSTRUCTIONS:

1. Use your system's screenshot tool
2. Capture the highlighted green donor card area
3. Save the image

Common shortcuts:
- Windows: Win + Shift + S
- Mac: Cmd + Shift + 4
- Linux: PrtScn or Shift + PrtScn

The donor card is highlighted in green for 10 seconds.`;
      }
      
      alert(instructions);
      
    } catch (error) {
      console.error('Screenshot setup failed:', error);
      alert('Please take a screenshot manually using your system screenshot tool.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Method 3: Enhanced canvas recreation
  const generateDonorCardCanvas = async (cardData: DonorCardData) => {
    setIsGenerating(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Canvas not supported');
      
      const scale = 3;
      const width = 384;
      const height = 480;
      
      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.scale(scale, scale);
      
      // Draw enhanced card
      await drawCardFromData(ctx, cardData, width, height);
      
      // Download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `donor-card-${cardData.donorName.replace(/\s+/g, '-')}-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png', 1.0);
      
    } catch (error) {
      console.error('Canvas generation failed:', error);
      alert('Canvas generation failed. Please try the screenshot method.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Draw card content that matches the preview design exactly
  const drawCardFromData = async (ctx: CanvasRenderingContext2D, cardData: DonorCardData, width: number, height: number) => {
    const categoryConfig = CATEGORY_CONFIG[cardData.category];
    
    // Clear canvas and set white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Add rounded corners and shadow effect to match preview
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
    
    // Draw rounded rectangle background
    const cornerRadius = 16;
    ctx.beginPath();
    ctx.moveTo(cornerRadius, 0);
    ctx.lineTo(width - cornerRadius, 0);
    ctx.quadraticCurveTo(width, 0, width, cornerRadius);
    ctx.lineTo(width, height - cornerRadius);
    ctx.quadraticCurveTo(width, height, width - cornerRadius, height);
    ctx.lineTo(cornerRadius, height);
    ctx.quadraticCurveTo(0, height, 0, height - cornerRadius);
    ctx.lineTo(0, cornerRadius);
    ctx.quadraticCurveTo(0, 0, cornerRadius, 0);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();
    
    // Add subtle border
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Header section with gradient (matching preview)
    const headerHeight = 140;
    
    // Create gradient to match preview based on category
    const gradient = ctx.createLinearGradient(0, 0, width, headerHeight);
    gradient.addColorStop(0, categoryConfig.primaryColor);
    gradient.addColorStop(1, categoryConfig.primaryColor + 'dd');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, headerHeight);
    
    // Header icon/badge (left side)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(40, 40, 24, 0, 2 * Math.PI);
    ctx.fill();
    
    // Icon symbol based on category
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.textAlign = 'center';
    
    switch (cardData.category) {
      case 'BLOOD':
        ctx.fillText('🩸', 40, 48);
        break;
      case 'ORGANS':
        ctx.fillText('❤️', 40, 48);
        break;
      case 'MEDICINES':
        ctx.fillText('💊', 40, 48);
        break;
      case 'SUPPLIES':
        ctx.fillText('🏥', 40, 48);
        break;
      case 'FUNDRAISER':
        ctx.fillText('💰', 40, 48);
        break;
      default:
        ctx.fillText('❤️', 40, 48);
    }
    
    // Category label and donor card text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(categoryConfig.label, 75, 35);
    
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText('Donor Card', 75, 52);
    
    // Urgency badge (top right with rounded corners)
    const urgencyColor = getUrgencyColor(cardData.urgency);
    const badgeX = width - 140;
    const badgeY = 20;
    const badgeWidth = 120;
    const badgeHeight = 28;
    
    ctx.fillStyle = urgencyColor.bg;
    ctx.beginPath();
    ctx.moveTo(badgeX + 8, badgeY);
    ctx.lineTo(badgeX + badgeWidth - 8, badgeY);
    ctx.quadraticCurveTo(badgeX + badgeWidth, badgeY, badgeX + badgeWidth, badgeY + 8);
    ctx.lineTo(badgeX + badgeWidth, badgeY + badgeHeight - 8);
    ctx.quadraticCurveTo(badgeX + badgeWidth, badgeY + badgeHeight, badgeX + badgeWidth - 8, badgeY + badgeHeight);
    ctx.lineTo(badgeX + 8, badgeY + badgeHeight);
    ctx.quadraticCurveTo(badgeX, badgeY + badgeHeight, badgeX, badgeY + badgeHeight - 8);
    ctx.lineTo(badgeX, badgeY + 8);
    ctx.quadraticCurveTo(badgeX, badgeY, badgeX + 8, badgeY);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = urgencyColor.text;
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Medium Priority', badgeX + badgeWidth/2, badgeY + 18);
    
    // Donor name (centered, large)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(cardData.donorName || 'Donor Name', width/2, 100);
    
    // Location with icon
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('📍 ' + (cardData.location || 'Location'), width/2, 125);
    
    // Main content area
    let currentY = headerHeight + 24;
    
    // Category-specific info section (matching preview design exactly)
    const categoryInfo = getCategoryInfo(cardData);
    const infoBoxHeight = cardData.category === 'MEDICINES' ? 120 : 100;
    
    // Info box background with category-specific color
    ctx.fillStyle = categoryConfig.bgColor;
    ctx.fillRect(16, currentY, width-32, infoBoxHeight);
    
    // Info box border with category color
    ctx.strokeStyle = categoryConfig.primaryColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.strokeRect(16, currentY, width-32, infoBoxHeight);
    
    if (cardData.category === 'MEDICINES') {
      // Medicine-specific layout
      ctx.fillStyle = categoryConfig.primaryColor;
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Available Medicines:', 28, currentY + 30);
      
      // Draw medicine tags
      const medicines = cardData.medicineOffering?.medicineTypes?.filter(m => m.trim()) || ['Insulin', 'Blood Pressure Medication'];
      let tagY = currentY + 50;
      let tagX = 28;
      
      medicines.forEach((medicine) => {
        const tagWidth = ctx.measureText(medicine).width + 16;
        
        // Tag background
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(tagX, tagY, tagWidth, 24);
        
        // Tag border
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1;
        ctx.strokeRect(tagX, tagY, tagWidth, 24);
        
        // Tag text
        ctx.fillStyle = '#92400e';
        ctx.font = '12px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(medicine, tagX + 8, tagY + 16);
        
        tagX += tagWidth + 8;
        if (tagX > width - 100) {
          tagX = 28;
          tagY += 30;
        }
      });
      
      // Quantity and expiry info
      ctx.fillStyle = categoryConfig.primaryColor;
      ctx.font = '12px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Quantity', 28, currentY + 90);
      ctx.textAlign = 'right';
      ctx.fillText(cardData.medicineOffering?.quantity || '30 tablets, 2 bottles', width - 28, currentY + 90);
      
      ctx.textAlign = 'left';
      ctx.fillText('Expiry Date', 28, currentY + 110);
      ctx.textAlign = 'right';
      ctx.fillText(cardData.medicineOffering?.expiry ? new Date(cardData.medicineOffering.expiry).toLocaleDateString() : '12/31/2025', width - 28, currentY + 110);
      
    } else if (cardData.category === 'BLOOD') {
      // Blood donation layout
      ctx.fillStyle = categoryConfig.primaryColor;
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(categoryInfo.label, 28, currentY + 30);
      
      // Large value display
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(categoryInfo.value, width - 28, currentY + 30);
      
      // Additional info with proper layout
      if (categoryInfo.count) {
        ctx.fillStyle = categoryConfig.primaryColor;
        ctx.font = '12px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(categoryInfo.extra, 28, currentY + 55);
        ctx.textAlign = 'right';
        ctx.fillText(categoryInfo.count, width - 28, currentY + 55);
      }
      
      if (categoryInfo.lastDonation) {
        ctx.textAlign = 'left';
        ctx.fillText('Last Donation', 28, currentY + 75);
        ctx.textAlign = 'right';
        ctx.fillText(categoryInfo.lastDonation, width - 28, currentY + 75);
      }
    } else {
      // Other category layouts
      ctx.fillStyle = categoryConfig.primaryColor;
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(categoryInfo.label, 28, currentY + 30);
      
      // Large value display
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(categoryInfo.value, width - 28, currentY + 30);
      
      if (categoryInfo.extra) {
        ctx.fillStyle = categoryConfig.primaryColor;
        ctx.font = '12px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(categoryInfo.extra, 28, currentY + 55);
      }
    }
    
    currentY += infoBoxHeight + 32;
    
    // Message section with green accent
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('💚 Message', 24, currentY);
    currentY += 25;
    
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px system-ui, sans-serif';
    
    // Word wrap for message with proper spacing
    const message = cardData.message || 'Your message here...';
    currentY = drawWrappedText(ctx, message, 24, currentY, width - 48, 20);
    currentY += 30;
    
    // Availability section
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.fillText('🕐 Availability', 24, currentY);
    
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(cardData.availability || 'Available Now', width - 24, currentY);
    
    currentY += 40;
    
    // Contact section (matching preview design)
    const contactBoxHeight = 140;
    
    // Contact box background with category color
    ctx.fillStyle = categoryConfig.bgColor;
    ctx.fillRect(16, currentY, width-32, contactBoxHeight);
    
    // Contact box border with category color
    ctx.strokeStyle = categoryConfig.primaryColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(16, currentY, width-32, contactBoxHeight);
    
    // Contact header
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Contact Information', 28, currentY + 30);
    
    // Contact details in two columns
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText('Contact Person', 28, currentY + 55);
    ctx.fillText('Primary', 28, currentY + 80);
    ctx.fillText('Secondary', 28, currentY + 105);
    ctx.fillText('Relationship', 28, currentY + 130);
    
    // Values (right aligned)
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(cardData.contactPerson || 'Rangana Viranin', width - 28, currentY + 55);
    ctx.fillText(cardData.primaryPhone || '094-869-624', width - 28, currentY + 80);
    ctx.fillText(cardData.secondaryPhone || '078-471-7407', width - 28, currentY + 105);
    ctx.fillText(cardData.relationship || 'Self', width - 28, currentY + 130);
    
    // Footer section with category color
    const footerY = height - 50;
    const footerHeight = 50;
    
    ctx.fillStyle = categoryConfig.primaryColor;
    ctx.fillRect(0, footerY, width, footerHeight);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Together We Can Save Lives', width/2, footerY + 20);
    
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText('Emergency Contact Available', width/2, footerY + 37);
  };

  // Helper functions
  const getCategoryInfo = (cardData: DonorCardData) => {
    switch (cardData.category) {
      case 'BLOOD':
        return {
          label: 'Blood Type',
          value: cardData.bloodOffering?.bloodType || 'B+',
          extra: 'Donations',
          lastDonation: cardData.bloodOffering?.lastDonation || '3 months ago',
          count: cardData.bloodOffering?.donationCount || '12'
        };
      case 'ORGANS':
        return {
          label: 'Organ Type',
          value: cardData.organOffering?.organType || 'Not specified',
          extra: cardData.organOffering?.healthStatus || ''
        };
      case 'FUNDRAISER':
        return {
          label: 'Max Amount',
          value: cardData.fundraiserOffering?.maxAmount ? `LKR ${Number(cardData.fundraiserOffering.maxAmount).toLocaleString()}` : 'Not specified',
          extra: ''
        };
      case 'MEDICINES':
        const medicines = cardData.medicineOffering?.medicineTypes?.filter(m => m.trim()) || [];
        return {
          label: 'Available Medicines',
          value: medicines.length > 0 ? medicines[0] : 'Not specified',
          extra: medicines.length > 1 ? `+${medicines.length - 1} more` : ''
        };
      case 'SUPPLIES':
        return {
          label: 'Supply Type',
          value: cardData.suppliesOffering?.suppliesType || 'Not specified',
          extra: cardData.suppliesOffering?.quantity || ''
        };
      default:
        return { label: 'Donation', value: 'Available', extra: '' };
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'HIGH':
        return { bg: '#fef2f2', text: '#dc2626' };
      case 'MEDIUM':
        return { bg: '#fef3c7', text: '#d97706' };
      case 'LOW':
        return { bg: '#f0fdf4', text: '#16a34a' };
      default:
        return { bg: '#f3f4f6', text: '#6b7280' };
    }
  };

  const drawWrappedText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
    return currentY + lineHeight;
  };

  // Generate blob for sharing - Remove the unused cardRef parameter
  const generateCardBlob = async (cardData: DonorCardData): Promise<Blob | null> => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return null;
      
      const scale = 2;
      const width = 384;
      const height = 480;
      
      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.scale(scale, scale);
      
      await drawCardFromData(ctx, cardData, width, height);
      
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png', 1.0);
      });
    } catch (error) {
      console.error('Error generating blob:', error);
      return null;
    }
  };

  return {
    isGenerating,
    generateDonorCard: generateDonorCardFromPreview,
    generateCardBlob,
    generateDonorCardScreenshot,
    generateDonorCardCanvas
  };
};