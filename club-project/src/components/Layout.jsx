import React from 'react'
import { Link } from 'react-router-dom'
import ProfileMenu from './ProfileMenu.jsx'
import SearchSidebar from './SearchSidebar.jsx'
import { Search, Sparkles } from 'lucide-react'
export default function Layout({ children }) {
	const [searchOpen, setSearchOpen] = React.useState(false)
	const [scrolled, setScrolled] = React.useState(false)

	React.useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 10)
		}
		window.addEventListener('scroll', handleScroll)
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	return (
		<div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%)' }}>
			<header style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				padding: '16px 24px',
				background: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)',
				backdropFilter: 'blur(12px)',
				borderBottom: scrolled ? '1px solid rgba(226, 232, 240, 0.8)' : '1px solid rgba(226, 232, 240, 0.4)',
				position: 'sticky',
				top: 0,
				zIndex: 50,
				transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				boxShadow: scrolled ? '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' : 'none'
			}}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
					<Link 
						to="/" 
						style={{ 
							textDecoration: 'none', 
							color: '#1e293b', 
							fontWeight: 700,
							fontSize: '20px',
							display: 'flex',
							alignItems: 'center',
							gap: 8,
							transition: 'all 0.2s ease',
							letterSpacing: '-0.02em'
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.color = '#3b82f6'
							e.currentTarget.style.transform = 'translateY(-1px)'
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.color = '#1e293b'
							e.currentTarget.style.transform = 'translateY(0)'
						}}
					>
						<Sparkles size={22} style={{ color: '#3b82f6' }} />
						ClubVerse
					</Link>
					<button 
						onClick={() => setSearchOpen(true)} 
						style={{ 
							border: '1px solid #e2e8f0', 
							background: 'linear-gradient(to bottom, #ffffff, #f8fafc)',
							padding: '10px 18px',
							borderRadius: 10,
							cursor: 'pointer',
							fontWeight: 500,
							fontSize: '14px',
							color: '#475569',
							display: 'flex',
							alignItems: 'center',
							gap: 8,
							transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
							boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
							letterSpacing: '-0.01em'
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.borderColor = '#cbd5e1'
							e.currentTarget.style.transform = 'translateY(-2px)'
							e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
							e.currentTarget.style.background = 'linear-gradient(to bottom, #ffffff, #f1f5f9)'
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.borderColor = '#e2e8f0'
							e.currentTarget.style.transform = 'translateY(0)'
							e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
							e.currentTarget.style.background = 'linear-gradient(to bottom, #ffffff, #f8fafc)'
						}}
						onMouseDown={(e) => {
							e.currentTarget.style.transform = 'translateY(0) scale(0.98)'
						}}
						onMouseUp={(e) => {
							e.currentTarget.style.transform = 'translateY(-2px) scale(1)'
						}}
					>
						<Search size={16} style={{ color: '#64748b' }} />
						<span>Search Students</span>
					</button>
				</div>
				<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
					<ProfileMenu />
				</div>
			</header>
			<main style={{
				maxWidth: '1400px',
				margin: '0 auto',
				padding: '32px 24px',
				minHeight: 'calc(100vh - 73px)'
			}}>
				{children}
			</main>
			<SearchSidebar open={searchOpen} onClose={() => setSearchOpen(false)} />

			<style>{`
				* {
					box-sizing: border-box;
				}
				
				body {
					margin: 0;
					font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
					-webkit-font-smoothing: antialiased;
					-moz-osx-font-smoothing: grayscale;
				}

				@media (max-width: 768px) {
					header {
						padding: 12px 16px !important;
					}
					
					header > div:first-child {
						gap: 12px !important;
					}
					
					header button {
						padding: 8px 14px !important;
						font-size: 13px !important;
					}
					
					main {
						padding: 24px 16px !important;
					}
				}

				@media (max-width: 480px) {
					header a {
						font-size: 18px !important;
					}
					
					header button span {
						display: none;
					}
					
					header button {
						padding: 8px 10px !important;
					}
				}

				@keyframes fadeIn {
					from {
						opacity: 0;
						transform: translateY(10px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}

				main {
					animation: fadeIn 0.4s ease-out;
				}

				button:focus-visible {
					outline: 2px solid #3b82f6;
					outline-offset: 2px;
				}
			`}</style>
		</div>
	)
}