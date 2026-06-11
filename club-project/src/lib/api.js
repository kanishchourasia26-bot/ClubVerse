export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export function assetUrl(path) {
	if (!path) return ''
	// If already absolute (http/https), return as is
	if (/^https?:\/\//i.test(path)) return path
	// If starts with '/', prefix with backend origin derived from API_URL
	const origin = API_URL.replace(/\/?api\/?$/, '')
	return path.startsWith('/') ? origin + path : `${origin}/${path}`
}








