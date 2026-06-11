import React from 'react'
import ClubLayout from '../components/club/ClubLayout.jsx'
import { HomeSection, GallerySection, AlumniSection, EventsSection, MembersSection, EnrollSection } from '../components/club/sections.jsx'

export default function Sargam() {
	const club = {
		_id: '68f12a99e1fb8a46cadf3be7', // Actual club ID from database
		name: 'SARGAM',
		tagline: 'Music & Dance Club',
		initial: 'S',
		badgeGradient: 'linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)',
		primary: '#ff6b6b',
		sidebarBg: 'linear-gradient(180deg, #fff5f5, #fff8e1)',
		sidebarBorder: '#ffebee',
		activeBg: 'linear-gradient(135deg, #ff6b6b, #ffa726)',
		activeText: 'white',
		about: 'SARGAM is the premier Music and Dance club of our college, dedicated to promoting artistic expression through music and dance. We believe in the power of rhythm and movement to bring people together and create unforgettable experiences.'
	}

	const sections = [
		{ id: 'home', label: 'Home', icon: '🏠', component: HomeSection },
		{ id: 'gallery', label: 'Gallery', icon: '📸', component: GallerySection },
		{ id: 'alumni', label: 'Alumni', icon: '🎓', component: AlumniSection },
		{ id: 'events', label: 'Events', icon: '📅', component: EventsSection },
		{ id: 'members', label: 'Members', icon: '👥', component: MembersSection },
		{ id: 'enroll', label: 'Enroll Now', icon: '✍️', component: EnrollSection }
	]

	return <ClubLayout club={club} sections={sections} />
}
