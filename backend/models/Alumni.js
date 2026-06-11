const mongoose = require('mongoose');

const AlumniSchema = new mongoose.Schema({
	club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
	name: { type: String, required: true, trim: true },
	photoUrl: { type: String, required: true, trim: true }, // Cloudinary URL
	designation: { type: String, trim: true }, // e.g., "Former President", "Former Vice-President"
	yearGraduated: { type: Number }, // Year they graduated
	isFounder: { type: Boolean, default: false }, // Special flag for founder
	bio: { type: String, trim: true, maxlength: 500 } // Optional bio
}, { timestamps: true });

AlumniSchema.index({ club: 1, yearGraduated: -1 });
AlumniSchema.index({ club: 1, isFounder: 1 });

module.exports = mongoose.model('Alumni', AlumniSchema);


