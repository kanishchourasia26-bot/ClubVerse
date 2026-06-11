const mongoose = require('mongoose');

const SocialLinksSchema = new mongoose.Schema(
	{
		instagram: { type: String, trim: true },
		twitter: { type: String, trim: true },
		linkedin: { type: String, trim: true },
		github: { type: String, trim: true },
		website: { type: String, trim: true }
	},
	{ _id: false }
);

const UserSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		username: { type: String, required: true, lowercase: true, trim: true },
		email: { type: String, required: true, unique: true, lowercase: true, trim: true },
		passwordHash: { type: String, required: true },
		studentId: { type: String, trim: true },
		avatarUrl: { type: String, trim: true },
		bio: { type: String, trim: true, maxlength: 1000 },
		skills: { type: [String], default: [] },
		socials: { type: SocialLinksSchema, default: {} },
		isActive: { type: Boolean, default: true },
		isVerified: { type: Boolean, default: false }
	},
	{ timestamps: true }
);

UserSchema.index({ name: 'text', email: 'text', username: 'text', studentId: 'text' });
UserSchema.index({ username: 1 }, { unique: true });

module.exports = mongoose.model('User', UserSchema);


