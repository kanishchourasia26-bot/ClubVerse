// ============================================================
// UPDATED SearchSidebar.jsx - Modern UI Version
// ============================================================
// 
// INSTRUCTIONS:
// 1. Copy this ENTIRE file content
// 2. Replace your existing SearchSidebar.jsx file with this code
// 3. Make sure you have these imports at the top of YOUR file:
//    - import React from 'react'
//    - import { useNavigate } from 'react-router-dom'
//    - import { assetUrl } from '../lib/api.js'
//
// This code is ready to use in your React project!
// ============================================================

// Add these imports to your SearchSidebar.jsx:
// import React from 'react'
// import { useNavigate } from 'react-router-dom'
// import { assetUrl } from '../lib/api.js'
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { assetUrl } from '../lib/api.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export default function SearchSidebar({ open, onClose }) {
	// NOTE: In your actual file, you need to add this import at the top:
	// import { useNavigate } from 'react-router-dom'
	// Then uncomment this line:
	// const navigate = useNavigate()
	
	// For this demo, we'll create a mock navigate function:
	const navigate = useNavigate();

	
	const [q, setQ] = React.useState('')
	const [results, setResults] = React.useState([])
	const [isSearching, setIsSearching] = React.useState(false)

	React.useEffect(() => {
		let active = true
		// NOTE: In your actual file, keep localStorage.getItem('token')
		// For demo purposes, we're using a placeholder
		const token = localStorage.getItem('token');

		
		async function run() {
			if (!q.trim()) { 
				setResults([])
				setIsSearching(false)
				return 
			}
			setIsSearching(true)
			
			// NOTE: In your actual file, this API call will work normally
			// For demo purposes, we'll simulate results:
		const res = await fetch(`${API_URL}/users/search?q=${encodeURIComponent(q)}`, { 
    headers: { Authorization: `Bearer ${token}` } 
});
const data = await res.json();
if (active) {
    setResults(res.ok ? data.users : []);
    setIsSearching(false);
}
			
			/* In your actual file, keep this original code:
			const res = await fetch(`${API_URL}/users/search?q=${encodeURIComponent(q)}`, { 
				headers: { Authorization: `Bearer ${token}` } 
			})
			const data = await res.json()
			if (active) {
				console.log('Search results:', data.users)
				setResults(res.ok ? data.users : [])
				setIsSearching(false)
			}
			*/
		}
		const id = setTimeout(run, 250)
		return () => { active = false; clearTimeout(id) }
	}, [q])

	function goProfile(username) {
		navigate(`/profile/${username}`)
		onClose?.()
	}
	
	// NOTE: In your actual file, you need to import assetUrl:
	// import { assetUrl } from '../lib/api.js'
	// For demo, we'll create a simple version:
	

	return (
		<>
			{/* Backdrop overlay with blur effect */}
			{open && ( 
				<div 
					onClick={onClose}
					style={{
						position: 'fixed',
						inset: 0,
						background: 'rgba(0, 0, 0, 0.4)',
						backdropFilter: 'blur(2px)',
						WebkitBackdropFilter: 'blur(2px)',
						zIndex: 999,
						animation: 'fadeIn 0.2s ease-out',
					}}
				/>
			)}
			
			{/* Sidebar panel */}
			<div
				style={{
					position: 'fixed',
					top: 0,
					left: 0,
					bottom: 0,
					width: '100%',
					maxWidth: 380,
					background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)',
					boxShadow: open ? '4px 0 24px rgba(0, 0, 0, 0.12)' : 'none',
					transform: `translateX(${open ? '0' : '-100%'})`,
					transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
					zIndex: 1000,
					display: 'flex',
					flexDirection: 'column',
					fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
				}}
			>
				{/* Header */}
				<div
					style={{
						padding: '20px 24px',
						borderBottom: '1px solid #e5e7eb',
						background: '#ffffff',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
					}}
				>
					<h3
						style={{
							margin: 0,
							fontSize: '20px',
							fontWeight: 600,
							color: '#111827',
							letterSpacing: '-0.01em',
						}}
					>
						Search Students
					</h3>
					<button
						onClick={onClose}
						style={{
							background: 'transparent',
							border: 'none',
							cursor: 'pointer',
							padding: 8,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							borderRadius: 8,
							color: '#6b7280',
							transition: 'all 0.2s ease',
							fontSize: '24px',
							lineHeight: 1,
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.background = '#f3f4f6'
							e.currentTarget.style.color = '#111827'
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = 'transparent'
							e.currentTarget.style.color = '#6b7280'
						}}
						aria-label="Close search"
					>
						×
					</button>
				</div>

				{/* Search input */}
				<div style={{ padding: '20px 24px' }}>
					<div
						style={{
							position: 'relative',
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<svg
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							style={{
								position: 'absolute',
								left: 14,
								color: '#9ca3af',
								pointerEvents: 'none',
							}}
						>
							<circle cx="11" cy="11" r="8"></circle>
							<path d="m21 21-4.35-4.35"></path>
						</svg>
						<input
							type="text"
							placeholder="Type a username..."
							value={q}
							onChange={(e) => setQ(e.target.value)}
							style={{
								width: '100%',
								padding: '12px 16px 12px 44px',
								fontSize: '15px',
								border: '2px solid #e5e7eb',
								borderRadius: 12,
								outline: 'none',
								transition: 'all 0.2s ease',
								background: '#ffffff',
								color: '#111827',
							}}
							onFocus={(e) => {
								e.target.style.borderColor = '#3b82f6'
								e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
							}}
							onBlur={(e) => {
								e.target.style.borderColor = '#e5e7eb'
								e.target.style.boxShadow = 'none'
							}}
						/>
					</div>
				</div>

				{/* Results list */}
				<div
					style={{
						flex: 1,
						overflowY: 'auto',
						padding: '0 24px 24px',
						display: 'flex',
						flexDirection: 'column',
						gap: 10,
					}}
				>
					{/* Loading state */}
					{isSearching && (
						<div
							style={{
								textAlign: 'center',
								padding: '32px 16px',
								color: '#6b7280',
								fontSize: '14px',
							}}
						>
							<div
								style={{
									width: 32,
									height: 32,
									border: '3px solid #e5e7eb',
									borderTopColor: '#3b82f6',
									borderRadius: '50%',
									margin: '0 auto 12px',
									animation: 'spin 0.8s linear infinite',
								}}
							/>
							Searching...
						</div>
					)}

					{/* Search results */}
					{!isSearching && results.map((u) => (
						<button
							key={u.id}
							onClick={() => goProfile(u.username)}
							style={{
								textAlign: 'left',
								background: '#ffffff',
								border: '1px solid #e5e7eb',
								padding: 14,
								borderRadius: 12,
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								gap: 14,
								transition: 'all 0.2s ease',
								boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.background = '#f9fafb'
								e.currentTarget.style.borderColor = '#d1d5db'
								e.currentTarget.style.transform = 'translateX(4px)'
								e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.07)'
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.background = '#ffffff'
								e.currentTarget.style.borderColor = '#e5e7eb'
								e.currentTarget.style.transform = 'translateX(0)'
								e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.04)'
							}}
						>
							{/* Avatar container */}
							<div
								style={{
									width: 48,
									height: 48,
									borderRadius: 12,
									overflow: 'hidden',
									flexShrink: 0,
									position: 'relative',
									background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
								}}
							>
								{u.avatarUrl && u.avatarUrl.trim() && u.avatarUrl !== 'null' && u.avatarUrl !== 'undefined' && u.avatarUrl !== '' ? (
									<img
										src={assetUrl(u.avatarUrl)}
										alt={u.name}
										width={48}
										height={48}
										style={{
											objectFit: 'cover',
											display: 'block',
											width: '100%',
											height: '100%',
										}}
										onError={(e) => {
											e.target.style.display = 'none'
											e.target.nextSibling.style.display = 'flex'
										}}
									/>
								) : null}
								<div
									style={{
										width: '100%',
										height: '100%',
										background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
										display: u.avatarUrl && u.avatarUrl.trim() && u.avatarUrl !== 'null' && u.avatarUrl !== 'undefined' && u.avatarUrl !== '' ? 'none' : 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										color: '#ffffff',
										fontSize: '18px',
										fontWeight: 600,
										position: 'absolute',
										top: 0,
										left: 0,
									}}
								>
									{u.name?.[0]?.toUpperCase() || 'U'}
								</div>
							</div>

							{/* User info */}
							<div style={{ flex: 1, minWidth: 0 }}>
								<div
									style={{
										fontWeight: 600,
										fontSize: '15px',
										marginBottom: 3,
										color: '#111827',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										whiteSpace: 'nowrap',
									}}
								>
									{u.name}
								</div>
								<div
									style={{
										color: '#6b7280',
										fontSize: '13px',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										whiteSpace: 'nowrap',
									}}
								>
									@{u.username}
								</div>
							</div>

							{/* Arrow indicator */}
							<div
								style={{
									color: '#9ca3af',
									fontSize: '18px',
									transition: 'transform 0.2s ease',
								}}
							>
								→
							</div>
						</button>
					))}

					{/* No results state */}
					{q && !isSearching && results.length === 0 && (
						<div
							style={{
								textAlign: 'center',
								padding: '48px 16px',
								color: '#6b7280',
							}}
						>
							<div
								style={{
									width: 64,
									height: 64,
									borderRadius: '50%',
									background: '#f3f4f6',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									margin: '0 auto 16px',
								}}
							>
								<svg
									width="28"
									height="28"
									viewBox="0 0 24 24"
									fill="none"
									stroke="#9ca3af"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<circle cx="11" cy="11" r="8"></circle>
									<path d="m21 21-4.35-4.35"></path>
								</svg>
							</div>
							<div style={{ fontSize: '15px', fontWeight: 500, marginBottom: 4 }}>
								No results found
							</div>
							<div style={{ fontSize: '13px', color: '#9ca3af' }}>
								Try searching with a different username
							</div>
						</div>
					)}

					{/* Empty state */}
					{!q && !isSearching && (
						<div
							style={{
								textAlign: 'center',
								padding: '48px 16px',
								color: '#9ca3af',
							}}
						>
							<div
								style={{
									width: 64,
									height: 64,
									borderRadius: '50%',
									background: '#f3f4f6',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									margin: '0 auto 16px',
								}}
							>
								<svg
									width="28"
									height="28"
									viewBox="0 0 24 24"
									fill="none"
									stroke="#d1d5db"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<circle cx="11" cy="11" r="8"></circle>
									<path d="m21 21-4.35-4.35"></path>
								</svg>
							</div>
							<div style={{ fontSize: '14px' }}>
								Start typing to search for students
							</div>
						</div>
					)}
				</div>

				{/* Inline styles for animations */}
				<style>{`
					@keyframes fadeIn {
						from { opacity: 0; }
						to { opacity: 1; }
					}
					
					@keyframes spin {
						from { transform: rotate(0deg); }
						to { transform: rotate(360deg); }
					}

					/* Mobile responsiveness */
					@media (max-width: 640px) {
						[style*="maxWidth: 380"] {
							max-width: 100% !important;
						}
					}
				`}</style>
			</div>
		</>
	)
}