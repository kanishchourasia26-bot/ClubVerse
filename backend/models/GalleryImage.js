const mongoose = require('mongoose');

const GalleryImageSchema = new mongoose.Schema(
	{
		club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
		uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
		imageUrl: { type: String, required: true, trim: true },
		caption: { type: String, trim: true, maxlength: 500 },
		event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
		isPublic: { type: Boolean, default: true }
	},
	{ timestamps: true }
);

GalleryImageSchema.index({ club: 1, createdAt: -1 });

module.exports = mongoose.model('GalleryImage', GalleryImageSchema);


