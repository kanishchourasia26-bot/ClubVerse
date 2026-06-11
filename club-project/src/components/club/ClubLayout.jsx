import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function ClubLayout({ club, sections }) {
	const navigate = useNavigate()
	const location = useLocation()
	
	// Get current section from URL hash, default to 'home'
	const getCurrentSection = () => {
		const hash = location.hash.replace('#', '')
		return sections.find(s => s.id === hash) ? hash : 'home'
	}
	
	const [activeTab, setActiveTab] = React.useState(getCurrentSection())
	const ActiveComponent = sections.find(s => s.id === activeTab)?.component || (() => <div />)
	
	// Update active tab when URL hash changes
	React.useEffect(() => {
		const newSection = getCurrentSection()
		setActiveTab(newSection)
	}, [location.hash])

	return (
		<div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
			{/* Sidebar */}
			<div style={{ width: 250, background: club.sidebarBg || '#f8f9fa', borderRight: `1px solid ${club.sidebarBorder || '#eee'}`, padding: '20px 0' }}>
				<div style={{ padding: '0 20px', marginBottom: 20 }}>
					<h2 style={{ margin: 0, fontSize: '20px', color: club.primary || '#007bff' }}>{club.name}</h2>
					<p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>{club.tagline}</p>
				</div>
				<nav>
					{sections.map(item => (
						<button
							key={item.id}
							onClick={() => {
								setActiveTab(item.id)
								navigate(`#${item.id}`, { replace: true })
							}}
							style={{
								width: '100%',
								textAlign: 'left',
								padding: '12px 20px',
								border: 'none',
								background: activeTab === item.id ? (club.activeBg || '#007bff') : 'transparent',
								color: activeTab === item.id ? (club.activeText || 'white') : '#333',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								gap: 12,
								fontSize: '14px',
								transition: 'all 0.2s'
							}}
							onMouseEnter={(e) => {
								if (activeTab !== item.id) e.currentTarget.style.background = club.hoverBg || '#e9ecef'
							}}
							onMouseLeave={(e) => {
								if (activeTab !== item.id) e.currentTarget.style.background = 'transparent'
							}}
						>
							<span style={{ fontSize: '16px' }}>{item.icon}</span>
							{item.label}
						</button>
					))}
				</nav>
			</div>

			{/* Main Content */}
			<div style={{ flex: 1, padding: 24 }}>
				<ActiveComponent club={club} />
			</div>
		</div>
	)
}




