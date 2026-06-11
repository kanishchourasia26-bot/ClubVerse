const express = require('express');
const { Application } = require('../../models');
const { requireAuth } = require('./utils');

const applicationsRouter = express.Router();

// POST /api/applications - apply to a club
applicationsRouter.post('/', requireAuth, async (req, res) => {
	try {
		const { clubId } = req.body;
		const userId = req.user.sub;

		if (!clubId) {
			return res.status(400).json({ error: 'Club ID required' });
		}

		// Check if already applied
		const existingApplication = await Application.findOne({
			club: clubId,
			user: userId
		});

		if (existingApplication) {
			return res.status(400).json({ error: 'You have already applied to this club' });
		}

		// Create application
		const application = new Application({
			club: clubId,
			user: userId,
			status: 'pending'
		});

		await application.save();

		return res.status(201).json({ application });
	} catch (e) {
		console.error('Error creating application:', e);
		return res.status(500).json({ error: 'Server error' });
	}
});

// GET /api/applications/me - get user's applications
applicationsRouter.get('/me', requireAuth, async (req, res) => {
	try {
		const userId = req.user.sub;

		const applications = await Application.find({ user: userId })
			.populate('club', 'name slug');

		return res.json({ applications });
	} catch (e) {
		console.error('Error fetching applications:', e);
		return res.status(500).json({ error: 'Server error' });
	}
});

// GET /api/applications/club/:clubId - check if user has applied
applicationsRouter.get('/club/:clubId', requireAuth, async (req, res) => {
	try {
		const userId = req.user.sub;
		const { clubId } = req.params;

		const application = await Application.findOne({
			club: clubId,
			user: userId
		});

		return res.json({ hasApplied: !!application, application });
	} catch (e) {
		console.error('Error checking application:', e);
		return res.status(500).json({ error: 'Server error' });
	}
});

// DELETE /api/applications/club/:clubId - delete user's own application
applicationsRouter.delete('/club/:clubId', requireAuth, async (req, res) => {
	try {
		const userId = req.user.sub;
		const { clubId } = req.params;

		const application = await Application.findOneAndDelete({
			club: clubId,
			user: userId
		});

		if (!application) {
			return res.status(404).json({ error: 'Application not found' });
		}

		return res.json({ message: 'Application deleted successfully' });
	} catch (e) {
		console.error('Error deleting application:', e);
		return res.status(500).json({ error: 'Server error' });
	}
});

module.exports = { applicationsRouter };


