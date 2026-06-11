import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";

export default function Home() {
	// Mock navigation for demo
	const navigate = useNavigate();


	const clubCards = [
		{ slug: 'sargam', name: 'SARGAM', tag: 'Music & Dance', gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)', initial: 'S' },
		{ slug: 'aavesh', name: 'AAVESH', tag: 'Electronics', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', initial: 'A' },
		{ slug: 'picxcel', name: 'PICXCEL', tag: 'Photography', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', initial: 'P' },
		{ slug: 'zenith', name: 'ZENITH', tag: 'Sports', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', initial: 'Z' },
		{ slug: 'eic', name: 'EIC', tag: 'Entrepreneurship', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', initial: 'E' },
		{ slug: 'epmoc', name: 'EPMOC', tag: 'Event Management', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', initial: 'E' },
		{ slug: 'force', name: 'FORCE', tag: 'Coding', gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', initial: 'F' }
	]

	// Mock member counts for demo
	const [memberCounts] = useState({
		sargam: 124,
		aavesh: 89,
		picxcel: 156,
		zenith: 203,
		eic: 67,
		epmoc: 145,
		force: 198
	})

	return (
		<div style={styles.container}>
			<div style={styles.heroSection}>
				<div style={styles.heroContent}>
					<h1 style={styles.mainHeading}>
						Discover Your <span style={styles.highlight}>Community</span>
					</h1>
					<p style={styles.subtitle}>
						Join vibrant clubs, connect with like-minded peers, and explore your passions
					</p>
				</div>
			</div>

			<div style={styles.contentWrapper}>
				<div style={styles.sectionHeader}>
					<h2 style={styles.sectionTitle}>College Clubs</h2>
					<p style={styles.sectionDescription}>
						Choose from {clubCards.length} amazing clubs that match your interests
					</p>
				</div>
				
				<div style={styles.gridContainer}>
					{clubCards.map(card => (
						<article
							key={card.slug}
							onClick={() => navigate(`/${card.slug}`)}
							style={styles.card}
							onMouseEnter={(e) => {
								e.currentTarget.style.transform = 'translateY(-8px)'
								e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)'
								const arrow = e.currentTarget.querySelector('[data-arrow]')
								if (arrow) arrow.style.transform = 'translateX(4px)'
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.transform = 'translateY(0)'
								e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
								const arrow = e.currentTarget.querySelector('[data-arrow]')
								if (arrow) arrow.style.transform = 'translateX(0)'
							}}
						>
							<div style={styles.cardContent}>
								<div style={styles.cardHeader}>
									<div style={{
										...styles.iconWrapper,
										background: card.gradient
									}}>
										<span style={styles.iconText}>{card.initial}</span>
									</div>
									<div style={styles.clubInfo}>
										<h3 style={styles.clubName}>{card.name}</h3>
										<span style={styles.clubTag}>{card.tag}</span>
									</div>
								</div>

								<p style={styles.cardDescription}>
									Explore what {card.name} has to offer and become part of our community
								</p>

								<div style={styles.cardFooter}>
									<div style={styles.memberBadge}>
										<svg style={styles.memberIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
											<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
											<circle cx="9" cy="7" r="4" />
											<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
											<path d="M16 3.13a4 4 0 0 1 0 7.75" />
										</svg>
										<span style={styles.memberCount}>
											{memberCounts[card.slug] ?? '—'} {memberCounts[card.slug] === 1 ? 'Member' : 'Members'}
										</span>
									</div>
									<div style={styles.exploreLink}>
										<span style={styles.exploreLinkText}>Explore</span>
										<svg data-arrow style={styles.arrowIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
											<path d="M5 12h14M12 5l7 7-7 7"/>
										</svg>
									</div>
								</div>
							</div>

							<div style={{
								...styles.cardGradientOverlay,
								background: card.gradient
							}} />
						</article>
					))}
				</div>
			</div>
		</div>
	)
}

const styles = {
	container: {
		minHeight: '100vh',
		background: 'linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%)',
		fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
	},
	heroSection: {
		background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
		padding: '60px 24px',
		position: 'relative',
		overflow: 'hidden'
	},
	heroContent: {
		maxWidth: '1200px',
		margin: '0 auto',
		textAlign: 'center',
		position: 'relative',
		zIndex: 1
	},
	mainHeading: {
		fontSize: 'clamp(32px, 5vw, 56px)',
		fontWeight: '800',
		color: 'white',
		margin: '0 0 16px 0',
		lineHeight: '1.2',
		letterSpacing: '-0.02em'
	},
	highlight: {
		background: 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)',
		WebkitBackgroundClip: 'text',
		WebkitTextFillColor: 'transparent',
		backgroundClip: 'text'
	},
	subtitle: {
		fontSize: 'clamp(16px, 2.5vw, 20px)',
		color: 'rgba(255, 255, 255, 0.95)',
		margin: 0,
		fontWeight: '400',
		lineHeight: '1.6'
	},
	contentWrapper: {
		maxWidth: '1200px',
		margin: '0 auto',
		padding: '48px 24px'
	},
	sectionHeader: {
		textAlign: 'center',
		marginBottom: '48px'
	},
	sectionTitle: {
		fontSize: 'clamp(28px, 4vw, 36px)',
		fontWeight: '700',
		color: '#1e293b',
		margin: '0 0 12px 0',
		letterSpacing: '-0.01em'
	},
	sectionDescription: {
		fontSize: '16px',
		color: '#64748b',
		margin: 0,
		fontWeight: '400'
	},
	gridContainer: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
		gap: '24px'
	},
	card: {
		position: 'relative',
		border: '1px solid #e2e8f0',
		borderRadius: '16px',
		padding: '24px',
		cursor: 'pointer',
		background: 'white',
		boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
		transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
		overflow: 'hidden'
	},
	cardContent: {
		position: 'relative',
		zIndex: 1
	},
	cardHeader: {
		display: 'flex',
		alignItems: 'center',
		gap: '16px',
		marginBottom: '16px'
	},
	iconWrapper: {
		width: '56px',
		height: '56px',
		borderRadius: '14px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0,
		boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
	},
	iconText: {
		color: 'white',
		fontWeight: '700',
		fontSize: '24px',
		letterSpacing: '-0.01em'
	},
	clubInfo: {
		flex: 1,
		minWidth: 0
	},
	clubName: {
		margin: '0 0 4px 0',
		fontSize: '20px',
		fontWeight: '700',
		color: '#1e293b',
		letterSpacing: '-0.01em'
	},
	clubTag: {
		display: 'inline-block',
		fontSize: '13px',
		color: '#64748b',
		fontWeight: '500',
		padding: '2px 10px',
		background: '#f1f5f9',
		borderRadius: '6px'
	},
	cardDescription: {
		color: '#475569',
		marginBottom: '20px',
		lineHeight: '1.6',
		fontSize: '14px',
		fontWeight: '400'
	},
	cardFooter: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingTop: '16px',
		borderTop: '1px solid #f1f5f9'
	},
	memberBadge: {
		display: 'flex',
		alignItems: 'center',
		gap: '8px'
	},
	memberIcon: {
		width: '18px',
		height: '18px',
		color: '#667eea'
	},
	memberCount: {
		color: '#1e293b',
		fontSize: '14px',
		fontWeight: '600'
	},
	exploreLink: {
		display: 'flex',
		alignItems: 'center',
		gap: '6px',
		color: '#667eea'
	},
	exploreLinkText: {
		fontSize: '14px',
		fontWeight: '600'
	},
	arrowIcon: {
		width: '16px',
		height: '16px',
		transition: 'transform 0.2s ease'
	},
	cardGradientOverlay: {
		position: 'absolute',
		top: 0,
		right: 0,
		width: '120px',
		height: '120px',
		opacity: 0.06,
		borderRadius: '50%',
		filter: 'blur(40px)',
		pointerEvents: 'none',
		transform: 'translate(40px, -40px)'
	}
}