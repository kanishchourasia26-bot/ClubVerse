const express = require('express');
const { Club, Membership, User, GalleryImage, Alumni, HiringStatus } = require('../../models');
const { requireAuth } = require('./utils');

const clubsRouter = express.Router();

// GET /api/clubs - get all active clubs with member count
clubsRouter.get('/', requireAuth, async (req, res) => {
    try {
        const clubs = await Club.find({ isActive: true }).select('name slug description category coverImageUrl');
		
		// Get member count for each club
		const clubsWithMembers = await Promise.all(
			clubs.map(async (club) => {
				const memberCount = await Membership.countDocuments({ club: club._id, isActive: true });
				return {
					id: club._id,
					name: club.name,
					slug: club.slug,
					description: club.description,
					category: club.category,
					coverImageUrl: club.coverImageUrl || '',
					memberCount
				};
			})
		);
		
		return res.json({ clubs: clubsWithMembers });
	} catch (e) {
		return res.status(500).json({ error: 'Server error' });
	}
});

// GET /api/clubs/:slug - get specific club details with member count
clubsRouter.get('/:slug', requireAuth, async (req, res) => {
	try {
		const slug = String(req.params.slug).toLowerCase();
		const club = await Club.findOne({ slug, isActive: true }).select('name slug description category coverImageUrl links');
		if (!club) return res.status(404).json({ error: 'Club not found' });
		
		const memberCount = await Membership.countDocuments({ club: club._id, isActive: true });
		
		return res.json({ 
			club: {
				id: club._id,
				name: club.name,
				slug: club.slug,
				description: club.description,
				category: club.category,
				coverImageUrl: club.coverImageUrl || '',
				links: club.links || {},
				memberCount
			}
		});
	} catch (e) {
		return res.status(500).json({ error: 'Server error' });
	}
});

// GET /api/clubs/:slug/members - list members sorted by rank
clubsRouter.get('/:slug/members', requireAuth, async (req, res) => {
	try {
		const slug = String(req.params.slug).toLowerCase();
		const club = await Club.findOne({ slug, isActive: true }).select('_id');
		if (!club) return res.status(404).json({ error: 'Club not found' });
		const memberships = await Membership.find({ club: club._id, isActive: true })
			.sort({ rank: -1, joinedAt: 1 })
			.populate('user', 'name username avatarUrl');
		return res.json({
			members: memberships.map(m => ({
				id: m._id,
				user: { id: m.user._id, name: m.user.name, username: m.user.username, avatarUrl: m.user.avatarUrl || '' },
				designation: m.designation || '',
				rank: m.rank
			}))
		});
	} catch (e) {
		return res.status(500).json({ error: 'Server error' });
	}
});

// GET /api/clubs/:id/gallery - get gallery images for a club (public)
clubsRouter.get('/:id/gallery', async (req, res) => {
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

// GET /api/clubs/:id/alumni - get alumni for a club (public)
clubsRouter.get('/:id/alumni', async (req, res) => {
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

// GET /api/clubs/:id/hiring - get hiring status (public)
clubsRouter.get('/:id/hiring', async (req, res) => {
	try {
		const clubId = req.params.id;
		const hiringStatus = await HiringStatus.findOne({ club: clubId });
		
		return res.json({ hiringStatus: hiringStatus || { isHiring: false } });
	} catch (e) {
		console.error('Error fetching hiring status:', e);
		return res.status(500).json({ error: 'Server error' });
	}
});

module.exports = { clubsRouter };
