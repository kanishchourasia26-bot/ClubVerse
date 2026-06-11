import React from 'react'

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

export function GallerySection() {
	return (
		<div>
			<h3>Gallery</h3>
			<p>Photos will be displayed here.</p>
		</div>
	)
}

export function AlumniSection() {
	return (
		<div>
			<h3>Alumni</h3>
			<p>Alumni information will be displayed here.</p>
		</div>
	)
}

export function EventsSection() {
	return (
		<div>
			<h3>Events</h3>
			<p>Upcoming and past events will be displayed here.</p>
		</div>
	)
}

export function MembersSection() {
	return (
		<div>
			<h3>Members</h3>
			<p>Club members will be displayed here.</p>
		</div>
	)
}

export function EnrollSection() {
	return (
		<div>
			<h3>Enroll Now</h3>
			<p>Enrollment form will be displayed here.</p>
		</div>
	)
}


