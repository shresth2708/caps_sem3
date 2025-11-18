const QRCode = require('qrcode');

// Generate QR code as data URL
const generateQRCode = async (data) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(data), {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
};

// Generate QR code as buffer
const generateQRCodeBuffer = async (data) => {
  try {
    const buffer = await QRCode.toBuffer(JSON.stringify(data), {
      errorCorrectionLevel: 'M',
      type: 'png',
      quality: 0.95,
      margin: 1,
      width: 300
    });
    return buffer;
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
};

module.exports = {
  generateQRCode,
  generateQRCodeBuffer
};
