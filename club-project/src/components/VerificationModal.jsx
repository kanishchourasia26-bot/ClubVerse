import React from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export default function VerificationModal({ email, onVerify, onClose }) {
	const [code, setCode] = React.useState(['', '', '', '', '', ''])
	const [error, setError] = React.useState('')
	const [loading, setLoading] = React.useState(false)
	const [resendLoading, setResendLoading] = React.useState(false)
	const [resendCooldown, setResendCooldown] = React.useState(60) // 60 seconds cooldown
	const [expiresAt, setExpiresAt] = React.useState(Date.now() + 15 * 60 * 1000) // 15 minutes

	const inputRefs = React.useRef([])

	// Countdown timer for code expiration
	React.useEffect(() => {
		const timer = setInterval(() => {
			setExpiresAt(prev => {
				if (prev <= Date.now()) {
					clearInterval(timer)
					return 0
				}
				return prev
			})
		}, 1000)
		return () => clearInterval(timer)
	}, [])

	// Resend cooldown timer
	React.useEffect(() => {
		if (resendCooldown > 0) {
			const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
			return () => clearTimeout(timer)
		}
	}, [resendCooldown])

	const handleCodeChange = (index, value) => {
		if (!/^\d*$/.test(value)) return // Only numbers
		
		const newCode = [...code]
		newCode[index] = value.slice(-1) // Take only last character
		setCode(newCode)
		setError('')

		// Auto-focus next input
		if (value && index < 5) {
			inputRefs.current[index + 1]?.focus()
		}
	}

	const handleKeyDown = (index, e) => {
		if (e.key === 'Backspace' && !code[index] && index > 0) {
			inputRefs.current[index - 1]?.focus()
		} else if (e.key === 'ArrowLeft' && index > 0) {
			inputRefs.current[index - 1]?.focus()
		} else if (e.key === 'ArrowRight' && index < 5) {
			inputRefs.current[index + 1]?.focus()
		}
	}

	const handlePaste = (e) => {
		e.preventDefault()
		const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
		const newCode = [...code]
		pastedData.split('').forEach((char, i) => {
			if (i < 6) newCode[i] = char
		})
		setCode(newCode)
		if (pastedData.length === 6) {
			inputRefs.current[5]?.focus()
		} else {
			inputRefs.current[pastedData.length]?.focus()
		}
	}

	const handleVerify = async () => {
		const fullCode = code.join('')
		if (fullCode.length !== 6) {
			setError('Please enter the complete 6-digit code')
			return
		}

		setLoading(true)
		setError('')

		try {
			const res = await fetch(`${API_URL}/auth/verify-email`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, code: fullCode })
			})

			const data = await res.json()

			if (!res.ok) {
				throw new Error(data.error || 'Verification failed')
			}

			// Save token and redirect
			if (data.token) {
				localStorage.setItem('token', data.token)
			}

			onVerify(data)
		} catch (err) {
			setError(err.message)
			// Clear code on error
			setCode(['', '', '', '', '', ''])
			inputRefs.current[0]?.focus()
		} finally {
			setLoading(false)
		}
	}

	const handleResend = async () => {
		if (resendCooldown > 0) return

		setResendLoading(true)
		setError('')

		try {
			const res = await fetch(`${API_URL}/auth/resend-verification`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email })
			})

			const data = await res.json()

			if (!res.ok) {
				throw new Error(data.error || 'Failed to resend code')
			}

			setResendCooldown(60)
			setExpiresAt(Date.now() + 15 * 60 * 1000)
			setCode(['', '', '', '', '', ''])
			inputRefs.current[0]?.focus()
			alert('Verification code sent! Please check your email.')
		} catch (err) {
			setError(err.message)
		} finally {
			setResendLoading(false)
		}
	}

	const minutesRemaining = Math.floor((expiresAt - Date.now()) / 60000)
	const secondsRemaining = Math.floor(((expiresAt - Date.now()) % 60000) / 1000)
	const isExpired = expiresAt <= Date.now()

	return (
		<div style={{
			position: 'fixed',
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			background: 'rgba(0,0,0,0.5)',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			zIndex: 1000
		}}>
			<div style={{
				background: 'white',
				padding: 32,
				borderRadius: 12,
				maxWidth: 400,
				width: '90%',
				boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
			}}>
				<h2 style={{ marginTop: 0, marginBottom: 8 }}>Verify Your Email</h2>
				<p style={{ color: '#666', marginBottom: 24 }}>
					We've sent a 6-digit verification code to <strong>{email}</strong>
				</p>

				{isExpired && (
					<div style={{
						background: '#fff3cd',
						border: '1px solid #ffc107',
						borderRadius: 8,
						padding: 12,
						marginBottom: 20,
						color: '#856404'
					}}>
						Code expired. Please request a new one.
					</div>
				)}

				{!isExpired && (
					<div style={{ marginBottom: 16, textAlign: 'center' }}>
						<p style={{ margin: 0, color: '#666', fontSize: 14 }}>
							Code expires in: <strong>{minutesRemaining}:{secondsRemaining.toString().padStart(2, '0')}</strong>
						</p>
					</div>
				)}

				<div style={{
					display: 'flex',
					gap: 8,
					justifyContent: 'center',
					marginBottom: 24
				}}>
					{code.map((digit, index) => (
						<input
							key={index}
							ref={el => inputRefs.current[index] = el}
							type="text"
							inputMode="numeric"
							maxLength={1}
							value={digit}
							onChange={(e) => handleCodeChange(index, e.target.value)}
							onKeyDown={(e) => handleKeyDown(index, e)}
							onPaste={index === 0 ? handlePaste : undefined}
							disabled={loading}
							style={{
								width: 50,
								height: 60,
								textAlign: 'center',
								fontSize: 24,
								fontWeight: 'bold',
								border: error ? '2px solid #dc3545' : '2px solid #ddd',
								borderRadius: 8,
								outline: 'none'
							}}
						/>
					))}
				</div>

				{error && (
					<p style={{ color: '#dc3545', marginBottom: 16, fontSize: 14 }}>{error}</p>
				)}

				<button
					onClick={handleVerify}
					disabled={loading || code.join('').length !== 6 || isExpired}
					style={{
						width: '100%',
						padding: '12px',
						background: loading || code.join('').length !== 6 || isExpired ? '#ccc' : '#007bff',
						color: 'white',
						border: 'none',
						borderRadius: 8,
						fontSize: 16,
						fontWeight: 'bold',
						cursor: loading || code.join('').length !== 6 || isExpired ? 'not-allowed' : 'pointer',
						marginBottom: 12
					}}
				>
					{loading ? 'Verifying...' : 'Verify Email'}
				</button>

				<div style={{ textAlign: 'center' }}>
					<p style={{ margin: 0, color: '#666', fontSize: 14, marginBottom: 8 }}>
						Didn't receive the code?
					</p>
					<button
						onClick={handleResend}
						disabled={resendLoading || resendCooldown > 0}
						style={{
							background: 'transparent',
							border: 'none',
							color: resendCooldown > 0 || resendLoading ? '#999' : '#007bff',
							cursor: resendCooldown > 0 || resendLoading ? 'not-allowed' : 'pointer',
							textDecoration: 'underline',
							fontSize: 14
						}}
					>
						{resendLoading ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
					</button>
				</div>

				{onClose && (
					<button
						onClick={onClose}
						style={{
							marginTop: 16,
							width: '100%',
							padding: '8px',
							background: 'transparent',
							border: '1px solid #ddd',
							borderRadius: 8,
							cursor: 'pointer',
							color: '#666'
						}}
					>
						Change Email
					</button>
				)}
			</div>
		</div>
	)
}
