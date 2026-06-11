const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { User, Club, Membership } = require('./models');

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

async function ensureUser(username, name, email) {
    const existing = await User.findOne({ username });
    if (existing) return existing;
    return await User.create({
        name,
        username,
        email,
        passwordHash: 'temp_password',
        isActive: true
    });
}

async function ensureClub({ name, slug, category, description, managerUser }) {
    const existing = await Club.findOne({ slug });
    if (existing) return existing;
    return await Club.create({
        name,
        slug,
        description,
        category,
        managerUser,
        coverImageUrl: '',
        links: { instagram: '', twitter: '', youtube: '', website: '' },
        isActive: true
    });
}

async function seed() {
    try {
        // Note: We don't delete existing clubs to preserve members, alumni, events, etc.
        // The ensureClub function will only create clubs if they don't exist (based on slug)
        console.log('Ensuring clubs exist...');

        // Create managers for each club
        const sargamMgr = await ensureUser('sargam_manager', 'SARGAM Manager', 'sargam@college.com');
        const aaveshMgr = await ensureUser('aavesh_manager', 'AAVESH Manager', 'aavesh@college.com');
        const picxcelMgr = await ensureUser('picxcel_manager', 'PICXCEL Manager', 'picxcel@college.com');
        const zenithMgr = await ensureUser('zenith_manager', 'ZENITH Manager', 'zenith@college.com');
        const eicMgr = await ensureUser('eic_manager', 'EIC Manager', 'eic@college.com');
        const epmocMgr = await ensureUser('epmoc_manager', 'EPMOC Manager', 'epmoc@college.com');
        const forceMgr = await ensureUser('force_manager', 'FORCE Manager', 'force@college.com');

        // Create all clubs
        await ensureClub({
            name: 'SARGAM',
            slug: 'sargam',
            category: 'Arts & Culture',
            description: 'Music and Dance club dedicated to promoting artistic expression through music and dance. Join us to explore your creative side!',
            managerUser: sargamMgr._id
        });

        await ensureClub({
            name: 'AAVESH',
            slug: 'aavesh',
            category: 'Electronics',
            description: 'Electronics club focused on hardware, embedded systems, IoT, and electronic circuit design. Build innovative projects and expand your technical skills!',
            managerUser: aaveshMgr._id
        });

        await ensureClub({
            name: 'PICXCEL',
            slug: 'picxcel',
            category: 'Photography',
            description: 'Photography club for capturing moments, learning camera techniques, and expressing creativity through visual storytelling. Perfect your photography skills!',
            managerUser: picxcelMgr._id
        });

        await ensureClub({
            name: 'ZENITH',
            slug: 'zenith',
            category: 'Sports',
            description: 'Sports club promoting physical fitness, teamwork, and competitive spirit. Join us for various sports activities and represent the college!',
            managerUser: zenithMgr._id
        });

        await ensureClub({
            name: 'EIC',
            slug: 'eic',
            category: 'Entrepreneurship',
            description: 'Entrepreneurship and Innovation Club fostering business ideas, startup culture, and entrepreneurial mindset. Turn your ideas into reality!',
            managerUser: eicMgr._id
        });

        await ensureClub({
            name: 'EPMOC',
            slug: 'epmoc',
            category: 'Event Management',
            description: 'Event Management club organizing college events, managing logistics, and creating memorable experiences. Develop your organizational and leadership skills!',
            managerUser: epmocMgr._id
        });

        await ensureClub({
            name: 'FORCE',
            slug: 'force',
            category: 'Coding',
            description: 'Coding club for programming enthusiasts. Learn new technologies, participate in hackathons, build projects, and collaborate on open-source!',
            managerUser: forceMgr._id
        });

        console.log('Seed complete: All clubs ensured');
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seed();
