const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { requireAdmin } = require('./utils');
const { Club, Membership, User, GalleryImage, Alumni, HiringStatus, Application } = require('../../models');

const adminRouter = express.Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer for temporary file storage before uploading to Cloudinary
const upload = multer({ 
	dest: 'uploads/temp/',
	limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// POST /api/admin/login
adminRouter.post('/login', (req, res) => {
	const { username, password } = req.body;
	if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
		return res.status(401).json({ error: 'Invalid credentials' });
	}
	const token = jwt.sign({ role: 'admin', sub: 'site_admin' }, JWT_SECRET, { expiresIn: '7d' });
	return res.json({ token, admin: { username: ADMIN_USERNAME } });
});

// GET /api/admin/clubs
adminRouter.get('/clubs', requireAdmin, async (req, res) => {
	try {
		console.log('Admin clubs endpoint called');
		const clubs = await Club.find({}).select('_id name slug category isActive');
		console.log('Found clubs:', clubs.length);
		return res.json({ clubs });
	} catch (e) {
		console.error('Error in admin clubs:', e);
		return res.status(500).json({ error: 'Server error' });
	}
});

// GET /api/admin/users/search - search users for autocomplete
adminRouter.get('/users/search', requireAdmin, async (req, res) => {
	try {
		const { q } = req.query;
		if (!q || q.trim().length < 2) {
			return res.json({ users: [] });
		}
		
		const searchTerm = q.trim().toLowerCase();
		const users = await User.find({
			$or: [
				{ name: { $regex: searchTerm, $options: 'i' } },
				{ username: { $regex: searchTerm, $options: 'i' } },
				{ email: { $regex: searchTerm, $options: 'i' } }
			]
		})
		.select('name username email avatarUrl')
		.limit(7)
		.sort({ name: 1 });
		
		return res.json({ users });
	} catch (e) {
		return res.status(500).json({ error: 'Server error' });
	}
});

// GET /api/admin/clubs/:id/members
adminRouter.get('/clubs/:id/members', requireAdmin, async (req, res) => {
	try {
		const clubId = req.params.id;
		
		// Define designation hierarchy for sorting
		const designationOrder = {
			'President': 1,
			'Vice-President': 2,
			'Treasurer': 3,
			'Secretary': 4,
			'Head': 5,
			'Executive': 6,
			'Member': 7
		};
		
		const memberships = await Membership.find({ club: clubId, isActive: true })
			.populate('user', 'name username avatarUrl email');
		
		// Sort by designation hierarchy, then by joined date
		memberships.sort((a, b) => {
			const orderA = designationOrder[a.designation] || 999;
			const orderB = designationOrder[b.designation] || 999;
			if (orderA !== orderB) {
				return orderA - orderB;
			}
			return new Date(a.joinedAt) - new Date(b.joinedAt);
		});
		
		return res.json({ members: memberships });
	} catch (e) {
		return res.status(500).json({ error: 'Server error' });
	}
});

// POST /api/admin/clubs/:id/members (add by username/email)
adminRouter.post('/clubs/:id/members', requireAdmin, async (req, res) => {
	try {
		const clubId = req.params.id;
		const { identifier, designation } = req.body; // identifier can be username or email
		if (!identifier) return res.status(400).json({ error: 'identifier required' });
		const user = await User.findOne({
			$or: [ { username: String(identifier).toLowerCase() }, { email: String(identifier).toLowerCase() } ]
		});
		if (!user) return res.status(404).json({ error: 'User not found' });
		const membership = await Membership.findOneAndUpdate(
			{ user: user._id, club: clubId },
			{ $setOnInsert: { joinedAt: new Date() }, $set: { isActive: true, designation: designation || 'Member' } },
			{ new: true, upsert: true }
		);
		return res.status(201).json({ membership });
	} catch (e) {
		if (e.code === 11000) return res.status(409).json({ error: 'Already a member' });
		return res.status(500).json({ error: 'Server error' });
	}
});

// PATCH /api/admin/memberships/:id (update designation/isActive)
adminRouter.patch('/memberships/:id', requireAdmin, async (req, res) => {
	try {
		const { designation, isActive } = req.body;
		const update = {};
		if (designation !== undefined) update.designation = designation;
		if (isActive !== undefined) update.isActive = Boolean(isActive);
		const m = await Membership.findByIdAndUpdate(req.params.id, update, { new: true }).populate('user', 'name username avatarUrl');
		if (!m) return res.status(404).json({ error: 'Membership not found' });
		return res.json({ membership: m });
	} catch (e) {
		return res.status(500).json({ error: 'Server error' });
	}
});

// DELETE /api/admin/memberships/:id
adminRouter.delete('/memberships/:id', requireAdmin, async (req, res) => {
	try {
		await Membership.findByIdAndDelete(req.params.id);
		return res.json({ ok: true });
	} catch (e) {
		return res.status(500).json({ error: 'Server error' });
	}
});

// GET /api/admin/clubs/:id/gallery - get all gallery images for a club
adminRouter.get('/clubs/:id/gallery', requireAdmin, async (req, res) => {
	try {
		const clubId = req.params.id;
		const images = await GalleryImage.find({ club: clubId })
			.populate('uploadedBy', 'name username')
			.sort({ createdAt: -1 });
		
		return res.json({ images });
	} catch (e) {
		console.error('Error fetching gallery images:', e);
		return res.status(500).json({ error: 'Server error' });
	}
});

// POST /api/admin/clubs/:id/gallery - upload gallery photo
adminRouter.post('/clubs/:id/gallery', requireAdmin, upload.single('photo'), async (req, res) => {
	try {
		const clubId = req.params.id;
		if (!req.file) {
			return res.status(400).json({ error: 'No file uploaded' });
		}

		// Upload to Cloudinary
		const result = await cloudinary.uploader.upload(req.file.path, {
			folder: `club-gallery/${clubId}`,
			resource_type: 'auto'
		});

		// Delete temporary file
		fs.unlinkSync(req.file.path);

		const imageUrl = result.secure_url;
		const caption = req.body.caption || '';
		
		const galleryImage = new GalleryImage({
			club: clubId,
			uploadedBy: req.admin.sub === 'site_admin' ? null : req.admin.sub, // Skip for admin
			imageUrl,
			caption
		});
		
		await galleryImage.save();
		const populated = await galleryImage.populate('uploadedBy', 'name username');
		
		return res.status(201).json({ image: populated });
	} catch (e) {
		console.error('Error uploading gallery image:', e);
		// Delete temporary file if upload failed
		if (req.file) {
			fs.unlinkSync(req.file.path);
		}
		return res.status(500).json({ error: 'Server error' });
	}
});

// DELETE /api/admin/clubs/:id/gallery/:imageId - delete gallery photo
adminRouter.delete('/clubs/:id/gallery/:imageId', requireAdmin, async (req, res) => {
	try {
		const imageId = req.params.imageId;
		const image = await GalleryImage.findById(imageId);
		
		if (!image) {
			return res.status(404).json({ error: 'Image not found' });
		}

		// Delete from Cloudinary if it's a Cloudinary URL
		if (image.imageUrl.includes('cloudinary.com')) {
			const publicId = image.imageUrl.split('/').slice(-2).join('/').replace(/\.[^/.]+$/, '');
			await cloudinary.uploader.destroy(publicId);
		}

		// Delete from database
		await GalleryImage.findByIdAndDelete(imageId);
		
		return res.json({ ok: true });
	} catch (e) {
		console.error('Error deleting gallery image:', e);
		return res.status(500).json({ error: 'Server error' });
	}
});

// GET /api/admin/clubs/:id/alumni - get all alumni for a club
adminRouter.get('/clubs/:id/alumni', requireAdmin, async (req, res) => {
	try {
		const clubId = req.params.id;
		const alumni = await Alumni.find({ club: clubId }).sort({ 
			isFounder: -1, 
			yearGraduated: -1 
		});
		
		return res.json({ alumni });
	} catch (e) {
		console.error('Error fetching alumni:', e);
		return res.status(500).json({ error: 'Server error' });
	}
});

// POST /api/admin/clubs/:id/alumni - add alumni
adminRouter.post('/clubs/:id/alumni', requireAdmin, upload.single('photo'), async (req, res) => {
	try {
		const clubId = req.params.id;
		if (!req.file) {
			return res.status(400).json({ error: 'No file uploaded' });
		}

		// Upload to Cloudinary
		const result = await cloudinary.uploader.upload(req.file.path, {
			folder: `club-alumni/${clubId}`,
			resource_type: 'auto'
		});

		// Delete temporary file
		fs.unlinkSync(req.file.path);

		const { name, designation, yearGraduated, isFounder, bio } = req.body;
		
		const alumni = new Alumni({
			club: clubId,
			name,
			photoUrl: result.secure_url,
			designation: designation || '',
			yearGraduated: yearGraduated ? parseInt(yearGraduated) : null,
			isFounder: isFounder === 'true',
			bio: bio || ''
		});
		
		await alumni.save();
		
		return res.status(201).json({ alumni });
	} catch (e) {
		console.error('Error adding alumni:', e);
		if (req.file) {
			fs.unlinkSync(req.file.path);
		}
		return res.status(500).json({ error: 'Server error' });
	}
});

// DELETE /api/admin/clubs/:id/alumni/:alumniId - delete alumni
adminRouter.delete('/clubs/:id/alumni/:alumniId', requireAdmin, async (req, res) => {
	try {
		const alumniId = req.params.alumniId;
		const alumni = await Alumni.findById(alumniId);
		
		if (!alumni) {
			return res.status(404).json({ error: 'Alumni not found' });
		}

		// Delete from Cloudinary if it's a Cloudinary URL
		if (alumni.photoUrl.includes('cloudinary.com')) {
			const publicId = alumni.photoUrl.split('/').slice(-2).join('/').replace(/\.[^/.]+$/, '');
			await cloudinary.uploader.destroy(publicId);
		}

		await Alumni.findByIdAndDelete(alumniId);
		
		return res.json({ ok: true });
	} catch (e) {
		console.error('Error deleting alumni:', e);
		return res.status(500).json({ error: 'Server error' });
	}
});

// GET /api/admin/clubs/:id/hiring - get hiring status
adminRouter.get('/clubs/:id/hiring', requireAdmin, async (req, res) => {
	try {
		const clubId = req.params.id;
		let hiringStatus = await HiringStatus.findOne({ club: clubId });
		
		// Create if doesn't exist
		if (!hiringStatus) {
			hiringStatus = new HiringStatus({ club: clubId, isHiring: false });
			await hiringStatus.save();
		}
		
		return res.json({ hiringStatus });
	} catch (e) {
		console.error('Error fetching hiring status:', e);
		return res.status(500).json({ error: 'Server error' });
	}
});

// POST /api/admin/clubs/:id/hiring - start/update hiring
adminRouter.post('/clubs/:id/hiring', requireAdmin, async (req, res) => {
	try {
		const clubId = req.params.id;
		const { isHiring, hiringDeadline, hiringDescription } = req.body;
		
		const hiringStatus = await HiringStatus.findOneAndUpdate(
			{ club: clubId },
			{ 
				isHiring: isHiring === true || isHiring === 'true',
				hiringDeadline: hiringDeadline ? new Date(hiringDeadline) : null,
				hiringDescription: hiringDescription || ''
			},
			{ new: true, upsert: true }
		);
		
		// When hiring starts again for the first time (not just updating), clear previous rejections
		// This allows users who were rejected to reapply
		if (isHiring === true || isHiring === 'true') {
			// Check if this is the first time starting hiring (was not hiring before)
			const wasHiringBefore = await HiringStatus.findOne({ club: clubId, isHiring: true });
			
			if (!wasHiringBefore) {
				// If not hiring before and now starting, reset only rejected applications to allow reapplication
				await Application.updateMany(
					{ club: clubId, status: 'rejected' },
					{ status: 'pending', rejectionMessage: '' }
				);
			}
		}
		
		return res.json({ hiringStatus });
	} catch (e) {
		console.error('Error updating hiring status:', e);
		return res.status(500).json({ error: 'Server error' });
	}
});

// GET /api/admin/clubs/:id/applications - get all applications for a club
adminRouter.get('/clubs/:id/applications', requireAdmin, async (req, res) => {
	try {
		const clubId = req.params.id;
		const applications = await Application.find({ club: clubId })
			.populate('user', 'name username email avatarUrl')
			.sort({ appliedAt: -1 });
		
		return res.json({ applications });
	} catch (e) {
		console.error('Error fetching applications:', e);
		return res.status(500).json({ error: 'Server error' });
	}
});

// PATCH /api/admin/applications/:id - update application status
adminRouter.patch('/applications/:id', requireAdmin, async (req, res) => {
	try {
		const { status, designation } = req.body;
		
	if (status === 'rejected') {
		const application = await Application.findByIdAndUpdate(
			req.params.id,
			{ 
				status: 'rejected',
				rejectionMessage: req.body.rejectionMessage || ''
			},
			{ new: true }
		);
		
		if (!application) {
			return res.status(404).json({ error: 'Application not found' });
		}
		
		return res.json({ application });
	}
		
		if (status === 'approved') {
			const application = await Application.findById(req.params.id)
				.populate('user', '_id')
				.populate('club', '_id');
			
			if (!application) {
				return res.status(404).json({ error: 'Application not found' });
			}
			
			// Check if user is already a member
			const existingMembership = await Membership.findOne({
				club: application.club._id,
				user: application.user._id,
				isActive: true
			});
			
			if (existingMembership) {
				return res.status(400).json({ error: 'User is already a member of this club' });
			}
			
			// Create membership
			const membership = new Membership({
				club: application.club._id,
				user: application.user._id,
				designation: designation || 'Member',
				isActive: true
			});
			
			await membership.save();
			
			// Update application status
			application.status = 'approved';
			await application.save();
			
			return res.json({ application, membership });
		}
		
		return res.status(400).json({ error: 'Invalid status' });
	} catch (e) {
		console.error('Error updating application:', e);
		return res.status(500).json({ error: 'Server error' });
	}
});

module.exports = { adminRouter };


