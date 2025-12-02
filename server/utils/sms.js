const twilio = require('twilio');

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;

// Send SMS via Twilio
const sendSMS = async (to, message) => {
  try {
    // Format phone number (ensure it has country code)
    let formattedNumber = to;
    if (!to.startsWith('+')) {
      formattedNumber = `+91${to}`; // Default to India
    }

    const result = await twilioClient.messages.create({
      body: message,
      from: TWILIO_PHONE,
      to: formattedNumber,
    });

    console.log(`SMS sent successfully. SID: ${result.sid}`);
    return {
      success: true,
      sid: result.sid,
      status: result.status,
    };
  } catch (error) {
    console.error('Twilio SMS Error:', error.message);
    throw error;
  }
};

// Send Report Confirmation SMS
const sendReportConfirmation = async (mobileNumber, reportId) => {
  const message = `CrimeTrack: Your crime report (ID: ${reportId}) has been submitted successfully. You will be notified once verified by authorities.`;
  return await sendSMS(mobileNumber, message);
};

// Send Verification Status SMS
const sendVerificationStatus = async (mobileNumber, reportId, status) => {
  let message;

  switch (status) {
    case 'verified':
      message = `CrimeTrack: Your crime report (ID: ${reportId}) has been VERIFIED by authorities. Appropriate action is being taken. Thank you for reporting.`;
      break;
    case 'spam':
      message = `CrimeTrack: Your crime report (ID: ${reportId}) has been marked as invalid and cancelled. If you believe this is an error, please contact support.`;
      break;
    case 'resolved':
      message = `CrimeTrack: Your crime report (ID: ${reportId}) has been RESOLVED. Thank you for using CrimeTrack to keep our community safe.`;
      break;
    default:
      message = `CrimeTrack: Your crime report (ID: ${reportId}) status has been updated to: ${status}.`;
  }

  return await sendSMS(mobileNumber, message);
};

module.exports = {
  sendSMS,
  sendReportConfirmation,
  sendVerificationStatus,
};
