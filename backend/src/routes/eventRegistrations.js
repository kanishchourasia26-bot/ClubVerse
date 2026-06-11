const express = require('express');
const { Event, EventRegistration, User } = require('../../models');
const { requireAuth } = require('./utils');

const eventRegistrationsRouter = express.Router();

// GET /api/events/user/registrations - get all registrations for the current user
// MUST BE BEFORE :eventId routes to avoid catching "user" as eventId
eventRegistrationsRouter.get('/user/registrations', requireAuth, async (req, res) => {
	try {
		console.log('Fetching user registrations for user:', req.user);
		
		// Try to get userId from different possible fields
		const userId = req.user.sub || req.user._id || req.user.userId;
		console.log('User ID (sub):', req.user.sub);
		console.log('User ID (_id):', req.user._id);
		console.log('User ID (userId):', req.user.userId);
		console.log('User ID extracted:', userId);
		
		if (!userId) {
			console.error('No user ID found in req.user:', req.user);
			return res.status(400).json({ error: 'Unable to determine user ID' });
		}

		const registrations = await EventRegistration.find({ user: userId })
			.populate('event', 'title description startAt endAt club registrationDeadline')
			.populate({ path: 'event', populate: { path: 'club', select: 'name slug' } })
			.sort({ registeredAt: -1 });

		console.log('Found registrations:', registrations.length);
		return res.json({ registrations });
	} catch (e) {
		console.error('Error fetching user registrations:', e);
		return res.status(500).json({ error: 'Server error: ' + e.message });
	}
});

// POST /api/events/:eventId/register - register for an event (authenticated users only)
eventRegistrationsRouter.post('/:eventId/register', requireAuth, async (req, res) => {
	try {
		const { eventId } = req.params;
		const userId = req.user.sub;

		// Check if event exists and is still open for registration
		const event = await Event.findById(eventId);
		if (!event) {
			return res.status(404).json({ error: 'Event not found' });
		}

		if (!event.isOpen) {
			return res.status(400).json({ error: 'Event is not open for registration' });
		}

		const now = new Date();
		if (now > new Date(event.registrationDeadline)) {
			return res.status(400).json({ error: 'Registration deadline has passed' });
		}

		// Check if user is already registered
		const existingRegistration = await EventRegistration.findOne({
			event: eventId,
			user: userId
		});

		if (existingRegistration) {
			return res.status(400).json({ error: 'You are already registered for this event' });
		}

		// Create new registration
		const registration = new EventRegistration({
			event: eventId,
			user: userId
		});

		await registration.save();
		await registration.populate('user', 'name username email');
		await registration.populate('event', 'title club');

		return res.status(201).json({ registration });
	} catch (e) {
		console.error('Error registering for event:', e);
		return res.status(500).json({ error: 'Server error: ' + e.message });
	}
});

// GET /api/events/:eventId/registrations - get all registrations for an event
eventRegistrationsRouter.get('/:eventId/registrations', requireAuth, async (req, res) => {
	try {
		const { eventId } = req.params;

		const registrations = await EventRegistration.find({ event: eventId })
			.populate('user', 'name username email')
			.sort({ registeredAt: -1 });

		return res.json({ registrations });
	} catch (e) {
		console.error('Error fetching registrations:', e);
		return res.status(500).json({ error: 'Server error' });
	}
});

// DELETE /api/events/:eventId/register - unregister from an event
eventRegistrationsRouter.delete('/:eventId/register', requireAuth, async (req, res) => {
	try {
		const { eventId } = req.params;
		const userId = req.user.sub;

		const registration = await EventRegistration.findOneAndDelete({
			event: eventId,
			user: userId
		});

		if (!registration) {
			return res.status(404).json({ error: 'Registration not found' });
		}

		return res.json({ message: 'Successfully unregistered from event' });
	} catch (e) {
		console.error('Error unregistering from event:', e);
		return res.status(500).json({ error: 'Server error' });
	}
});

module.exports = { eventRegistrationsRouter };

