import React from 'react'
import { useNavigate } from 'react-router-dom'
import { assetUrl, API_URL } from '../lib/api.js'
import { User, KeyRound, LogOut, ChevronDown } from 'lucide-react'

export default function ProfileMenu() {
	const navigate = useNavigate()
	const [open, setOpen] = React.useState(false)
	const [user, setUser] = React.useState(null)
	const menuRef = React.useRef(null)

	React.useEffect(() => {
		const token = localStorage.getItem('token')
		if (!token) return
		fetch(API_URL + '/auth/me', {
			headers: { Authorization: `Bearer ${token}` }
		})
			.then(r => r.json())
			.then(data => setUser(data.user))
			.catch(() => {})
	}, [])

	// Listen for avatar updates
	React.useEffect(() => {
		const handleAvatarUpdate = () => {
			const token = localStorage.getItem('token')
			if (!token) return
			fetch(API_URL + '/auth/me', {
				headers: { Authorization: `Bearer ${token}` }
			})
				.then(r => r.json())
				.then(data => setUser(data.user))
				.catch(() => {})
		}
		window.addEventListener('avatarUpdated', handleAvatarUpdate)
		return () => window.removeEventListener('avatarUpdated', handleAvatarUpdate)
	}, [])

	// Close menu when clicking outside
	React.useEffect(() => {
		const handleClickOutside = (event) => {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setOpen(false)
			}
		}
		if (open) {
			document.addEventListener('mousedown', handleClickOutside)
		}
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [open])

	function logout() {
		localStorage.removeItem('token')
		navigate('/signup')
	}

	function goProfile() {
		if (!user) return
		navigate(`/profile/${user.username}`)
	}

	const initials = user?.name?.[0]?.toUpperCase?.() || 'U'

	return (
		<div style={{ position: 'relative' }} ref={menuRef}>
			<button 
				onClick={() => setOpen(o => !o)} 
				aria-label="Profile" 
				title="Profile"
				style={{ 
					width: 40, 
					height: 40, 
					borderRadius: '50%', 
					border: '2px solid transparent',
					background: user?.avatarUrl ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
					cursor: 'pointer', 
					overflow: 'hidden', 
					padding: 0,
					transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
					boxShadow: open ? '0 0 0 3px rgba(102, 126, 234, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
					position: 'relative',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center'
				}}
				onMouseEnter={(e) => {
					if (!open) {
						e.currentTarget.style.transform = 'scale(1.05)'
						e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
					}
				}}
				onMouseLeave={(e) => {
					if (!open) {
						e.currentTarget.style.transform = 'scale(1)'
						e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
					}
				}}
			>
				{user?.avatarUrl ? (
					<img 
						src={assetUrl(user.avatarUrl)} 
						alt="avatar" 
						width={40} 
						height={40} 
						style={{ 
							objectFit: 'cover', 
							display: 'block',
							width: '100%',
							height: '100%'
						}} 
					/>
				) : (
					<span style={{ 
						display: 'inline-flex', 
						width: '100%', 
						height: '100%', 
						alignItems: 'center', 
						justifyContent: 'center',
						color: 'white',
						fontWeight: 600,
						fontSize: '16px',
						letterSpacing: '0.5px'
					}}>
						{initials}
					</span>
				)}
			</button>

			{open && (
				<>
					{/* Backdrop overlay for mobile */}
					<div 
						style={{
							position: 'fixed',
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							zIndex: 998,
							display: window.innerWidth < 768 ? 'block' : 'none'
						}}
						onClick={() => setOpen(false)}
					/>
					
					<div 
						style={{ 
							position: 'absolute', 
							top: 48, 
							right: 0, 
							border: '1px solid #e2e8f0',
							background: 'white', 
							borderRadius: 12, 
							minWidth: 220,
							boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
							zIndex: 999,
							overflow: 'hidden',
							animation: 'slideDown 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
						}}
					>
						{/* User info section */}
						{user && (
							<div style={{
								padding: '16px',
								borderBottom: '1px solid #e2e8f0',
								background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)'
							}}>
								<div style={{
									display: 'flex',
									alignItems: 'center',
									gap: '12px'
								}}>
									<div style={{
										width: 44,
										height: 44,
										borderRadius: '50%',
										background: user?.avatarUrl ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										overflow: 'hidden',
										border: '2px solid white',
										boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
									}}>
										{user?.avatarUrl ? (
											<img 
												src={assetUrl(user.avatarUrl)} 
												alt="avatar" 
												width={44} 
												height={44} 
												style={{ 
													objectFit: 'cover', 
													display: 'block',
													width: '100%',
													height: '100%'
												}} 
											/>
										) : (
											<span style={{ 
												color: 'white',
												fontWeight: 600,
												fontSize: '18px'
											}}>
												{initials}
											</span>
										)}
									</div>
									<div style={{ flex: 1, minWidth: 0 }}>
										<div style={{
											fontWeight: 600,
											fontSize: '15px',
											color: '#1e293b',
											marginBottom: '2px',
											whiteSpace: 'nowrap',
											overflow: 'hidden',
											textOverflow: 'ellipsis'
										}}>
											{user.name}
										</div>
										<div style={{
											fontSize: '13px',
											color: '#64748b',
											whiteSpace: 'nowrap',
											overflow: 'hidden',
											textOverflow: 'ellipsis'
										}}>
											@{user.username}
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Menu items */}
						<div style={{ padding: '8px' }}>
							<button 
								onClick={() => { goProfile(); setOpen(false); }} 
								style={{ 
									display: 'flex',
									alignItems: 'center',
									gap: '12px',
									width: '100%', 
									textAlign: 'left', 
									padding: '10px 12px',
									background: 'transparent', 
									border: 'none', 
									cursor: 'pointer',
									borderRadius: 8,
									fontSize: '14px',
									fontWeight: 500,
									color: '#334155',
									transition: 'all 0.15s ease'
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.background = '#f1f5f9'
									e.currentTarget.style.color = '#1e293b'
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.background = 'transparent'
									e.currentTarget.style.color = '#334155'
								}}
							>
								<User size={18} style={{ color: '#64748b' }} />
								My Profile
							</button>

							<button 
								onClick={() => { navigate('/change-password'); setOpen(false); }} 
								style={{ 
									display: 'flex',
									alignItems: 'center',
									gap: '12px',
									width: '100%', 
									textAlign: 'left', 
									padding: '10px 12px',
									background: 'transparent', 
									border: 'none', 
									cursor: 'pointer',
									borderRadius: 8,
									fontSize: '14px',
									fontWeight: 500,
									color: '#334155',
									transition: 'all 0.15s ease'
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.background = '#f1f5f9'
									e.currentTarget.style.color = '#1e293b'
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.background = 'transparent'
									e.currentTarget.style.color = '#334155'
								}}
							>
								<KeyRound size={18} style={{ color: '#64748b' }} />
								Change Password
							</button>
						</div>

						{/* Logout section */}
						<div style={{ 
							padding: '8px',
							borderTop: '1px solid #e2e8f0'
						}}>
							<button 
								onClick={() => { logout(); setOpen(false); }} 
								style={{ 
									display: 'flex',
									alignItems: 'center',
									gap: '12px',
									width: '100%', 
									textAlign: 'left', 
									padding: '10px 12px',
									background: 'transparent', 
									border: 'none', 
									cursor: 'pointer',
									borderRadius: 8,
									fontSize: '14px',
									fontWeight: 500,
									color: '#dc2626',
									transition: 'all 0.15s ease'
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.background = '#fef2f2'
									e.currentTarget.style.color = '#b91c1c'
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.background = 'transparent'
									e.currentTarget.style.color = '#dc2626'
								}}
							>
								<LogOut size={18} style={{ color: 'currentColor' }} />
								Logout
							</button>
						</div>
					</div>
				</>
			)}

			<style>{`
				@keyframes slideDown {
					from {
						opacity: 0;
						transform: translateY(-8px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}

				button:focus-visible {
					outline: 2px solid #3b82f6;
					outline-offset: 2px;
				}

				@media (max-width: 768px) {
					/* Make dropdown full width on mobile if needed */
				}
			`}</style>
		</div>
	)
}