import React from 'react'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export default function ChangePassword() {
	const [form, setForm] = React.useState({ currentPassword: '', newPassword: '' })
	const [msg, setMsg] = React.useState('')
	const [error, setError] = React.useState('')
	const [showCurrent, setShowCurrent] = React.useState(false)
	const [showNew, setShowNew] = React.useState(false)
	const [isLoading, setIsLoading] = React.useState(false)

	async function onSubmit(e) {
		e.preventDefault()
		setMsg('')
		setError('')
		setIsLoading(true)
		try {
			const token = localStorage.getItem('token')
			const res = await fetch(`${API_URL}/auth/change-password`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
				body: JSON.stringify(form)
			})
			const data = await res.json()
			if (!res.ok) throw new Error(data.error || 'Failed to change password')
			setMsg('Password changed successfully')
			setForm({ currentPassword: '', newPassword: '' })
		} catch (e) {
			setError(e.message)
		} finally {
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
			background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
			fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
		}}>
			<div style={{
				width: '100%',
				maxWidth: '440px',
				background: 'rgba(255, 255, 255, 0.98)',
				borderRadius: '24px',
				padding: '48px 40px',
				boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
				backdropFilter: 'blur(10px)',
				animation: 'slideUp 0.5s ease-out'
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

					.input-wrapper {
						position: relative;
						margin-bottom: 24px;
					}

					.input-field {
						width: 100%;
						padding: 16px 48px 16px 48px;
						border: 2px solid #e5e7eb;
						border-radius: 12px;
						font-size: 15px;
						transition: all 0.3s ease;
						background: #f9fafb;
						box-sizing: border-box;
						outline: none;
					}

					.input-field:focus {
						border-color: #667eea;
						background: #ffffff;
						box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
					}

					.input-icon {
						position: absolute;
						left: 16px;
						top: 50%;
						transform: translateY(-50%);
						color: #9ca3af;
						pointer-events: none;
					}

					.toggle-password {
						position: absolute;
						right: 16px;
						top: 50%;
						transform: translateY(-50%);
						background: none;
						border: none;
						cursor: pointer;
						color: #9ca3af;
						padding: 4px;
						display: flex;
						align-items: center;
						justify-content: center;
						transition: color 0.2s ease;
					}

					.toggle-password:hover {
						color: #667eea;
					}

					.submit-btn {
						width: 100%;
						padding: 16px;
						background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
						color: white;
						border: none;
						border-radius: 12px;
						font-size: 16px;
						font-weight: 600;
						cursor: pointer;
						transition: all 0.3s ease;
						box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
						margin-top: 8px;
					}

					.submit-btn:hover:not(:disabled) {
						transform: translateY(-2px);
						box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
					}

					.submit-btn:active:not(:disabled) {
						transform: translateY(0);
					}

					.submit-btn:disabled {
						opacity: 0.7;
						cursor: not-allowed;
					}

					.alert {
						padding: 14px 16px;
						border-radius: 12px;
						margin-top: 20px;
						display: flex;
						align-items: center;
						gap: 12px;
						animation: fadeIn 0.3s ease;
						font-size: 14px;
						font-weight: 500;
					}

					.alert-success {
						background: #ecfdf5;
						color: #059669;
						border: 1px solid #a7f3d0;
					}

					.alert-error {
						background: #fef2f2;
						color: #dc2626;
						border: 1px solid #fecaca;
						animation: shake 0.5s ease;
					}

					@media (max-width: 480px) {
						.container {
							padding: 32px 24px !important;
						}
					}
				`}</style>

				<div style={{ textAlign: 'center', marginBottom: '40px' }}>
					<div style={{
						width: '64px',
						height: '64px',
						background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
						borderRadius: '16px',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						margin: '0 auto 20px',
						boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
					}}>
						<Lock size={32} color="#ffffff" />
					</div>
					<h2 style={{
						margin: '0 0 8px 0',
						fontSize: '28px',
						fontWeight: '700',
						color: '#1f2937',
						letterSpacing: '-0.5px'
					}}>Change Password</h2>
					<p style={{
						margin: 0,
						fontSize: '15px',
						color: '#6b7280'
					}}>Keep your account secure with a strong password</p>
				</div>

				<form onSubmit={onSubmit}>
					<div className="input-wrapper">
						<Lock size={20} className="input-icon" />
						<input
							className="input-field"
							placeholder="Current password"
							type={showCurrent ? 'text' : 'password'}
							value={form.currentPassword}
							onChange={e => setForm({ ...form, currentPassword: e.target.value })}
							required
						/>
						<button
							type="button"
							className="toggle-password"
							onClick={() => setShowCurrent(!showCurrent)}
							tabIndex={-1}
						>
							{showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
						</button>
					</div>

					<div className="input-wrapper">
						<Lock size={20} className="input-icon" />
						<input
							className="input-field"
							placeholder="New password"
							type={showNew ? 'text' : 'password'}
							value={form.newPassword}
							onChange={e => setForm({ ...form, newPassword: e.target.value })}
							required
						/>
						<button
							type="button"
							className="toggle-password"
							onClick={() => setShowNew(!showNew)}
							tabIndex={-1}
						>
							{showNew ? <EyeOff size={20} /> : <Eye size={20} />}
						</button>
					</div>

					<button type="submit" className="submit-btn" disabled={isLoading}>
						{isLoading ? 'Updating...' : 'Update Password'}
					</button>
				</form>

				{msg && (
					<div className="alert alert-success">
						<CheckCircle size={20} />
						<span>{msg}</span>
					</div>
				)}
				{error && (
					<div className="alert alert-error">
						<AlertCircle size={20} />
						<span>{error}</span>
					</div>
				)}
			</div>
		</div>
	)
}