const nodemailer = require('nodemailer');

// Create transporter - using Gmail SMTP (can be configured for other services)
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_USER, // Your Gmail address
		pass: process.env.EMAIL_PASSWORD // Gmail App Password (not regular password)
	},
	debug: false, // set to true for debugging
	logger: false
});

// Verify email configuration on startup
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
	console.warn('⚠️  WARNING: EMAIL_USER or EMAIL_PASSWORD not set in .env file');
	console.warn('   Email verification will not work until these are configured.');
} else {
	// Test connection on startup
	transporter.verify().then(() => {
		console.log('✅ Email service configured successfully');
	}).catch((err) => {
		console.error('❌ Email service configuration error:', err.message);
		if (err.code === 'EAUTH') {
			console.error('\n📧 Gmail Authentication Error - Common fixes:');
			console.error('   1. Make sure you are using a Gmail App Password (not your regular password)');
			console.error('   2. Go to: Google Account → Security → 2-Step Verification → App passwords');
			console.error('   3. Generate a new App Password for "Mail"');
			console.error('   4. Copy the 16-character password and use it as EMAIL_PASSWORD');
			console.error('   5. Make sure EMAIL_USER in .env matches your Gmail address exactly');
		}
	});
}

// Alternative configuration for custom SMTP
/*
const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST || 'smtp.gmail.com',
	port: process.env.SMTP_PORT || 587,
	secure: false, // true for 465, false for other ports
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASSWORD
	}
});
*/

// Send verification code email
async function sendVerificationEmail(email, code) {
	try {
		// Check if email credentials are set
		if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
			console.error('❌ EMAIL_USER or EMAIL_PASSWORD not configured');
			return { success: false, error: 'Email service not configured. Please set EMAIL_USER and EMAIL_PASSWORD in .env file' };
		}

		// Verify transporter is ready before sending
		try {
			await transporter.verify();
		} catch (verifyError) {
			console.error('Email transporter verification failed:', verifyError.message);
			return { success: false, error: `Email service not ready: ${verifyError.message}` };
		}

		console.log(`📧 Attempting to send verification email to: ${email}`);
		
		const mailOptions = {
			from: `"ClubVerse" <${process.env.EMAIL_USER}>`,
			to: email,
			subject: 'Verify Your Email - ClubVerse',
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
					<h2 style="color: #007bff;">Verify Your Email Address</h2>
					<p>Thank you for signing up with ClubVerse! Please use the following verification code to activate your account:</p>
					<div style="background: #f8f9fa; border: 2px dashed #007bff; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
						<h1 style="color: #007bff; margin: 0; font-size: 36px; letter-spacing: 4px;">${code}</h1>
					</div>
					<p>This code will expire in 15 minutes.</p>
					<p>If you didn't create an account with ClubVerse, please ignore this email.</p>
					<hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
					<p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply.</p>
				</div>
			`,
			text: `
				Verify Your Email Address
				
				Thank you for signing up with ClubVerse! Please use the following verification code to activate your account:
				
				${code}
				
				This code will expire in 15 minutes.
				
				If you didn't create an account with ClubVerse, please ignore this email.
			`
		};

		const info = await transporter.sendMail(mailOptions);
		console.log('✅ Verification email sent successfully!');
		console.log('   Message ID:', info.messageId);
		console.log('   To:', email);
		return { success: true, messageId: info.messageId };
	} catch (error) {
		console.error('❌ Error sending verification email:');
		console.error('   Error Code:', error.code);
		console.error('   Error Message:', error.message);
		console.error('   Response:', error.response);
		
		let errorMessage = error.message;
		if (error.code === 'EAUTH') {
			errorMessage = 'Email authentication failed. Please check EMAIL_USER and EMAIL_PASSWORD in .env file. Make sure you are using a Gmail App Password.';
		} else if (error.code === 'EENVELOPE') {
			errorMessage = 'Invalid email address or recipient';
		}
		
		return { success: false, error: errorMessage, code: error.code };
	}
}

// Test email connection
async function testEmailConnection() {
	try {
		await transporter.verify();
		console.log('Email server is ready to send messages');
		return true;
	} catch (error) {
		console.error('Email server connection error:', error);
		return false;
	}
}

module.exports = {
	sendVerificationEmail,
	testEmailConnection,
	transporter
};


