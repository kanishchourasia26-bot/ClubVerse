const mongoose = require('mongoose');

const HiringStatusSchema = new mongoose.Schema({
	club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true, unique: true },
	isHiring: { type: Boolean, default: false },
	hiringDeadline: { type: Date },
	hiringDescription: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('HiringStatus', HiringStatusSchema);

