import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import VerificationModal from '../components/VerificationModal'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export default function Login() {
    const navigate = useNavigate()
    const [form, setForm] = React.useState({ identifier: '', password: '' })
    const [error, setError] = React.useState('')
    const [showVerification, setShowVerification] = React.useState(false)
    const [unverifiedEmail, setUnverifiedEmail] = React.useState('')
    const [isLoading, setIsLoading] = React.useState(false)
    
    async function onSubmit(e) {
        e.preventDefault()
        setError('')
        setIsLoading(true)
        try {
          const res = await fetch(`${API_URL}/auth/login`, {


                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
   identifier: form.identifier,

    password: form.password
})

            })
            const data = await res.json()
            if (!res.ok) {
                // Check if email needs verification
                if (data.requiresVerification && data.email) {
                    setUnverifiedEmail(data.email)
                    setShowVerification(true)
                    setError('Please verify your email first')
                    return
                }
                throw new Error(data.error || 'Login failed')
            }
           // Save JWT token
localStorage.setItem('token', data.token)

// Save user info if backend returns it
if (data.user) {
    localStorage.setItem('userId', data.user._id)
    localStorage.setItem('role', data.user.role)
} else {
    // If user object not returned, decode token to extract ID/role
    try {
        const payload = JSON.parse(atob(data.token.split('.')[1]))
        if (payload.id) localStorage.setItem('userId', payload.id)
        if (payload.role) localStorage.setItem('role', payload.role)
    } catch (e) {
        console.warn("Could not decode token for admin info")
    }
}

navigate('/')

        } catch (err) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerifySuccess = (data) => {
        setShowVerification(false)
        if (data.token) {
            localStorage.setItem('token', data.token)
        }
        navigate('/')
    }

    return (
        <>
            <div className="login-page">
                <div className="login-container">
                    {/* Header */}
                    <div className="login-header">
                        <div className="login-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </div>
                        <h2 className="login-title">Welcome Back</h2>
                        <p className="login-subtitle">Sign in to continue to your account</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={onSubmit} className="login-form">
                        <div className="form-group">
                            <label className="form-label">Email or Username</label>
                            <input 
                                className="form-input"
                                placeholder="Enter your email or username" 
                                value={form.identifier} 
                                onChange={e=>setForm({ ...form, identifier: e.target.value })}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input 
                                className="form-input"
                                placeholder="Enter your password" 
                                type="password" 
                                value={form.password} 
                                onChange={e=>setForm({ ...form, password: e.target.value })}
                                disabled={isLoading}
                            />
                        </div>

                        {error && (
                            <div className="error-message">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                <p>{error}</p>
                            </div>
                        )}

                        <button 
                            type="submit"
                            className={`submit-button ${isLoading ? 'loading' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="divider">
                        <div className="divider-line"></div>
                        <span className="divider-text">OR</span>
                        <div className="divider-line"></div>
                    </div>

                    {/* Sign up link */}
                    <p className="signup-text">
                        Don't have an account?{' '}
                        <Link to="/signup" className="signup-link">
                            Sign up
                        </Link>
                    </p>
                </div>
                
                {showVerification && (
                    <VerificationModal
                        email={unverifiedEmail}
                        onVerify={handleVerifySuccess}
                        onClose={() => setShowVerification(false)}
                    />
                )}
            </div>

            <style jsx>{`
                .login-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 20px;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                }

                .login-container {
                    width: 100%;
                    max-width: 440px;
                    background: rgba(255, 255, 255, 0.98);
                    border-radius: 24px;
                    padding: 48px 40px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    backdrop-filter: blur(10px);
                    animation: slideUp 0.5s ease-out;
                }

                .login-header {
                    text-align: center;
                    margin-bottom: 40px;
                }

                .login-icon {
                    width: 64px;
                    height: 64px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 16px;
                    margin: 0 auto 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
                }

                .login-title {
                    font-size: 32px;
                    font-weight: 700;
                    color: #1a202c;
                    margin: 0 0 8px 0;
                    letter-spacing: -0.5px;
                }

                .login-subtitle {
                    font-size: 15px;
                    color: #718096;
                    margin: 0;
                }

                .login-form {
                    margin-bottom: 24px;
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-label {
                    display: block;
                    font-size: 14px;
                    font-weight: 600;
                    color: #4a5568;
                    margin-bottom: 8px;
                }

                .form-input {
                    display: block;
                    width: 100%;
                    padding: 14px 16px;
                    font-size: 15px;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    outline: none;
                    transition: all 0.2s ease;
                    box-sizing: border-box;
                    font-family: inherit;
                    background: white;
                }

                .form-input:focus {
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }

                .form-input:disabled {
                    background: #f7fafc;
                    cursor: not-allowed;
                }

                .error-message {
                    padding: 14px 16px;
                    background: #fff5f5;
                    border: 1px solid #fc8181;
                    border-radius: 12px;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    animation: shake 0.4s ease-in-out;
                }

                .error-message svg {
                    flex-shrink: 0;
                    stroke: #e53e3e;
                }

                .error-message p {
                    color: #e53e3e;
                    margin: 0;
                    font-size: 14px;
                    font-weight: 500;
                }

                .submit-button {
                    width: 100%;
                    padding: 14px;
                    font-size: 16px;
                    font-weight: 600;
                    color: white;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                    font-family: inherit;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .submit-button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
                }

                .submit-button:active:not(:disabled) {
                    transform: translateY(0);
                }

                .submit-button.loading,
                .submit-button:disabled {
                    background: #a0aec0;
                    cursor: not-allowed;
                    box-shadow: none;
                }

                .spinner {
                    animation: spin 1s linear infinite;
                }

                .divider {
                    display: flex;
                    align-items: center;
                    margin: 24px 0;
                    gap: 12px;
                }

                .divider-line {
                    flex: 1;
                    height: 1px;
                    background: #e2e8f0;
                }

                .divider-text {
                    font-size: 13px;
                    color: #a0aec0;
                    font-weight: 500;
                }

                .signup-text {
                    text-align: center;
                    font-size: 15px;
                    color: #4a5568;
                    margin: 0;
                }

                .signup-link {
                    color: #667eea;
                    text-decoration: none;
                    font-weight: 600;
                    transition: color 0.2s ease;
                }

                .signup-link:hover {
                    color: #764ba2;
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-8px); }
                    75% { transform: translateX(8px); }
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @media (max-width: 640px) {
                    .login-container {
                        padding: 32px 24px;
                    }

                    .login-title {
                        font-size: 28px;
                    }
                }
            `}</style>
        </>
    )
}