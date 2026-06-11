const mongoose = require('mongoose');

const ClubLinksSchema = new mongoose.Schema(
	{
		instagram: { type: String, trim: true },
		twitter: { type: String, trim: true },
		youtube: { type: String, trim: true },
		website: { type: String, trim: true }
	},
	{ _id: false }
);

const ClubSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		slug: { type: String, required: true, lowercase: true, trim: true },
		description: { type: String, trim: true, maxlength: 2000 },
		category: { type: String, trim: true },
		managerUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		coverImageUrl: { type: String, trim: true },
		links: { type: ClubLinksSchema, default: {} },
		isActive: { type: Boolean, default: true }
	},
	{ timestamps: true }
);

ClubSchema.index({ name: 1 });
ClubSchema.index({ slug: 1 }, { unique: true });

module.exports = mongoose.model('Club', ClubSchema);


