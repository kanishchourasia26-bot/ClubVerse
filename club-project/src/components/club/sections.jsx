import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import EventCard from '../EventCard'
import { API_URL } from '../../lib/api'

export function HomeSection({ club }) {
	return (
		<div>
			<div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
				<div style={{ width: 80, height: 80, borderRadius: '50%', background: club.badgeGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '32px' }}>
					{club.initial}
				</div>
				<div>
					<h1 style={{ margin: 0, fontSize: '32px' }}>{club.name}</h1>
					<p style={{ margin: 0, color: '#666', fontSize: '16px' }}>{club.tagline}</p>
					{club.memberCount !== undefined && (
						<p style={{ margin: '8px 0 0 0', color: club.primary, fontSize: '14px', fontWeight: '500' }}>
							{club.memberCount} {club.memberCount === 1 ? 'member' : 'members'}
						</p>
					)}
				</div>
			</div>
			<div style={{ background: '#f8f9fa', padding: 24, borderRadius: 12, marginBottom: 24 }}>
				<h3 style={{ marginTop: 0 }}>About {club.name}</h3>
				<p style={{ lineHeight: 1.6, marginBottom: 0 }}>{club.about}</p>
			</div>
		</div>
	)
}

export function GallerySection({ club }) {
	const [images, setImages] = useState([])
	const [loading, setLoading] = useState(true)
	const [selectedImage, setSelectedImage] = useState(null)
	const [currentIndex, setCurrentIndex] = useState(0)

	useEffect(() => {
		loadGalleryImages()
	}, [club])

	useEffect(() => {
		const handleKeyPress = (e) => {
			if (!selectedImage) return

			if (e.key === 'Escape') {
				setSelectedImage(null)
			} else if (e.key === 'ArrowLeft') {
				handlePrevious()
			} else if (e.key === 'ArrowRight') {
				handleNext()
			}
		}

		window.addEventListener('keydown', handleKeyPress)
		return () => window.removeEventListener('keydown', handleKeyPress)
	}, [selectedImage, currentIndex])

	const handlePrevious = () => {
		const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1
		setCurrentIndex(newIndex)
		setSelectedImage(images[newIndex])
	}

	const handleNext = () => {
		const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0
		setCurrentIndex(newIndex)
		setSelectedImage(images[newIndex])
	}

	const openImage = (image, index) => {
		setSelectedImage(image)
		setCurrentIndex(index)
	}

	const loadGalleryImages = async () => {
		setLoading(true)
		try {
			if (!club._id) {
				return
			}
			const response = await fetch(`${API_URL}/clubs/${club._id}/gallery`)
			const data = await response.json()
			if (response.ok) {
				setImages(data.images || [])
			}
		} catch (e) {
			console.error('Error loading gallery images:', e)
		} finally {
			setLoading(false)
		}
	}

	if (loading) {
		return (
			<div style={{ textAlign: 'center', padding: 40 }}>
				<p>Loading gallery...</p>
			</div>
		)
	}

	if (images.length === 0) {
		return (
			<div style={{ textAlign: 'center', padding: 40 }}>
				<h3>Gallery</h3>
				<p style={{ color: '#666' }}>No photos in gallery yet.</p>
			</div>
		)
	}

	return (
		<div>
			<h3 style={{ marginBottom: 24 }}>Gallery</h3>
			<div style={{ 
				display: 'grid', 
				gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
				gap: 20 
			}}>
				{images.map((image, index) => (
					<div 
						key={image._id} 
						style={{ 
							background: 'white',
							borderRadius: 8,
							overflow: 'hidden',
							boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
							cursor: 'pointer',
							transition: 'transform 0.2s'
						}}
						onClick={() => openImage(image, index)}
						onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
						onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
					>
						<img 
							src={image.imageUrl}
							alt={image.caption || 'Gallery photo'}
							style={{ 
								width: '100%', 
								height: 250, 
								objectFit: 'cover',
								display: 'block'
							}}
						/>
						{image.caption && (
							<div style={{ padding: 12 }}>
								<p style={{ 
									margin: 0, 
									fontSize: 14, 
									color: '#666',
									lineHeight: 1.5
								}}>
									{image.caption}
								</p>
							</div>
						)}
					</div>
				))}
			</div>

			{/* Full Image Modal */}
			{selectedImage && (
				<div 
					onClick={() => setSelectedImage(null)}
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						background: 'rgba(0, 0, 0, 0.9)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						zIndex: 9999,
						padding: 20
					}}
				>
					{/* Close Button */}
					<button
						onClick={() => setSelectedImage(null)}
						style={{
							position: 'absolute',
							top: 20,
							right: 20,
							background: 'white',
							border: 'none',
							borderRadius: '50%',
							width: 40,
							height: 40,
							fontSize: 24,
							cursor: 'pointer',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontWeight: 'bold',
							zIndex: 10000
						}}
					>
						×
					</button>

					{/* Previous Button */}
					{images.length > 1 && (
						<button
							onClick={handlePrevious}
							style={{
								position: 'absolute',
								left: 20,
								top: '50%',
								transform: 'translateY(-50%)',
								background: 'rgba(255, 255, 255, 0.9)',
								border: 'none',
								borderRadius: '50%',
								width: 50,
								height: 50,
								fontSize: 24,
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								fontWeight: 'bold',
								transition: 'background 0.2s'
							}}
							onMouseEnter={(e) => e.currentTarget.style.background = 'white'}
							onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'}
						>
							←
						</button>
					)}

					{/* Next Button */}
					{images.length > 1 && (
						<button
							onClick={handleNext}
							style={{
								position: 'absolute',
								right: 20,
								top: '50%',
								transform: 'translateY(-50%)',
								background: 'rgba(255, 255, 255, 0.9)',
								border: 'none',
								borderRadius: '50%',
								width: 50,
								height: 50,
								fontSize: 24,
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								fontWeight: 'bold',
								transition: 'background 0.2s'
							}}
							onMouseEnter={(e) => e.currentTarget.style.background = 'white'}
							onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'}
						>
							→
						</button>
					)}

					{/* Image Counter */}
					{images.length > 1 && (
						<div style={{
							position: 'absolute',
							bottom: 20,
							left: '50%',
							transform: 'translateX(-50%)',
							background: 'rgba(0, 0, 0, 0.7)',
							color: 'white',
							padding: '8px 16px',
							borderRadius: 20,
							fontSize: 14
						}}>
							{currentIndex + 1} / {images.length}
						</div>
					)}

					<div 
						onClick={(e) => e.stopPropagation()}
						style={{
							maxWidth: '90%',
							maxHeight: '85%',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center'
						}}
					>
						<img 
							src={selectedImage.imageUrl}
							alt={selectedImage.caption || 'Gallery photo'}
							style={{
								maxWidth: '100%',
								maxHeight: '75vh',
								objectFit: 'contain',
								borderRadius: 8
							}}
						/>
						{selectedImage.caption && (
							<div style={{ 
								background: 'white', 
								padding: 16, 
								borderRadius: 8, 
								marginTop: 16,
								textAlign: 'center',
								maxWidth: '100%',
								wordWrap: 'break-word'
							}}>
								<p style={{ 
									margin: 0, 
									fontSize: 16, 
									color: '#333' 
								}}>
									{selectedImage.caption}
								</p>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	)
}

export function AlumniSection({ club }) {
	const [alumni, setAlumni] = useState([])
	const [loading, setLoading] = useState(true)
	const [members, setMembers] = useState([])

	useEffect(() => {
		loadAlumni()
		if (club?._id) {
			loadCurrentLeadership()
		}
	}, [club])

	const loadAlumni = async () => {
		setLoading(true)
		try {
			if (!club?._id) return
			const response = await fetch(`${API_URL}/clubs/${club._id}/alumni`)
			const data = await response.json()
			if (response.ok) {
				setAlumni(data.alumni || [])
			}
		} catch (e) {
			console.error('Error loading alumni:', e)
		} finally {
			setLoading(false)
		}
	}

	const loadCurrentLeadership = async () => {
		try {
			const response = await fetch(`${API_URL}/clubs/${club.slug}/members`)
			const data = await response.json()
			if (response.ok) {
				setMembers(data.members || [])
			}
		} catch (e) {
			console.error('Error loading members:', e)
		}
	}

	if (loading) {
		return (
			<div style={{ textAlign: 'center', padding: 40 }}>
				<p>Loading alumni...</p>
			</div>
		)
	}

	const founders = alumni.filter(a => a.isFounder)
	const otherAlumni = alumni.filter(a => !a.isFounder)
	const president = members.find(m => m.designation === 'President')
	const vicePresident = members.find(m => m.designation === 'Vice-President')

	return (
		<div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
			<div style={{ flexShrink: 0 }}>
				{/* Founder Section */}
				{founders.length > 0 && (
					<div style={{ marginBottom: 40 }}>
						<h3 style={{ marginBottom: 24 }}>Founder</h3>
						<div style={{ 
							display: 'flex', 
							justifyContent: 'center', 
							gap: 24,
							flexWrap: 'wrap'
						}}>
							{founders.map(founder => (
								<div key={founder._id} style={{ textAlign: 'center' }}>
									<img 
										src={founder.photoUrl}
										alt={founder.name}
										style={{ 
											width: 180, 
											height: 180, 
											borderRadius: '50%',
											objectFit: 'cover',
											border: '4px solid gold',
											marginBottom: 12
										}}
									/>
									<h4 style={{ margin: '8px 0 4px 0' }}>{founder.name}</h4>
									<p style={{ margin: 0, color: '#666', fontSize: 14 }}>Founder</p>
									{founder.bio && (
										<p style={{ margin: '8px 0 0 0', fontSize: 13, color: '#999', maxWidth: 250 }}>
											{founder.bio}
										</p>
									)}
								</div>
							))}
						</div>
					</div>
				)}

				{/* Current Leadership */}
				{(president || vicePresident) && (
					<div style={{ marginBottom: 40 }}>
						<h3 style={{ marginBottom: 24 }}>Current Leadership</h3>
						<div style={{ 
							display: 'flex', 
							justifyContent: 'center', 
							gap: 32,
							flexWrap: 'wrap'
						}}>
							{president && (
								<div style={{ textAlign: 'center' }}>
									<img 
										src={president.user.avatarUrl || `https://ui-avatars.com/api/?name=${president.user.name}`}
										alt={president.user.name}
										style={{ 
											width: 150, 
											height: 150, 
											borderRadius: '50%',
											objectFit: 'cover',
											border: '3px solid #007bff',
											marginBottom: 12
										}}
									/>
									<h4 style={{ margin: '8px 0 4px 0' }}>{president.user.name}</h4>
									<p style={{ margin: 0, color: '#666', fontSize: 13 }}>President</p>
								</div>
							)}
							{vicePresident && (
								<div style={{ textAlign: 'center' }}>
									<img 
										src={vicePresident.user.avatarUrl || `https://ui-avatars.com/api/?name=${vicePresident.user.name}`}
										alt={vicePresident.user.name}
										style={{ 
											width: 150, 
											height: 150, 
											borderRadius: '50%',
											objectFit: 'cover',
											border: '3px solid #28a745',
											marginBottom: 12
										}}
									/>
									<h4 style={{ margin: '8px 0 4px 0' }}>{vicePresident.user.name}</h4>
									<p style={{ margin: 0, color: '#666', fontSize: 13 }}>Vice-President</p>
								</div>
							)}
						</div>
					</div>
				)}
			</div>

			{/* Scrollable Alumni Section */}
			{otherAlumni.length > 0 && (
				<div style={{ 
					flex: 1,
					overflowY: 'auto',
					minHeight: 0
				}}>
					<h3 style={{ marginBottom: 24, marginTop: 0 }}>Alumni</h3>
					<div style={{ 
						display: 'grid',
						gridTemplateColumns: 'repeat(2, 1fr)',
						gap: 16,
						paddingBottom: 20
					}}>
						{otherAlumni.map(alumnus => (
							<div key={alumnus._id} style={{ 
								textAlign: 'center',
								background: 'white',
								padding: 20,
								borderRadius: 12,
								boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
							}}>
								<img 
									src={alumnus.photoUrl}
									alt={alumnus.name}
									style={{ 
										width: 120, 
										height: 120, 
										borderRadius: '50%',
										objectFit: 'cover',
										border: '3px solid #007bff',
										margin: '0 auto 12px auto'
									}}
								/>
								<h4 style={{ margin: '0 0 4px 0' }}>{alumnus.name}</h4>
								{alumnus.designation && (
									<p style={{ margin: '0 0 4px 0', color: '#666', fontSize: 14 }}>
										{alumnus.designation}
									</p>
								)}
								{alumnus.yearGraduated && (
									<p style={{ margin: 0, color: '#999', fontSize: 13 }}>
										{alumnus.yearGraduated}
									</p>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			{founders.length === 0 && otherAlumni.length === 0 && (
				<p style={{ color: '#666', textAlign: 'center', padding: 40 }}>
					No alumni information available yet.
				</p>
			)}
		</div>
	)
}

export function EventsSection({ club }) {
	const [events, setEvents] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [userRegistrations, setUserRegistrations] = useState([])

	useEffect(() => {
		loadEvents()
		loadUserRegistrations()
	}, [club])

	const loadEvents = async () => {
		setLoading(true)
		setError('')
		try {
			if (!club._id) {
				setError('Club ID not found')
				return
			}
			console.log('Loading events for club:', club._id)
			const response = await fetch(`${API_URL}/events/club/${club._id}`)
			const data = await response.json()
			if (response.ok) {
				setEvents(data.events)
			} else {
				setError(data.error || 'Failed to load events')
			}
		} catch (e) {
			console.error('Error loading events:', e)
			setError('Failed to load events')
		} finally {
			setLoading(false)
		}
	}

	const loadUserRegistrations = async () => {
		const token = localStorage.getItem('token');
		if (!token) {
			console.log('No token found, user not logged in');
			return;
		}

		try {
			const response = await fetch(`${API_URL}/events/user/registrations`, {
				headers: { 'Authorization': `Bearer ${token}` }
			});
			if (response.ok) {
				const data = await response.json();
				console.log('Loaded user registrations:', data.registrations);
				setUserRegistrations(data.registrations || []);
			} else {
				console.error('Failed to load registrations:', response.status);
			}
		} catch (e) {
			console.error('Error loading user registrations:', e);
		}
	}

	const handleRegister = async (event) => {
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				alert('Please login to register for events');
				// TODO: Redirect to login
				return;
			}

			const response = await fetch(`${API_URL}/events/${event._id}/register`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});

			const data = await response.json();
			
			if (!response.ok) {
				throw new Error(data.error || 'Failed to register for event');
			}

			alert(`Successfully registered for "${event.title}"!`);
			// Reload user registrations to update button state
			await loadUserRegistrations();
			console.log('User registrations reloaded after registration');
		} catch (e) {
			console.error('Error registering for event:', e);
			alert(e.message || 'Failed to register for event');
		}
	}

	if (loading) {
		return (
			<div>
				<h3>Events</h3>
				<p>Loading events...</p>
			</div>
		)
	}

	if (error) {
		return (
			<div>
				<h3>Events</h3>
				<p style={{ color: '#dc3545' }}>Error: {error}</p>
			</div>
		)
	}

	return (
		<div>
			<h3>Events</h3>
			{events.length === 0 ? (
				<div style={{
					textAlign: 'center',
					padding: '40px 20px',
					color: '#666',
					background: '#f8f9fa',
					borderRadius: 8,
					border: '1px dashed #dee2e6'
				}}>
					<p style={{ margin: 0, fontSize: 16 }}>No events scheduled yet</p>
					<p style={{ margin: '8px 0 0 0', fontSize: 14 }}>Check back later for upcoming events!</p>
				</div>
			) : (
				<div>
					{events.map(event => (
						<EventCard
							key={event._id}
							event={event}
							onRegister={handleRegister}
							userRegistrations={userRegistrations}
						/>
					))}
				</div>
			)}
		</div>
	)
}

export function MembersSection() {
	const navigate = useNavigate()
	const [members, setMembers] = React.useState([])
	const [loading, setLoading] = React.useState(true)
	const [error, setError] = React.useState('')

	React.useEffect(() => {
		let isMounted = true
		async function load() {
			try {
				setError('')
				const token = localStorage.getItem('token')
				const path = window.location.pathname // e.g. /sargam, /picxcel/, /force/members (if nested later)
				const slug = path.split('/').filter(Boolean)[0] || 'sargam'
				const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
				const res = await fetch(`${apiBase}/clubs/${slug}/members`, {
					headers: { Authorization: `Bearer ${token}` }
				})
				const data = await res.json()
				if (isMounted) {
					if (!res.ok) throw new Error(data.error || 'Failed to load members')
					setMembers(data.members)
				}
			} catch (e) {
				if (isMounted) setError(e.message)
			} finally {
				if (isMounted) setLoading(false)
			}
		}
		load()
		return () => { isMounted = false }
	}, [])

	if (loading) return <div>Loading members...</div>
	if (error) return <div style={{ color: 'red' }}>{error}</div>

	return (
		<div>
			<h3>Members</h3>
			{members.length === 0 && <p>No members yet.</p>}
			<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
				{members.map(m => (
					<div 
						key={m.id} 
						onClick={() => navigate(`/profile/${m.user.username}`)}
						style={{ 
							border: '1px solid #eee', 
							borderRadius: 8, 
							padding: 12, 
							display: 'flex', 
							alignItems: 'center', 
							gap: 12,
							cursor: 'pointer',
							transition: 'all 0.2s ease',
							background: '#fff'
						}}
						onMouseEnter={(e) => {
							e.target.style.borderColor = '#007bff'
							e.target.style.boxShadow = '0 2px 8px rgba(0,123,255,0.15)'
							e.target.style.transform = 'translateY(-2px)'
						}}
						onMouseLeave={(e) => {
							e.target.style.borderColor = '#eee'
							e.target.style.boxShadow = 'none'
							e.target.style.transform = 'translateY(0)'
						}}
					>
						<div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#f0f0f0' }}>
							{m.user.avatarUrl ? (
								<img src={m.user.avatarUrl.startsWith('http') ? m.user.avatarUrl : (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/?api\/?$/, '') + m.user.avatarUrl} alt={m.user.name} width={40} height={40} style={{ objectFit: 'cover', display: 'block', width: '100%', height: '100%' }} />
							) : (
								<div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontWeight: 'bold' }}>{m.user.name?.[0]?.toUpperCase() || 'U'}</div>
							)}
						</div>
						<div style={{ flex: 1 }}>
							<div style={{ fontWeight: 600 }}>{m.user.name}</div>
							<div style={{ color: '#666', fontSize: 12 }}>@{m.user.username}</div>
							{m.designation && <div style={{ color: '#007bff', fontSize: 12, marginTop: 4 }}>{m.designation}</div>}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export function EnrollSection({ club }) {
	const [hiringStatus, setHiringStatus] = useState(null)
	const [hasApplied, setHasApplied] = useState(false)
	const [isRejected, setIsRejected] = useState(false)
	const [rejectionMessage, setRejectionMessage] = useState('')
	const [isMember, setIsMember] = useState(false)
	const [applying, setApplying] = useState(false)
	const [loading, setLoading] = useState(true)
	const [clearingRejection, setClearingRejection] = useState(false)

	useEffect(() => {
		loadHiringStatus()
		checkApplicationStatus()
		checkMembership()
	}, [club])

	const checkMembership = async () => {
		try {
			const token = localStorage.getItem('token')
			if (!token || !club?._id) return

			const response = await fetch(`${API_URL}/users/me/memberships`, {
				headers: { Authorization: `Bearer ${token}` }
			})
			const data = await response.json()
			if (response.ok && data.memberships) {
				// Check if user is a member of this club
				const isMemberOfClub = data.memberships.some(m => {
					const clubId = m.club._id || m.club
					return clubId === club._id || String(clubId) === String(club._id)
				})
				setIsMember(isMemberOfClub)
			}
		} catch (e) {
			console.error('Error checking membership:', e)
		}
	}

	const loadHiringStatus = async () => {
		setLoading(true)
		try {
			if (!club?._id) return
			const response = await fetch(`${API_URL}/clubs/${club._id}/hiring`)
			const data = await response.json()
			if (response.ok) {
				setHiringStatus(data.hiringStatus)
			}
		} catch (e) {
			console.error('Error loading hiring status:', e)
		} finally {
			setLoading(false)
		}
	}

	const checkApplicationStatus = async () => {
		try {
			const token = localStorage.getItem('token')
			if (!token || !club?._id) return

			const response = await fetch(`${API_URL}/applications/club/${club._id}`, {
				headers: { Authorization: `Bearer ${token}` }
			})
			const data = await response.json()
			if (response.ok) {
				if (data.application) {
					const appStatus = data.application.status
					// Only consider it "applied" if status is pending or approved
					setHasApplied(appStatus === 'pending' || appStatus === 'approved')
					setIsRejected(appStatus === 'rejected')
					setRejectionMessage(data.application.rejectionMessage || '')
				} else {
					setHasApplied(false)
					setIsRejected(false)
					setRejectionMessage('')
				}
			}
		} catch (e) {
			console.error('Error checking application status:', e)
		}
	}

	const handleApply = async () => {
		setApplying(true)
		try {
			const token = localStorage.getItem('token')
			if (!token) {
				alert('Please login to apply')
				return
			}

			const response = await fetch(`${API_URL}/applications`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({ clubId: club._id })
			})

			const data = await response.json()
			if (!response.ok) {
				throw new Error(data.error || 'Failed to apply')
			}

			setHasApplied(true)
			alert('Application submitted successfully!')
		} catch (e) {
			console.error('Error applying:', e)
			alert(e.message || 'Failed to apply')
		} finally {
			setApplying(false)
		}
	}

	const handleClearRejection = async () => {
		setClearingRejection(true)
		try {
			const token = localStorage.getItem('token')
			if (!token) {
				alert('Please login')
				return
			}

			const response = await fetch(`${API_URL}/applications/club/${club._id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`
				}
			})

			if (response.ok) {
				// Reset all application states
				setIsRejected(false)
				setRejectionMessage('')
				setHasApplied(false)
				// Reload hiring status to show the normal hiring UI
				await checkApplicationStatus()
			} else {
				const data = await response.json()
				alert(data.error || 'Failed to clear rejection')
			}
		} catch (e) {
			console.error('Error clearing rejection:', e)
			alert('Failed to clear rejection. Please try again.')
		} finally {
			setClearingRejection(false)
		}
	}

	if (loading) {
		return (
			<div style={{ textAlign: 'center', padding: 40 }}>
				<p>Loading...</p>
			</div>
		)
	}

	const isHiring = hiringStatus?.isHiring
	const deadline = hiringStatus?.hiringDeadline

	// If user is already a member
	if (isMember) {
		return (
			<div>
				<h3 style={{ marginBottom: 24 }}>Join {club.name}</h3>
				<div style={{
					padding: 32,
					background: 'linear-gradient(135deg, #28a745 0%, #208638 100%)',
					borderRadius: 12,
					textAlign: 'center',
					color: 'white'
				}}>
					<div style={{ fontSize: 64, marginBottom: 16 }}>✓</div>
					<h2 style={{ margin: '0 0 16px 0', color: 'white' }}>You're Already a Member!</h2>
					<p style={{ margin: 0, opacity: 0.9 }}>
						You are already part of {club.name}.
						<br />Thank you for being with us!
					</p>
				</div>
			</div>
		)
	}

	// If user was rejected (show regardless of hiring status)
	if (isRejected) {
		return (
			<div>
				<h3 style={{ marginBottom: 24 }}>Join {club.name}</h3>
				<div style={{
					padding: 32,
					background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
					borderRadius: 12,
					textAlign: 'center',
					color: 'white'
				}}>
					<div style={{ fontSize: 64, marginBottom: 16 }}>❌</div>
					<h2 style={{ margin: '0 0 16px 0', color: 'white' }}>Application Rejected</h2>
					<p style={{ margin: '0 0 16px 0', opacity: 0.9 }}>
						Your application has been rejected.
					</p>
					{rejectionMessage && (
						<div style={{
							background: 'rgba(255,255,255,0.15)',
							padding: 16,
							borderRadius: 8,
							marginTop: 20,
							marginBottom: 20,
							textAlign: 'left'
						}}>
							<p style={{ margin: 0, fontWeight: 'bold', marginBottom: 8 }}>Message from Admin:</p>
							<p style={{ margin: 0, lineHeight: 1.6 }}>
								{rejectionMessage}
							</p>
						</div>
					)}
					<button
						onClick={handleClearRejection}
						disabled={clearingRejection}
						style={{
							marginTop: 24,
							padding: '12px 32px',
							background: 'white',
							color: '#dc3545',
							border: 'none',
							borderRadius: 8,
							fontSize: 16,
							fontWeight: 'bold',
							cursor: clearingRejection ? 'not-allowed' : 'pointer',
							transition: 'all 0.2s',
							opacity: clearingRejection ? 0.8 : 1
						}}
						onMouseEnter={(e) => {
							if (!clearingRejection) e.target.style.transform = 'scale(1.05)'
						}}
						onMouseLeave={(e) => {
							e.target.style.transform = 'scale(1)'
						}}
					>
						{clearingRejection ? 'Clearing...' : 'View Further Hiring'}
					</button>
				</div>
			</div>
		)
	}

	return (
		<div>
			<h3 style={{ marginBottom: 24 }}>Join {club.name}</h3>
			<div style={{
				padding: 32,
				background: isHiring ? 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)' : '#f8f9fa',
				borderRadius: 12,
				textAlign: 'center',
				color: isHiring ? 'white' : '#333'
			}}>
				{isHiring ? (
					<>
						<div style={{ fontSize: 64, marginBottom: 16 }}>🎯</div>
						<h2 style={{ margin: '0 0 16px 0', color: 'white' }}>We're Hiring!</h2>
						
						{deadline && (
							<p style={{ margin: '0 0 16px 0', opacity: 0.9 }}>
								Applications open until: <strong>{new Date(deadline).toLocaleString()}</strong>
							</p>
						)}
						
						{hiringStatus.hiringDescription && (
							<div style={{
								background: 'rgba(255,255,255,0.2)',
								padding: 16,
								borderRadius: 8,
								marginTop: 20,
								textAlign: 'left'
							}}>
								<p style={{ margin: 0, lineHeight: 1.6 }}>
									{hiringStatus.hiringDescription}
								</p>
							</div>
						)}

						<button
							onClick={handleApply}
							disabled={hasApplied || applying}
							style={{
								marginTop: 24,
								padding: '12px 32px',
								background: hasApplied ? '#28a745' : 'white',
								color: hasApplied ? 'white' : '#007bff',
								border: 'none',
								borderRadius: 8,
								fontSize: 16,
								fontWeight: 'bold',
								cursor: hasApplied || applying ? 'not-allowed' : 'pointer',
								transition: 'all 0.2s',
								opacity: (hasApplied || applying) ? 0.8 : 1
							}}
							onMouseEnter={(e) => {
								if (!hasApplied && !applying) e.target.style.transform = 'scale(1.05)'
							}}
							onMouseLeave={(e) => {
								e.target.style.transform = 'scale(1)'
							}}
						>
							{applying ? 'Applying...' : hasApplied ? '✓ Applied' : 'Apply Now'}
						</button>
					</>
				) : (
					<>
						<div style={{ fontSize: 64, marginBottom: 16 }}>🔒</div>
						<h2 style={{ margin: '0 0 16px 0' }}>Currently Not Hiring</h2>
						<p style={{ margin: 0, opacity: 0.8 }}>
							{club.name} is currently not accepting new members.
							<br />Check back later or contact us for more information.
						</p>
					</>
				)}
			</div>
		</div>
	)
}


