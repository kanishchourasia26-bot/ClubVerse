const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema(
	{
		club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
		title: { type: String, required: true, trim: true },
		description: { type: String, trim: true, maxlength: 4000 },
		notice: { type: String, trim: true, maxlength: 2000 }, // Additional notice section for event details
		location: { type: String, trim: true },
		startAt: { type: Date, required: true },
		endAt: { type: Date },
		registrationDeadline: { type: Date, required: true }, // When registration closes
		isOpen: { type: Boolean, default: true }, // Whether event is active/visible
		bannerUrl: { type: String, trim: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false } // Optional for admin-created events
	},
	{ timestamps: true }
);

EventSchema.index({ club: 1, startAt: -1 });
EventSchema.index({ isOpen: 1 });

module.exports = mongoose.model('Event', EventSchema);


