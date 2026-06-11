const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Club } = require('./models');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
	.then(() => console.log('MongoDB connected'))
	.catch((err) => {
		console.error('MongoDB connection error', err);
		process.exit(1);
	});

async function checkClubs() {
	try {
		const allClubs = await Club.find({});
		console.log('All clubs in database:', allClubs.length);
		allClubs.forEach(club => {
			console.log(`- ${club.name} (${club.slug}) - Active: ${club.isActive}`);
		});
		
		const activeClubs = await Club.find({ isActive: true });
		console.log('\nActive clubs:', activeClubs.length);
		
		process.exit(0);
	} catch (error) {
		console.error('Error:', error);
		process.exit(1);
	}
}

checkClubs();
