import { Routes, Route, Navigate } from 'react-router-dom'
import React from 'react'
import Signup from './pages/Signup.jsx'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import Profile from './pages/Profile.jsx'
import ChangePassword from './pages/ChangePassword.jsx'
import Club from './pages/Club.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminClub from './pages/AdminClub.jsx'
import Layout from './components/Layout.jsx'
import { API_URL } from './lib/api'

function useAuth() {
	const [isAuthenticated, setIsAuthenticated] = React.useState(false)
	const [isChecking, setIsChecking] = React.useState(true)
	const token = localStorage.getItem('token')

	React.useEffect(() => {
		async function validateToken() {
			if (!token) {
				setIsAuthenticated(false)
				setIsChecking(false)
				return
			}

			try {
				// First, check if token is a valid JWT format
				const parts = token.split('.')
				if (parts.length !== 3) {
					throw new Error('Invalid token format')
				}

				// Decode JWT to check expiration (basic client-side check)
				const payload = JSON.parse(atob(parts[1]))
				const expirationTime = payload.exp * 1000 // Convert to milliseconds
				
				if (Date.now() >= expirationTime) {
					// Token expired
					localStorage.removeItem('token')
					setIsAuthenticated(false)
					setIsChecking(false)
					return
				}

				// Validate with backend
				const response = await fetch(`${API_URL}/auth/me`, {
					headers: { Authorization: `Bearer ${token}` }
				})

				if (response.ok) {
					setIsAuthenticated(true)
				} else {
					// Invalid token - clear it
					localStorage.removeItem('token')
					setIsAuthenticated(false)
				}
			} catch (e) {
				// Token invalid or malformed - clear it
				localStorage.removeItem('token')
				setIsAuthenticated(false)
			} finally {
				setIsChecking(false)
			}
		}

		validateToken()
	}, [token])

	return { token, isAuthenticated, isChecking }
}

function ProtectedRoute({ children }) {
	const { isAuthenticated, isChecking } = useAuth()
	
	if (isChecking) {
		// Show loading state while checking token
		return (
			<div style={{ 
				display: 'flex', 
				justifyContent: 'center', 
				alignItems: 'center', 
				height: '100vh',
				fontSize: '16px',
				color: '#666'
			}}>
				Loading...
			</div>
		)
	}
	
	if (!isAuthenticated) {
		return <Navigate to="/signup" replace />
	}
	
	return children
}

function useAdminAuth() {
	const adminToken = localStorage.getItem('adminToken')
	return { adminToken, isAdmin: Boolean(adminToken) }
}

function AdminProtectedRoute({ children }) {
	const { isAdmin } = useAdminAuth()
	if (!isAdmin) return <Navigate to="/admin/login" replace />
	return children
}

export default function App() {
	return (
		<Routes>
			<Route path="/signup" element={<Signup />} />
			<Route path="/login" element={<Login />} />
			 Kalkulado			<Route path="/" element={<ProtectedRoute><Layout><Home /></Layout></ProtectedRoute>} />
			<Route path="/profile/:username" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
			<Route path="/change-password" element={<ProtectedRoute><Layout><ChangePassword /></Layout></ProtectedRoute>} />
			<Route path="/:slug" element={<ProtectedRoute><Layout><Club /></Layout></ProtectedRoute>} />
			{/* Admin */}
			<Route path="/admin/login" element={<AdminLogin />} />
			<Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
			<Route path="/admin/clubs/:id" element={<AdminProtectedRoute><AdminClub /></AdminProtectedRoute>} />
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	)
}
