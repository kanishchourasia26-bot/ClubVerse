const mongoose = require('mongoose');

const EventRegistrationSchema = new mongoose.Schema({
	event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	registeredAt: { type: Date, default: Date.now }
});

EventRegistrationSchema.index({ event: 1, user: 1 }, { unique: true });
EventRegistrationSchema.index({ user: 1 });

module.exports = mongoose.model('EventRegistration', EventRegistrationSchema);


