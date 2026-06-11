import React from 'react'
import { useParams } from 'react-router-dom'
import { API_URL } from '../lib/api.js'
import ClubLayout from '../components/club/ClubLayout.jsx'
import { HomeSection, GallerySection, AlumniSection, EventsSection, MembersSection, EnrollSection } from '../components/club/sections.jsx'

export default function Club() {
	const { slug } = useParams()
	const [club, setClub] = React.useState(null)
	const [loading, setLoading] = React.useState(true)

	React.useEffect(() => {
		async function loadClub() {
			try {
				const token = localStorage.getItem('token')
				const res = await fetch(`${API_URL}/clubs/${slug}`, {
					headers: { Authorization: `Bearer ${token}` }
				})
				const data = await res.json()
				if (res.ok) {
					// Transform API club data to match ClubLayout expected format
					const clubData = data.club
					setClub({
						_id: clubData.id,
						name: clubData.name,
						tagline: clubData.category || clubData.name,
						initial: clubData.name[0],
						badgeGradient: getClubGradient(clubData.slug),
						primary: getClubPrimaryColor(clubData.slug),
						sidebarBg: 'linear-gradient(180deg, #fff5f5, #fff8e1)',
						sidebarBorder: '#ffebee',
						activeBg: getClubGradient(clubData.slug),
						activeText: 'white',
						about: clubData.description || '',
						memberCount: clubData.memberCount || 0
					})
				}
			} catch (e) {
				console.error('Failed to load club:', e)
			} finally {
				setLoading(false)
			}
		}
		loadClub()
	}, [slug])

	function getClubGradient(slug) {
		const gradients = {
			sargam: 'linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)',
			aavesh: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
			picxcel: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
			zenith: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
			eic: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
			epmoc: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
			force: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
		}
		return gradients[slug] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
	}

	function getClubPrimaryColor(slug) {
		const colors = {
			sargam: '#ff6b6b',
			aavesh: '#667eea',
			picxcel: '#f093fb',
			zenith: '#4facfe',
			eic: '#43e97b',
			epmoc: '#fa709a',
			force: '#30cfd0'
		}
		return colors[slug] || '#007bff'
	}

	if (loading) {
		return (
			<div style={{ padding: 16 }}>
				<p>Loading club...</p>
			</div>
		)
	}

	if (!club) {
		return (
			<div style={{ padding: 16 }}>
				<h2>Club not found</h2>
				<p>The club you're looking for doesn't exist.</p>
			</div>
		)
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
