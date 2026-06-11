const express = require('express');
const { User, Membership, Club } = require('../../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { requireAuth } = require('./utils');

const usersRouter = express.Router();

// Multer storage for avatars
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const dir = path.join(__dirname, '../../uploads/avatars');
		fs.mkdirSync(dir, { recursive: true });
		cb(null, dir);
	},
	filename: function (req, file, cb) {
		const ext = path.extname(file.originalname) || '.jpg';
		cb(null, `${req.user.sub}-${Date.now()}${ext}`);
	}
});
const upload = multer({ storage });

// GET /api/users/search?q= - search by username prefix (top 10)
usersRouter.get('/search', requireAuth, async (req, res) => {
	try {
		const q = String(req.query.q || '').trim().toLowerCase();
		if (!q) return res.json({ users: [] });
		const regex = new RegExp('^' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
		const users = await User.find({ username: { $regex: regex } })
			.select('name username email avatarUrl')
			.limit(10);
		return res.json({ users: users.map(u => ({ id: u._id, name: u.name, username: u.username, email: u.email, avatarUrl: u.avatarUrl || '' })) });
	} catch (e) {
		return res.status(500).json({ error: 'Server error' });
	}
});

// GET /api/users/:username - public/basic profile (auth required in this app)
usersRouter.get('/:username', requireAuth, async (req, res) => {
	try {
		const username = String(req.params.username).toLowerCase();
		const user = await User.findOne({ username }).select('name username email bio skills socials avatarUrl');
		if (!user) return res.status(404).json({ error: 'User not found' });
		return res.json({ user: { id: user._id, name: user.name, username: user.username, email: user.email, bio: user.bio || '', skills: user.skills || [], socials: user.socials || {}, avatarUrl: user.avatarUrl || '' } });
	} catch (e) {
		return res.status(500).json({ error: 'Server error' });
	}
});

// GET /api/users/:username/clubs - get clubs user is enrolled in
usersRouter.get('/:username/clubs', requireAuth, async (req, res) => {
	try {
		const username = String(req.params.username).toLowerCase();
		const user = await User.findOne({ username }).select('_id');
		if (!user) return res.status(404).json({ error: 'User not found' });
		
		const memberships = await Membership.find({ user: user._id, isActive: true })
			.populate('club', 'name slug description category')
			.sort({ designation: 1, joinedAt: 1 });
		
		const clubs = memberships.map(m => ({
			id: m.club._id,
			name: m.club.name,
			slug: m.club.slug,
			description: m.club.description,
			category: m.club.category,
			designation: m.designation,
			joinedAt: m.joinedAt
		}));
		
		return res.json({ clubs });
	} catch (e) {
		return res.status(500).json({ error: 'Server error' });
	}
});

// GET /api/users/me/memberships - get current user's memberships
usersRouter.get('/me/memberships', requireAuth, async (req, res) => {
	try {
		const userId = req.user.sub;
		const memberships = await Membership.find({ user: userId, isActive: true })
			.populate('club', 'name slug description category')
			.sort({ joinedAt: -1 });
		
		return res.json({ memberships });
	} catch (e) {
		return res.status(500).json({ error: 'Server error' });
	}
});

// PUT /api/users/me - update own profile (bio, skills, socials)
usersRouter.put('/me', requireAuth, async (req, res) => {
	try {
		const { bio, skills, socials } = req.body;
		if (bio) {
			const wordCount = String(bio).trim().split(/\s+/).filter(Boolean).length;
			if (wordCount > 50) {
				return res.status(400).json({ error: 'Bio must be 50 words or fewer' });
			}
		}
		const update = {};
		if (bio !== undefined) update.bio = bio;
		if (Array.isArray(skills)) update.skills = skills.filter((s) => typeof s === 'string' && s.trim()).map((s) => s.trim());
		if (socials && typeof socials === 'object') {
			update.socials = {};
			if (socials.instagram !== undefined) update.socials.instagram = socials.instagram;
			if (socials.linkedin !== undefined) update.socials.linkedin = socials.linkedin;
		}
		const user = await User.findByIdAndUpdate(req.user.sub, update, { new: true });
		if (!user) return res.status(404).json({ error: 'User not found' });
		return res.json({ user: { id: user._id, name: user.name, username: user.username, email: user.email, bio: user.bio || '', skills: user.skills || [], socials: user.socials || {}, avatarUrl: user.avatarUrl || '' } });
	} catch (e) {
		return res.status(500).json({ error: 'Server error' });
	}
});

// POST /api/users/me/avatar - upload avatar
usersRouter.post('/me/avatar', requireAuth, upload.single('avatar'), async (req, res) => {
	try {
		if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
		const relativePath = `uploads/avatars/${req.file.filename}`;
		const user = await User.findByIdAndUpdate(req.user.sub, { avatarUrl: `/${relativePath}` }, { new: true });
		if (!user) return res.status(404).json({ error: 'User not found' });
		return res.json({ avatarUrl: user.avatarUrl });
	} catch (e) {
		return res.status(500).json({ error: 'Server error' });
	}
});

module.exports = { usersRouter };


