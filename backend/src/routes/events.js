const express = require('express');
const { Event, Club, User } = require('../../models');
const { requireAuth, requireAdmin } = require('./utils');

const eventsRouter = express.Router();

// GET /api/events - get all events (public)
eventsRouter.get('/', async (req, res) => {
	try {
		const events = await Event.find({ isOpen: true })
			.populate('club', 'name slug')
			.populate('createdBy', 'name username')
			.sort({ startAt: 1 });
		
		return res.json({ events });
	} catch (e) {
		return res.status(500).json({ error: 'Server error' });
	}
});

// GET /api/events/:id - get specific event
eventsRouter.get('/:id', async (req, res) => {
	try {
		const event = await Event.findById(req.params.id)
			.populate('club', 'name slug')
			.populate('createdBy', 'name username');
		
		if (!event) return res.status(404).json({ error: 'Event not found' });
		return res.json({ event });
	} catch (e) {
		return res.status(500).json({ error: 'Server error' });
	}
});

// GET /api/events/club/:clubId - get events for specific club
eventsRouter.get('/club/:clubId', async (req, res) => {
	try {
		const events = await Event.find({ 
			club: req.params.clubId, 
			isOpen: true 
		})
			.populate('createdBy', 'name username')
			.sort({ startAt: 1 });
		
		return res.json({ events });
	} catch (e) {
		return res.status(500).json({ error: 'Server error' });
	}
});

// POST /api/events - create event (admin only)
eventsRouter.post('/', requireAdmin, async (req, res) => {
	try {
		console.log('Event creation request received:', req.body);
		const { 
			clubId, 
			title, 
			description, 
			notice, 
			location, 
			startAt, 
			endAt, 
			registrationDeadline 
		} = req.body;
		
		// Validate required fields
		if (!clubId || !title || !startAt || !registrationDeadline) {
			return res.status(400).json({ error: 'Missing required fields' });
		}
		
		// Validate dates
		const startDate = new Date(startAt);
		const regDeadline = new Date(registrationDeadline);
		const endDate = endAt ? new Date(endAt) : null;
		
		if (regDeadline >= startDate) {
			return res.status(400).json({ error: 'Registration deadline must be before event start date' });
		}
		
		if (endDate && endDate <= startDate) {
			return res.status(400).json({ error: 'Event end date must be after start date' });
		}
		
		// Verify club exists
		console.log('Looking for club with ID:', clubId);
		const club = await Club.findById(clubId);
		if (!club) {
			console.log('Club not found for ID:', clubId);
			return res.status(404).json({ error: 'Club not found' });
		}
		console.log('Club found:', club.name);
		
		const eventData = {
			club: clubId,
			title,
			description: description || '',
			notice: notice || '',
			location: location || '',
			startAt: startDate,
			endAt: endDate,
			registrationDeadline: regDeadline
		};
		
		// Only set createdBy if it's a valid ObjectId (not 'site_admin')
		const mongoose = require('mongoose');
		if (req.admin.sub && mongoose.Types.ObjectId.isValid(req.admin.sub)) {
			eventData.createdBy = req.admin.sub;
		}
		
		console.log('Creating event with data:', eventData);
		
		const event = new Event(eventData);
		
		await event.save();
		console.log('Event saved successfully:', event._id);
		
		await event.populate('club', 'name slug');
		await event.populate('createdBy', 'name username');
		
		console.log('Event populated successfully');
		return res.status(201).json({ event });
	} catch (e) {
		console.error('Error creating event:', e);
		return res.status(500).json({ error: 'Server error: ' + e.message });
	}
});

// PUT /api/events/:id - update event (admin only)
eventsRouter.put('/:id', requireAdmin, async (req, res) => {
	try {
		const { 
			title, 
			description, 
			notice, 
			location, 
			startAt, 
			endAt, 
			registrationDeadline,
			isOpen 
		} = req.body;
		
		const event = await Event.findById(req.params.id);
		if (!event) return res.status(404).json({ error: 'Event not found' });
		
		// Update fields
		if (title !== undefined) event.title = title;
		if (description !== undefined) event.description = description;
		if (notice !== undefined) event.notice = notice;
		if (location !== undefined) event.location = location;
		if (startAt !== undefined) event.startAt = new Date(startAt);
		if (endAt !== undefined) event.endAt = endAt ? new Date(endAt) : null;
		if (registrationDeadline !== undefined) event.registrationDeadline = new Date(registrationDeadline);
		if (isOpen !== undefined) event.isOpen = isOpen;
		
		await event.save();
		await event.populate('club', 'name slug');
		await event.populate('createdBy', 'name username');
		
		return res.json({ event });
	} catch (e) {
		return res.status(500).json({ error: 'Server error' });
	}
});

// DELETE /api/events/:id - delete event (admin only)
eventsRouter.delete('/:id', requireAdmin, async (req, res) => {
	try {
		const event = await Event.findByIdAndDelete(req.params.id);
		if (!event) return res.status(404).json({ error: 'Event not found' });
		return res.json({ message: 'Event deleted successfully' });
	} catch (e) {
		return res.status(500).json({ error: 'Server error' });
	}
});

module.exports = { eventsRouter };
