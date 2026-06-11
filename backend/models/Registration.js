const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema(
	{
		event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		name: { type: String, trim: true },
		email: { type: String, trim: true, lowercase: true },
		phone: { type: String, trim: true },
		answers: { type: Object, default: {} },
		status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
	},
	{ timestamps: true }
);

RegistrationSchema.index({ event: 1, createdAt: -1 });
RegistrationSchema.index({ event: 1, user: 1 }, { unique: true, partialFilterExpression: { user: { $type: 'objectId' } } });

module.exports = mongoose.model('Registration', RegistrationSchema);


