"use server";

export async function sendWhatsAppNotification(phone: string, message: string) {
  // In a real application, you would use the Twilio SDK or Meta Graph API:
  // const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // await client.messages.create({
  //   body: message,
  //   from: 'whatsapp:+14155238886',
  //   to: `whatsapp:${phone}`
  // });
  
  console.log(`[WhatsApp API Mock] Sending to ${phone}: ${message}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  return { success: true, message: "WhatsApp notification dispatched." };
}
