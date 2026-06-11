const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const path = require('path');
const fs = require('fs');
const { authRouter } = require('./src/routes/auth');
const { usersRouter } = require('./src/routes/users');
const { clubsRouter } = require('./src/routes/clubs');
const { adminRouter } = require('./src/routes/admin');
const { eventsRouter } = require('./src/routes/events');
const { eventRegistrationsRouter } = require('./src/routes/eventRegistrations');
const { applicationsRouter } = require('./src/routes/applications');
// Import email utility to trigger startup verification
const { testEmailConnection, sendVerificationEmail } = require('./src/utils/email');
const { User } = require('./models');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;
mongoose
	.connect(MONGO_URI)
	.then(() => console.log('MongoDB connected'))
	.catch((err) => {
		console.error('MongoDB connection error', err);
		process.exit(1);
	});

app.get('/health', (req, res) => {
	res.json({ ok: true });
});

// Test email configuration endpoint
app.get('/api/test-email', async (req, res) => {
	try {
		const testResult = await testEmailConnection();
		if (testResult) {
			res.json({ success: true, message: 'Email service is configured correctly' });
		} else {
			res.status(500).json({ success: false, message: 'Email service configuration error' });
		}
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/clubs', clubsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/events', eventsRouter);
app.use('/api/events', eventRegistrationsRouter);
app.use('/api/applications', applicationsRouter);

// Static uploads path
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', express.static(uploadsDir));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// Note: No cleanup job needed - users are only created after OTP verification


