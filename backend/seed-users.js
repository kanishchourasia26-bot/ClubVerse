const mongoose = require('mongoose');
const { User } = require('./models');

const MONGODB_URI = process.env.MONGO_URI;

async function seedUsers() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing users (except the temp manager)
        await User.deleteMany({ username: { $ne: 'temp_manager' } });
        console.log('Cleared existing users');

        // Create demo users
        const demoUsers = [
            {
                name: 'Alice Johnson',
                username: 'alice_j',
                email: 'alice@example.com',
                passwordHash: 'password123',
                studentId: 'STU001',
                bio: 'Music enthusiast and dance lover. Always ready for new adventures!',
                skills: ['Singing', 'Dancing', 'Guitar'],
                socials: {
                    instagram: 'alice_music',
                    linkedin: 'alice-johnson-music'
                }
            },
            {
                name: 'Bob Smith',
                username: 'bob_smith',
                email: 'bob@example.com',
                passwordHash: 'password123',
                studentId: 'STU002',
                bio: 'Photography is my passion. Capturing moments that last forever.',
                skills: ['Photography', 'Photo Editing', 'Videography'],
                socials: {
                    instagram: 'bob_photography',
                    linkedin: 'bob-smith-photo'
                }
            },
            {
                name: 'Carol Davis',
                username: 'carol_d',
                email: 'carol@example.com',
                passwordHash: 'password123',
                studentId: 'STU003',
                bio: 'Theater and drama enthusiast. Love bringing characters to life.',
                skills: ['Acting', 'Script Writing', 'Direction'],
                socials: {
                    instagram: 'carol_theater',
                    linkedin: 'carol-davis-acting'
                }
            },
            {
                name: 'David Wilson',
                username: 'david_w',
                email: 'david@example.com',
                passwordHash: 'password123',
                studentId: 'STU004',
                bio: 'Fitness and wellness advocate. Helping others achieve their goals.',
                skills: ['Fitness Training', 'Nutrition', 'Motivation'],
                socials: {
                    instagram: 'david_fitness',
                    linkedin: 'david-wilson-fitness'
                }
            },
            {
                name: 'Emma Brown',
                username: 'emma_brown',
                email: 'emma@example.com',
                passwordHash: 'password123',
                studentId: 'STU005',
                bio: 'Writer and poet. Words are my canvas, stories are my art.',
                skills: ['Creative Writing', 'Poetry', 'Editing'],
                socials: {
                    instagram: 'emma_writes',
                    linkedin: 'emma-brown-writing'
                }
            },
            {
                name: 'Frank Miller',
                username: 'frank_m',
                email: 'frank@example.com',
                passwordHash: 'password123',
                studentId: 'STU006',
                bio: 'Multi-talented artist. Music, dance, and drama - I do it all!',
                skills: ['Piano', 'Dancing', 'Acting'],
                socials: {
                    instagram: 'frank_arts',
                    linkedin: 'frank-miller-arts'
                }
            },
            {
                name: 'Grace Lee',
                username: 'grace_l',
                email: 'grace@example.com',
                passwordHash: 'password123',
                studentId: 'STU007',
                bio: 'Photography and fitness enthusiast. Balance is key to life.',
                skills: ['Photography', 'Yoga', 'Fitness'],
                socials: {
                    instagram: 'grace_balance',
                    linkedin: 'grace-lee-wellness'
                }
            },
            {
                name: 'Henry Taylor',
                username: 'henry_t',
                email: 'henry@example.com',
                passwordHash: 'password123',
                studentId: 'STU008',
                bio: 'Writer and fitness coach. Strong body, strong mind, strong words.',
                skills: ['Writing', 'Fitness', 'Leadership'],
                socials: {
                    instagram: 'henry_strong',
                    linkedin: 'henry-taylor-leadership'
                }
            }
        ];

        const createdUsers = await User.insertMany(demoUsers);
        console.log(`Created ${createdUsers.length} demo users`);

        console.log('Demo users created successfully!');
        console.log('You can now login with any of these accounts:');
        createdUsers.forEach(user => {
            console.log(`- ${user.name} (@${user.username}) - ${user.email}`);
        });

    } catch (error) {
        console.error('Error seeding users:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

seedUsers();
