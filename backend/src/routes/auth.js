const express = require('express');
const jwt = require('jsonwebtoken');
const { User, VerificationCode } = require('../../models');
const { sendVerificationEmail } = require('../utils/email');

const authRouter = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES_IN = '7d';

function generateToken(user) {
	return jwt.sign({ sub: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function requireAuth(req, res, next) {
	const auth = req.headers.authorization || '';
	const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
	if (!token) return res.status(401).json({ error: 'Unauthorized' });
	try {
		const payload = jwt.verify(token, JWT_SECRET);
		req.user = payload;
		next();
	} catch (e) {
		return res.status(401).json({ error: 'Invalid token' });
	}
}

// Generate 6-digit OTP
function generateOTP() {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

// Signup: name, username, email, password (stored as plain text per requirement; not recommended)
authRouter.post('/signup', async (req, res) => {
	try {
		const { name, username, email, password } = req.body;
		if (!name || !username || !email || !password) {
			return res.status(400).json({ error: 'Name, username, email, and password are required' });
		}
		
		// Validate email domain
		const emailLower = email.toLowerCase();
		if (!emailLower.endsWith('@iiitu.ac.in')) {
			return res.status(400).json({ error: 'Only @iiitu.ac.in email addresses are allowed' });
		}
		
		const existingEmail = await User.findOne({ email: emailLower });
		if (existingEmail) {
			return res.status(409).json({ error: 'Email already in use' });
		}
		const existingUsername = await User.findOne({ username });
		if (existingUsername) {
			return res.status(409).json({ error: 'Username already in use' });
		}
		
		// Generate verification code
		const code = generateOTP();
		const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

		// Delete any existing verification codes for this email
		await VerificationCode.deleteMany({ email: emailLower, type: 'email_verification' });

		// Create verification code WITH signup data (user will be created only after OTP verification)
		await VerificationCode.create({
			email: emailLower,
			code,
			type: 'email_verification',
			expiresAt,
			signupData: {
				name,
				username: String(username).toLowerCase(),
				passwordHash: password
			}
		});

		// Send verification email in background (don't wait for it)
		// Return immediately so modal can open
		sendVerificationEmail(emailLower, code).catch(err => {
			console.error('Failed to send verification email (background):', err);
		});

		// Return immediately - user will be created only after OTP verification
		return res.status(200).json({ 
			message: 'Verification code sent. Please check your email.', 
			email: emailLower,
			requiresVerification: true
		});
	} catch (e) {
		console.error('Signup error:', e);
		return res.status(500).json({ error: 'Server error' });
	}
});

// Verify email with OTP
authRouter.post('/verify-email', async (req, res) => {
	try {
		const { email, code } = req.body;
		if (!email || !code) {
			return res.status(400).json({ error: 'Email and verification code are required' });
		}

		// Find verification code
		const verificationCode = await VerificationCode.findOne({
			email: email.toLowerCase(),
			code,
			type: 'email_verification',
			verified: false,
			expiresAt: { $gt: new Date() } // Not expired
		});

		if (!verificationCode) {
			// Increment attempts if code exists but is wrong
			const existingCode = await VerificationCode.findOne({
				email: email.toLowerCase(),
				type: 'email_verification',
				verified: false
			});
			
			if (existingCode) {
				existingCode.attempts += 1;
				await existingCode.save();
				
				if (existingCode.attempts >= 3) {
					await VerificationCode.deleteOne({ _id: existingCode._id });
					return res.status(400).json({ error: 'Too many failed attempts. Please request a new code.' });
				}
			}
			
			return res.status(400).json({ error: 'Invalid or expired verification code' });
		}

		// Check if user already exists (from previous incomplete signup)
		let user = await User.findOne({ email: email.toLowerCase() });
		
		if (!user) {
			// User doesn't exist - create user NOW (only after OTP is verified)
			if (!verificationCode.signupData || !verificationCode.signupData.name) {
				return res.status(400).json({ error: 'Signup data not found. Please sign up again.' });
			}

			// Double-check email/username are still available
			const existingEmail = await User.findOne({ email: email.toLowerCase() });
			if (existingEmail) {
				return res.status(409).json({ error: 'Email already in use' });
			}
			const existingUsername = await User.findOne({ username: verificationCode.signupData.username });
			if (existingUsername) {
				return res.status(409).json({ error: 'Username already in use' });
			}

			// Create user with verified status
			user = await User.create({
				name: verificationCode.signupData.name,
				username: verificationCode.signupData.username,
				email: email.toLowerCase(),
				passwordHash: verificationCode.signupData.passwordHash,
				isActive: true,
				isVerified: true // Verified immediately since OTP is correct
			});
			console.log('✅ User created after OTP verification:', user.email);
		} else {
			// User exists (maybe from previous attempt) - just mark as verified
			user.isVerified = true;
			await user.save();
		}

		// Mark verification code as used
		verificationCode.verified = true;
		await verificationCode.save();

		// Generate token and return
		const token = generateToken(user);
		return res.json({ 
			token, 
			message: 'Email verified successfully',
			user: { 
				id: user._id, 
				name: user.name, 
				username: user.username, 
				email: user.email,
				isVerified: true
			}
		});
	} catch (e) {
		console.error('Verify email error:', e);
		return res.status(500).json({ error: 'Server error' });
	}
});

// Resend verification code
authRouter.post('/resend-verification', async (req, res) => {
	try {
		const { email } = req.body;
		if (!email) {
			return res.status(400).json({ error: 'Email is required' });
		}

		const emailLower = email.toLowerCase();
		const user = await User.findOne({ email: emailLower });
		
		// If user exists and is verified, no need to resend
		if (user && user.isVerified) {
			return res.status(400).json({ error: 'Email is already verified' });
		}

		// Check if we can resend (rate limiting - max 3 resends per hour)
		const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
		const recentCodes = await VerificationCode.countDocuments({
			email: emailLower,
			type: 'email_verification',
			createdAt: { $gte: oneHourAgo }
		});

		if (recentCodes >= 3) {
			return res.status(429).json({ error: 'Too many verification requests. Please try again later.' });
		}

		// Find existing verification code to preserve signup data if present
		const existingCode = await VerificationCode.findOne({
			email: emailLower,
			type: 'email_verification',
			verified: false
		});

		// Generate new code
		const code = generateOTP();
		const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

		// Delete old codes for this email
		await VerificationCode.deleteMany({ email: emailLower, type: 'email_verification' });

		// Create new verification code (preserve signupData if it exists)
		await VerificationCode.create({
			email: emailLower,
			code,
			type: 'email_verification',
			expiresAt,
			signupData: existingCode?.signupData || undefined
		});

		// Send verification email in background
		sendVerificationEmail(emailLower, code).catch(err => {
			console.error('Failed to resend verification email (background):', err);
		});

		return res.json({ message: 'Verification code sent successfully' });
	} catch (e) {
		console.error('Resend verification error:', e);
		return res.status(500).json({ error: 'Server error' });
	}
});

// Login
authRouter.post('/login', async (req, res) => {
	try {
		const { identifier, email, username, password } = req.body;
		const loginIdentifier = identifier || email || username;
		if (!loginIdentifier || !password) return res.status(400).json({ error: 'Email/username and password required' });
		const query = loginIdentifier.includes('@') ? { email: loginIdentifier.toLowerCase() } : { username: String(loginIdentifier).toLowerCase() };
		const user = await User.findOne({ ...query, isActive: true });
		if (!user || user.passwordHash !== password) return res.status(401).json({ error: 'Invalid credentials' });
		
		// Check if email is verified
		if (!user.isVerified) {
			return res.status(403).json({ 
				error: 'Email not verified', 
				requiresVerification: true,
				email: user.email
			});
		}
		
		const token = generateToken(user);
		return res.json({ token, user: { id: user._id, name: user.name, username: user.username, email: user.email } });
	} catch (e) {
		return res.status(500).json({ error: 'Server error' });
	}
});

// Me
authRouter.get('/me', requireAuth, async (req, res) => {
	const user = await User.findById(req.user.sub).select('name username email avatarUrl isVerified');
	if (!user) return res.status(404).json({ error: 'User not found' });
	return res.json({ user: { id: user._id, name: user.name, username: user.username, email: user.email, avatarUrl: user.avatarUrl || '', isVerified: user.isVerified } });
});

// Change password (no hashing per current project requirements)
authRouter.post('/change-password', requireAuth, async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body;
		if (!currentPassword || !newPassword) {
			return res.status(400).json({ error: 'Current and new password are required' });
		}
		const user = await User.findById(req.user.sub);
		if (!user) return res.status(404).json({ error: 'User not found' });
		if (user.passwordHash !== currentPassword) return res.status(400).json({ error: 'Current password is incorrect' });
		user.passwordHash = newPassword;
		await user.save();
		return res.json({ message: 'Password updated successfully' });
	} catch (e) {
		return res.status(500).json({ error: 'Server error' });
	}
});

module.exports = { authRouter };


