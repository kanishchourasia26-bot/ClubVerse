import React from 'react'
import { Shield, User, Lock, AlertCircle, ArrowRight } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export default function AdminLogin() {
	const [form, setForm] = React.useState({ username: '', password: '' })
	const [error, setError] = React.useState('')
	const [msg, setMsg] = React.useState('')
	const [isLoading, setIsLoading] = React.useState(false)

	async function onSubmit(e) {
		e.preventDefault()
		setError('')
		setMsg('')
		setIsLoading(true)
		try {
			const res = await fetch(`${API_URL}/admin/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(form)
			})
			const data = await res.json()
			if (!res.ok) throw new Error(data.error || 'Login failed')
			localStorage.setItem('adminToken', data.token)
			window.location.href = '/admin'
		} catch (e) {
			setError(e.message)
			setIsLoading(false)
		}
	}

	return (
		<div style={{
			minHeight: '100vh',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			padding: '20px',
			background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
			fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
			position: 'relative',
			overflow: 'hidden'
		}}>
			<style>{`
				@keyframes slideUp {
					from {
						opacity: 0;
						transform: translateY(30px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}

				@keyframes fadeIn {
					from { opacity: 0; }
					to { opacity: 1; }
				}

				@keyframes shake {
					0%, 100% { transform: translateX(0); }
					25% { transform: translateX(-10px); }
					75% { transform: translateX(10px); }
				}

				@keyframes pulse {
					0%, 100% { opacity: 0.4; }
					50% { opacity: 0.6; }
				}

				.bg-pattern {
					position: absolute;
					width: 400px;
					height: 400px;
					border-radius: 50%;
					background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
					animation: pulse 4s ease-in-out infinite;
				}

				.input-wrapper {
					position: relative;
					margin-bottom: 20px;
				}

				.input-field {
					width: 100%;
					padding: 14px 16px 14px 48px;
					border: 2px solid #334155;
					border-radius: 12px;
					font-size: 15px;
					transition: all 0.3s ease;
					background: #1e293b;
					color: #f1f5f9;
					box-sizing: border-box;
					outline: none;
				}

				.input-field::placeholder {
					color: #64748b;
				}

				.input-field:focus {
					border-color: #3b82f6;
					background: #0f172a;
					box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
				}

				.input-icon {
					position: absolute;
					left: 16px;
					top: 50%;
					transform: translateY(-50%);
					color: #64748b;
					pointer-events: none;
					transition: color 0.3s ease;
				}

				.input-field:focus + .input-icon {
					color: #3b82f6;
				}

				.submit-btn {
					width: 100%;
					padding: 14px 24px;
					background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
					color: white;
					border: none;
					border-radius: 12px;
					font-size: 16px;
					font-weight: 600;
					cursor: pointer;
					transition: all 0.3s ease;
					box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
					margin-top: 8px;
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 8px;
				}

				.submit-btn:hover:not(:disabled) {
					transform: translateY(-2px);
					box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
				}

				.submit-btn:active:not(:disabled) {
					transform: translateY(0);
				}

				.submit-btn:disabled {
					opacity: 0.7;
					cursor: not-allowed;
				}

				.alert {
					padding: 12px 16px;
					border-radius: 12px;
					margin-top: 20px;
					display: flex;
					align-items: center;
					gap: 12px;
					animation: fadeIn 0.3s ease;
					font-size: 14px;
					font-weight: 500;
				}

				.alert-error {
					background: rgba(239, 68, 68, 0.15);
					color: #fca5a5;
					border: 1px solid rgba(239, 68, 68, 0.3);
					animation: shake 0.5s ease;
				}

				.info-box {
					margin-top: 24px;
					padding: 14px 16px;
					background: rgba(59, 130, 246, 0.1);
					border: 1px solid rgba(59, 130, 246, 0.2);
					border-radius: 12px;
					color: #93c5fd;
					font-size: 13px;
					text-align: center;
					line-height: 1.5;
				}

				@media (max-width: 480px) {
					.admin-card {
						padding: 32px 24px !important;
					}
				}
			`}</style>

			{/* Background decorative elements */}
			<div className="bg-pattern" style={{ top: '-200px', left: '-200px' }}></div>
			<div className="bg-pattern" style={{ bottom: '-200px', right: '-200px', animationDelay: '2s' }}></div>

			<div className="admin-card" style={{
				width: '100%',
				maxWidth: '440px',
				background: 'rgba(30, 41, 59, 0.8)',
				borderRadius: '24px',
				padding: '48px 40px',
				boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
				backdropFilter: 'blur(20px)',
				border: '1px solid rgba(255, 255, 255, 0.1)',
				animation: 'slideUp 0.5s ease-out',
				position: 'relative',
				zIndex: 1
			}}>
				<div style={{ textAlign: 'center', marginBottom: '40px' }}>
					<div style={{
						width: '72px',
						height: '72px',
						background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
						borderRadius: '18px',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						margin: '0 auto 20px',
						boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
						position: 'relative'
					}}>
						<Shield size={36} color="#ffffff" strokeWidth={2.5} />
						<div style={{
							position: 'absolute',
							inset: '-4px',
							background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
							borderRadius: '20px',
							opacity: 0.2,
							filter: 'blur(8px)',
							zIndex: -1
						}}></div>
					</div>
					<h2 style={{
						margin: '0 0 8px 0',
						fontSize: '28px',
						fontWeight: '700',
						color: '#f1f5f9',
						letterSpacing: '-0.5px'
					}}>Admin Portal</h2>
					<p style={{
						margin: 0,
						fontSize: '15px',
						color: '#94a3b8'
					}}>Secure access to administrative controls</p>
				</div>

				<div>
					<div className="input-wrapper">
						<input
							className="input-field"
							placeholder="Username"
							value={form.username}
							onChange={e => setForm({ ...form, username: e.target.value })}
							required
							autoComplete="username"
						/>
						<User size={20} className="input-icon" />
					</div>

					<div className="input-wrapper">
						<input
							className="input-field"
							placeholder="Password"
							type="password"
							value={form.password}
							onChange={e => setForm({ ...form, password: e.target.value })}
							required
							autoComplete="current-password"
						/>
						<Lock size={20} className="input-icon" />
					</div>

					<button 
						type="submit" 
						className="submit-btn" 
						disabled={isLoading}
						onClick={onSubmit}
					>
						{isLoading ? (
							'Authenticating...'
						) : (
							<>
								Sign In
								<ArrowRight size={18} />
							</>
						)}
					</button>
				</div>

				{error && (
					<div className="alert alert-error">
						<AlertCircle size={20} />
						<span>{error}</span>
					</div>
				)}
				{msg && (
					<div className="alert" style={{
						background: 'rgba(34, 197, 94, 0.15)',
						color: '#86efac',
						border: '1px solid rgba(34, 197, 94, 0.3)'
					}}>
						<span>{msg}</span>
					</div>
				)}

				<div className="info-box">
					After successful login, you will be redirected to /admin
				</div>
			</div>
		</div>
	)
}