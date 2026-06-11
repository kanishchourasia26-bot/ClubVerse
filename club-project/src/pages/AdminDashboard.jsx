import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, LogOut, AlertCircle, ArrowRight, Layers, Tag } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export default function AdminDashboard() {
	const navigate = useNavigate()
	const [clubs, setClubs] = React.useState([])
	const [error, setError] = React.useState('')

	React.useEffect(() => {
		async function load() {
			setError('')
			try {
				const token = localStorage.getItem('adminToken')
				if (!token) { setError('Not logged in. Go to /admin/login.'); return }
				const res = await fetch(`${API_URL}/admin/clubs`, { headers: { Authorization: `Bearer ${token}` } })
				const data = await res.json()
				if (!res.ok) throw new Error(data.error || 'Failed to load clubs')
				setClubs(data.clubs)
			} catch (e) { setError(e.message) }
		}
		load()
	}, [])

	function logout() {
		localStorage.removeItem('adminToken')
		navigate('/admin/login')
	}

	return (
		<div style={{
			minHeight: '100vh',
			background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
			fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
			padding: '32px 20px'
		}}>
			<style>{`
				@keyframes fadeIn {
					from { opacity: 0; transform: translateY(20px); }
					to { opacity: 1; transform: translateY(0); }
				}

				@keyframes slideIn {
					from { opacity: 0; transform: translateX(-20px); }
					to { opacity: 1; transform: translateX(0); }
				}

				.dashboard-container {
					max-width: 1200px;
					margin: 0 auto;
					animation: fadeIn 0.6s ease-out;
				}

				.header-card {
					background: rgba(30, 41, 59, 0.6);
					border: 1px solid rgba(255, 255, 255, 0.1);
					border-radius: 20px;
					padding: 32px;
					margin-bottom: 32px;
					backdrop-filter: blur(20px);
					box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
				}

				.logout-btn {
					padding: 12px 24px;
					background: rgba(239, 68, 68, 0.15);
					color: #fca5a5;
					border: 1px solid rgba(239, 68, 68, 0.3);
					border-radius: 12px;
					font-size: 14px;
					font-weight: 600;
					cursor: pointer;
					transition: all 0.3s ease;
					display: flex;
					align-items: center;
					gap: 8px;
				}

				.logout-btn:hover {
					background: rgba(239, 68, 68, 0.25);
					border-color: rgba(239, 68, 68, 0.5);
					transform: translateY(-2px);
				}

				.error-alert {
					background: rgba(239, 68, 68, 0.15);
					color: #fca5a5;
					border: 1px solid rgba(239, 68, 68, 0.3);
					border-radius: 16px;
					padding: 16px 20px;
					margin-bottom: 24px;
					display: flex;
					align-items: center;
					gap: 12px;
					font-size: 14px;
					font-weight: 500;
				}

				.clubs-grid {
					display: grid;
					grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
					gap: 20px;
				}

				.club-card {
					background: rgba(30, 41, 59, 0.6);
					border: 1px solid rgba(255, 255, 255, 0.1);
					border-radius: 16px;
					padding: 24px;
					backdrop-filter: blur(20px);
					transition: all 0.3s ease;
					animation: slideIn 0.5s ease-out;
					animation-fill-mode: both;
					box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
				}

				.club-card:hover {
					transform: translateY(-4px);
					border-color: rgba(59, 130, 246, 0.4);
					box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
				}

				.club-name {
					font-size: 18px;
					font-weight: 700;
					color: #f1f5f9;
					margin-bottom: 12px;
					line-height: 1.3;
				}

				.club-meta {
					display: flex;
					flex-wrap: wrap;
					gap: 12px;
					margin-bottom: 20px;
				}

				.meta-badge {
					display: inline-flex;
					align-items: center;
					gap: 6px;
					padding: 6px 12px;
					background: rgba(59, 130, 246, 0.15);
					border: 1px solid rgba(59, 130, 246, 0.3);
					border-radius: 8px;
					color: #93c5fd;
					font-size: 12px;
					font-weight: 500;
				}

				.manage-btn {
					width: 100%;
					padding: 12px 20px;
					background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
					color: white;
					border: none;
					border-radius: 10px;
					font-size: 14px;
					font-weight: 600;
					cursor: pointer;
					transition: all 0.3s ease;
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 8px;
					box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
				}

				.manage-btn:hover {
					transform: translateY(-2px);
					box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
				}

				.manage-btn:active {
					transform: translateY(0);
				}

				.stats-badge {
					display: inline-flex;
					align-items: center;
					justify-content: center;
					min-width: 32px;
					height: 32px;
					padding: 0 12px;
					background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
					color: white;
					border-radius: 10px;
					font-size: 14px;
					font-weight: 700;
					box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
				}

				.empty-state {
					text-align: center;
					padding: 64px 32px;
					background: rgba(30, 41, 59, 0.4);
					border: 2px dashed rgba(255, 255, 255, 0.1);
					border-radius: 20px;
					color: #94a3b8;
					font-size: 16px;
				}

				@media (max-width: 768px) {
					.header-card {
						padding: 24px 20px;
					}
					
					.clubs-grid {
						grid-template-columns: 1fr;
					}
				}
			`}</style>

			<div className="dashboard-container">
				<div className="header-card">
					<div style={{ 
						display: 'flex', 
						justifyContent: 'space-between', 
						alignItems: 'center',
						flexWrap: 'wrap',
						gap: '20px'
					}}>
						<div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
							<div style={{
								width: '56px',
								height: '56px',
								background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
								borderRadius: '14px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)'
							}}>
								<Shield size={28} color="#ffffff" strokeWidth={2.5} />
							</div>
							<div>
								<h2 style={{
									margin: '0 0 4px 0',
									fontSize: '28px',
									fontWeight: '700',
									color: '#f1f5f9',
									letterSpacing: '-0.5px'
								}}>Admin Dashboard</h2>
								<p style={{
									margin: 0,
									fontSize: '14px',
									color: '#94a3b8'
								}}>Managing {clubs.length} club{clubs.length !== 1 ? 's' : ''}</p>
							</div>
						</div>
						<button onClick={logout} className="logout-btn">
							<LogOut size={18} />
							Logout
						</button>
					</div>
				</div>

				{error && (
					<div className="error-alert">
						<AlertCircle size={20} />
						<span>{error}</span>
					</div>
				)}

				{clubs.length === 0 && !error && (
					<div className="empty-state">
						<Layers size={48} style={{ opacity: 0.4, marginBottom: '16px' }} />
						<div>No clubs found</div>
					</div>
				)}

				<div className="clubs-grid">
					{clubs.map((c, index) => (
						<div 
							key={c._id} 
							className="club-card"
							style={{ animationDelay: `${index * 0.1}s` }}
						>
							<div className="club-name">{c.name}</div>
							<div className="club-meta">
								<span className="meta-badge">
									<Tag size={14} />
									{c.slug}
								</span>
								<span className="meta-badge">
									<Layers size={14} />
									{c.category}
								</span>
							</div>
							<button 
								onClick={() => navigate(`/admin/clubs/${c._id}`)}
								className="manage-btn"
							>
								Manage Club
								<ArrowRight size={16} />
							</button>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}