const mongoose = require('mongoose');

const MembershipSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
		role: { type: String, enum: ['member', 'core', 'lead', 'manager'], default: 'member' },
		designation: { type: String, trim: true },
		rank: { type: Number, default: 10 },
		isActive: { type: Boolean, default: true },
		joinedAt: { type: Date, default: Date.now }
	},
	{ timestamps: true }
);

MembershipSchema.index({ user: 1, club: 1 }, { unique: true });
MembershipSchema.index({ club: 1, role: 1 });
MembershipSchema.index({ club: 1, isActive: 1, rank: -1 });

module.exports = mongoose.model('Membership', MembershipSchema);


