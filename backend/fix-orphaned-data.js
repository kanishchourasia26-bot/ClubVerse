const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Club, Membership, Alumni, Event, GalleryImage, Application, HiringStatus, EventRegistration } = require('./models');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
	.then(() => console.log('MongoDB connected'))
	.catch((err) => {
		console.error('MongoDB connection error', err);
		process.exit(1);
	});

async function fixOrphanedData() {
	try {
		console.log('🔍 Checking for orphaned records...\n');
		
		// Get current clubs by slug
		const clubs = await Club.find({});
		const clubMap = new Map();
		clubs.forEach(club => clubMap.set(club.slug, club._id.toString()));
		
		console.log('Current clubs:', Array.from(clubMap.keys()).join(', '));
		
		// Get all club IDs
		const validClubIds = clubs.map(c => c._id);
		
		// Find orphaned records (records that reference non-existent clubs)
		console.log('\n📊 Checking collections capacity...\n');
		
		// 1. Memberships
		const allMemberships = await Membership.find({});
		const orphanedMemberships = allMemberships.filter(m => !validClubIds.some(id => id.equals(m.club)));
		console.log(`Memberships: ${orphanedMemberships.length} orphaned out of ${allMemberships.length} total`);
		
		// 2. Alumni
		const allAlumni = await Alumni.find({});
		const orphanedAlumni = allAlumni.filter(a => !validClubIds.some(id => id.equals(a.club)));
		console.log(`Alumni: ${orphanedAlumni.length} orphaned out of ${allAlumni.length} total`);
		
		// 3. Events
		const allEvents = await Event.find({});
		const orphanedEvents = allEvents.filter(e => !validClubIds.some(id => id.equals(e.club)));
		console.log(`Events: ${orphanedEvents.length} orphaned out of ${allEvents.length} total`);
		
		// 4. Gallery Images
		const allImages = await GalleryImage.find({});
		const orphanedImages = allImages.filter(img => !validClubIds.some(id => id.equals(img.club)));
		console.log(`Gallery Images: ${orphanedImages.length} orphaned out of ${allImages.length} total`);
		
		// 5. Applications
		const allApplications = await Application.find({});
		const orphanedApplications = allApplications.filter(app => !validClubIds.some(id => id.equals(app.club)));
		console.log(`Applications: ${orphanedApplications.length} orphaned out of ${allApplications.length} total`);
		
		// 6. HiringStatus
		const allHiringStatus = await HiringStatus.find({});
		const orphanedHiringStatus = allHiringStatus.filter(h => !validClubIds.some(id => id.equals(h.club)));
		console.log(`HiringStatus: ${orphanedHiringStatus.length} orphaned out of ${allHiringStatus.length} total`);
		
		const totalOrphaned = orphanedMemberships.length + orphanedAlumni.length + orphanedEvents.length + 
		                      orphanedImages.length + orphanedApplications.length + orphanedHiringStatus.length;
		
		if (totalOrphaned === 0) {
			console.log('\n✅ No orphaned records found! All data is intact.');
			process.exit(0);
		}
		
		console.log(`\n⚠️  Found ${totalOrphaned} orphaned records total.`);
		
		// Try to fix SARGAM records if they exist
		const sargamClub = await Club.findOne({ slug: 'sargam' });
		if (sargamClub && totalOrphaned > 0) {
			console.log(`\n🔧 Attempting to fix orphaned SARGAM records...`);
			let fixed = 0;
			
			// Fix memberships
			if (orphanedMemberships.length > 0) {
				const result = await Membership.updateMany(
					{ club: { $nin: validClubIds } },
					{ $set: { club: sargamClub._id } }
				);
				console.log(`   Fixed ${result.modifiedCount} memberships`);
				fixed += result.modifiedCount;
			}
			
			// Fix alumni
			if (orphanedAlumni.length > 0) {
				const result = await Alumni.updateMany(
					{ club: { $nin: validClubIds } },
					{ $set: { club: sargamClub._id } }
				);
				console.log(`   Fixed ${result.modifiedCount} alumni records`);
				fixed += result.modifiedCount;
			}
			
			// Fix events
			if (orphanedEvents.length > 0) {
				const result = await Event.updateMany(
						{ club: { $nin: validClubIds } },
					{ $set: { club: sargamClub._id } }
				);
				console.log(`   Fixed ${result.modifiedCount} events`);
				fixed += result.modifiedCount;
			}
			
			// Fix gallery images
			if (orphanedImages.length > 0) {
				const result = await GalleryImage.updateMany(
					{ club: { $nin: validClubIds } },
					{ $set: { club: sargamClub._id } }
				);
				console.log(`   Fixed ${result.modifiedCount} gallery images`);
				fixed += result.modifiedCount;
			}
			
			// Fix applications
			if (orphanedApplications.length > 0) {
				const result = await Application.updateMany(
					{ club: { $nin: validClubIds } },
					{ $set: { club: sargamClub._id } }
				);
				console.log(`   Fixed ${result.modifiedCount} applications`);
				fixed += result.modifiedCount;
			}
			
			// Fix hiring status
			if (orphanedHiringStatus.length > 0) {
				const result = await HiringStatus.updateMany(
					{ club: { $nin: validClubIds } },
					{ $set: { club: sargamClub._id } }
				);
				console.log(`   Fixed ${result.modifiedCount} hiring status records`);
				fixed += result.modifiedCount;
			}
			
			console.log(`\n✅ Successfully fixed ${fixed} orphaned records!`);
		} else {
			console.log('\n⚠️  Cannot auto-fix: SARGAM club not found or no orphaned records.');
			console.log('You may need to manually update the club references.');
		}
		
		process.exit(0);
	} catch (error) {
		console.error('❌ Error fixing orphaned data:', error);
		process.exit(1);
	}
}

fixOrphanedData();
