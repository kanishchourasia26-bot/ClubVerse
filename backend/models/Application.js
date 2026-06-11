const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
	club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
	rejectionMessage: { type: String, trim: true },
	appliedAt: { type: Date, default: Date.now }
});

ApplicationSchema.index({ club: 1, user: 1 }, { unique: true });
ApplicationSchema.index({ user: 1 });

module.exports = mongoose.model('Application', ApplicationSchema);

