/**
 * Test Helper: Get OTP from Supabase for testing
 * This is only for testing purposes
 */

import { supabase } from '../config/supabase';

async function getLatestOTP(email: string) {
  // Get user
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (!user) {
    console.log('User not found');
    return;
  }

  // Get latest OTP
  const { data: otp } = await supabase
    .from('otps')
    .select('*')
    .eq('user_id', user.id)
    .eq('purpose', 'email_verify')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (otp) {
    console.log(`OTP for ${email}: ${otp.code}`);
    console.log(`Expires at: ${otp.expires_at}`);
  } else {
    console.log('No OTP found');
  }
}

// Get email from command line
const email = process.argv[2];
if (!email) {
  console.log('Usage: ts-node get-otp.ts <email>');
  process.exit(1);
}

getLatestOTP(email).then(() => process.exit(0));
