const mongoose = require('mongoose');

const VerificationCodeSchema = new mongoose.Schema({
	email: { type: String, required: true, lowercase: true, trim: true },
	code: { type: String, required: true, length: 6 }, // 6-digit OTP
	type: { type: String, enum: ['email_verification', 'password_reset'], default: 'email_verification' },
	expiresAt: { type: Date, required: true },
	attempts: { type: Number, default: 0 }, // Track failed verification attempts
	verified: { type: Boolean, default: false },
	// Store signup data for creating user after verification
	signupData: {
		name: { type: String },
		username: { type: String },
		passwordHash: { type: String }
	}
}, { timestamps: true });

// Index for quick lookup
VerificationCodeSchema.index({ email: 1, type: 1 });
VerificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired codes

module.exports = mongoose.model('VerificationCode', VerificationCodeSchema);

