import React from 'react'
import { useParams } from 'react-router-dom'
import { API_URL, assetUrl } from '../lib/api.js'
import Cropper from 'react-easy-crop'
import { User, Mail, Instagram, Linkedin, Edit3, Upload, Check, X, Users, Calendar, Briefcase } from 'lucide-react'
import { useNavigate } from 'react-router-dom';


export default function Profile() {
	const { username } = useParams()
	const [user, setUser] = React.useState(null)
	const [error, setError] = React.useState('')
	const [me, setMe] = React.useState(null)
	const [edit, setEdit] = React.useState({ bio: '', skillsText: '', instagram: '', linkedin: '' })
	const [success, setSuccess] = React.useState('')
	const [showCrop, setShowCrop] = React.useState(false)
	const [cropFile, setCropFile] = React.useState(null)
	const [cropPreview, setCropPreview] = React.useState('')
	const [crop, setCrop] = React.useState({ x: 0, y: 0 })
	const [zoom, setZoom] = React.useState(1)
	const [croppedAreaPixels, setCroppedAreaPixels] = React.useState(null)
	const [clubs, setClubs] = React.useState([])
	const [clubsLoading, setClubsLoading] = React.useState(true)

	React.useEffect(() => {
		async function load() {
			setError('')
			try {
				const token = localStorage.getItem('token')
				const res = await fetch(API_URL + `/users/${username}`, {
					headers: { Authorization: `Bearer ${token}` }
				})
				const data = await res.json()
				if (!res.ok) throw new Error(data.error || 'Failed to load profile')
				setUser(data.user)
				const meRes = await fetch(API_URL + '/auth/me', { headers: { Authorization: `Bearer ${token}` } })
				const meData = await meRes.json()
				if (meRes.ok) setMe(meData.user)
				setEdit({
					bio: data.user.bio || '',
					skillsText: (data.user.skills || []).join(', '),
					instagram: data.user.socials?.instagram || '',
					linkedin: data.user.socials?.linkedin || ''
				})
				
				setClubsLoading(true)
				try {
					const clubsRes = await fetch(API_URL + `/users/${username}/clubs`, {
						headers: { Authorization: `Bearer ${token}` }
					})
					const clubsData = await clubsRes.json()
					if (clubsRes.ok) {
						setClubs(clubsData.clubs)
					}
				} catch (e) {
					console.error('Failed to load clubs:', e)
				} finally {
					setClubsLoading(false)
				}
			} catch (e) {
				setError(e.message)
			}
		}
		load()
	}, [username])

	if (error) return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 flex items-center justify-center">
			<div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full border border-red-100">
				<div className="flex items-center gap-3 text-red-600 mb-4">
					<X className="w-6 h-6" />
					<h3 className="text-lg font-semibold">Error</h3>
				</div>
				<p className="text-red-700">{error}</p>
			</div>
		</div>
	)
	
	if (!user) return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 flex items-center justify-center">
			<div className="flex flex-col items-center gap-4">
				<div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
				<p className="text-slate-600 font-medium">Loading profile...</p>
			</div>
		</div>
	)

	const isOwner = me && me.username === user.username

	async function saveChanges(e) {
		e.preventDefault()
		setError('')
		try {
			const token = localStorage.getItem('token')
			const payload = {
				bio: edit.bio,
				skills: edit.skillsText.split(',').map(s => s.trim()).filter(Boolean),
				socials: { instagram: edit.instagram, linkedin: edit.linkedin }
			}
			const res = await fetch(API_URL + '/users/me', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
				body: JSON.stringify(payload)
			})
			const data = await res.json()
			if (!res.ok) throw new Error(data.error || 'Failed to update profile')
			setUser(data.user)
			setSuccess('Profile updated successfully')
			setTimeout(() => setSuccess(''), 3000)
		} catch (e) {
			setError(e.message)
		}
	}

	async function onAvatarChange(e) {
		const file = e.target.files?.[0]
		if (!file) return
		setCropFile(file)
		setShowCrop(true)
		const reader = new FileReader()
		reader.onload = (e) => setCropPreview(e.target.result)
		reader.readAsDataURL(file)
		setCrop({ x: 0, y: 0 })
		setZoom(1)
	}

	async function createCroppedImage(imageSrc, pixelCrop) {
		const image = new Image()
		image.crossOrigin = 'anonymous'
		return new Promise((resolve) => {
			image.onload = () => {
				const canvas = document.createElement('canvas')
				const ctx = canvas.getContext('2d')
				
				canvas.width = 200
				canvas.height = 200
				
				ctx.drawImage(
					image,
					pixelCrop.x,
					pixelCrop.y,
					pixelCrop.width,
					pixelCrop.height,
					0,
					0,
					200,
					200
				)
				
				canvas.toBlob((blob) => {
					resolve(blob)
				}, 'image/jpeg', 0.9)
			}
			image.src = imageSrc
		})
	}

	async function uploadCroppedImage() {
		if (!cropFile || !croppedAreaPixels) return
		setError('')
		setSuccess('')
		try {
			const croppedImageBlob = await createCroppedImage(cropPreview, croppedAreaPixels)
			
			const token = localStorage.getItem('token')
			const fd = new FormData()
			fd.append('avatar', croppedImageBlob, 'cropped-avatar.jpg')
			const res = await fetch(API_URL + '/users/me/avatar', {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` },
				body: fd
			})
			const data = await res.json()
			if (!res.ok) throw new Error(data.error || 'Upload failed')
			const profileRes = await fetch(API_URL + `/users/${username}`, {
				headers: { Authorization: `Bearer ${token}` }
			})
			const profileData = await profileRes.json()
			if (profileRes.ok) setUser(profileData.user)
			
			const meRes = await fetch(API_URL + '/auth/me', { headers: { Authorization: `Bearer ${token}` } })
			const meData = await meRes.json()
			if (meRes.ok) setMe(meData.user)
			window.dispatchEvent(new CustomEvent('avatarUpdated'))
			setSuccess('Profile updated successfully')
			setTimeout(() => setSuccess(''), 3000)
			setShowCrop(false)
			setCropFile(null)
			setCropPreview('')
		} catch (e) {
			setError(e.message)
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
				{/* Success/Error Notifications */}
				{success && (
					<div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in shadow-sm">
						<Check className="w-5 h-5 text-green-600 flex-shrink-0" />
						<p className="text-green-800 font-medium">{success}</p>
					</div>
				)}
				{error && (
					<div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in shadow-sm">
						<X className="w-5 h-5 text-red-600 flex-shrink-0" />
						<p className="text-red-800 font-medium">{error}</p>
					</div>
				)}

				{/* Profile Header Card */}
				<div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-8">
					<div className="h-32 sm:h-40 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600"></div>
					<div className="px-6 sm:px-8 pb-8">
						<div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16 sm:-mt-20">
							<div className="relative group">
								{user?.avatarUrl ? (
									<img 
										src={assetUrl(user.avatarUrl)} 
										alt="avatar" 
										className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-xl ring-2 ring-slate-100"
									/>
								) : (
									<div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 border-4 border-white shadow-xl flex items-center justify-center ring-2 ring-slate-100">
										<User className="w-14 h-14 text-slate-500" />
									</div>
								)}
								{isOwner && (
									<label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-full shadow-lg cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-xl">
										<input type="file" accept="image/*" onChange={onAvatarChange} className="hidden" />
										<Upload className="w-4 h-4" />
									</label>
								)}
							</div>
							
							<div className="flex-1 sm:mb-4">
								<h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">{user.name}</h1>
								<p className="text-slate-600 text-lg mb-3">@{user.username}</p>
								<div className="flex items-center gap-2 text-slate-600">
									<Mail className="w-4 h-4" />
									<span className="text-sm">{user.email}</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Main Content Grid */}
				<div className="grid lg:grid-cols-3 gap-6">
					{/* Left Column - Bio & Skills */}
					<div className="lg:col-span-2 space-y-6">
						{/* Bio Section */}
						<div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 transition-shadow hover:shadow-lg">
							<div className="flex items-center gap-2 mb-4">
								<Edit3 className="w-5 h-5 text-blue-600" />
								<h2 className="text-xl font-semibold text-slate-900">Bio</h2>
							</div>
							{isOwner ? (
								<textarea 
									value={edit.bio} 
									onChange={e=>setEdit({ ...edit, bio: e.target.value })} 
									rows={4} 
									placeholder="Tell us about yourself..."
									className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-slate-700"
								/>
							) : (
								<p className="text-slate-700 leading-relaxed">{user.bio || <span className="text-slate-400 italic">No bio added yet</span>}</p>
							)}
						</div>

						{/* Skills Section */}
						<div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 transition-shadow hover:shadow-lg">
							<div className="flex items-center gap-2 mb-4">
								<Briefcase className="w-5 h-5 text-blue-600" />
								<h2 className="text-xl font-semibold text-slate-900">Skills</h2>
							</div>
							{isOwner ? (
								<input 
									value={edit.skillsText} 
									onChange={e=>setEdit({ ...edit, skillsText: e.target.value })} 
									placeholder="React, Node.js, UI/UX Design, etc."
									className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-700"
								/>
							) : (
								<div className="flex flex-wrap gap-2">
									{(user.skills && user.skills.length) ? user.skills.map((skill, i) => (
										<span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
											{skill}
										</span>
									)) : <span className="text-slate-400 italic">No skills added yet</span>}
								</div>
							)}
						</div>

						{/* Clubs Section */}
						<div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 transition-shadow hover:shadow-lg">
							<div className="flex items-center gap-2 mb-4">
								<Users className="w-5 h-5 text-blue-600" />
								<h2 className="text-xl font-semibold text-slate-900">Clubs</h2>
							</div>
							{clubsLoading ? (
								<div className="flex items-center justify-center py-8">
									<div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
								</div>
							) : clubs.length === 0 ? (
								<p className="text-slate-400 italic py-4">Not enrolled in any clubs yet</p>
							) : (
								<div className="grid sm:grid-cols-2 gap-4">
									{clubs.map(club => (
										<div key={club.id} className="border border-slate-200 rounded-lg p-4 bg-gradient-to-br from-slate-50 to-white hover:shadow-md transition-all group">
											<div className="flex justify-between items-start mb-3">
												<h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{club.name}</h3>
												<span className="px-2.5 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full whitespace-nowrap">
													{club.designation}
												</span>
											</div>
											<p className="text-sm text-slate-600 mb-3 line-clamp-2">
												{club.description || 'No description available'}
											</p>
											<div className="flex items-center gap-1.5 text-xs text-slate-500">
												<Calendar className="w-3.5 h-3.5" />
												<span>Joined {new Date(club.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>

					{/* Right Column - Socials */}
					<div className="lg:col-span-1">
						<div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 transition-shadow hover:shadow-lg sticky top-8">
							<h2 className="text-xl font-semibold text-slate-900 mb-4">Social Links</h2>
							{isOwner ? (
								<div className="space-y-4">
									<div>
										<label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
											<Instagram className="w-4 h-4 text-pink-600" />
											Instagram
										</label>
										<input 
											value={edit.instagram} 
											onChange={e=>setEdit({ ...edit, instagram: e.target.value })} 
											placeholder="https://instagram.com/username"
											className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
										/>
									</div>
									<div>
										<label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
											<Linkedin className="w-4 h-4 text-blue-600" />
											LinkedIn
										</label>
										<input 
											value={edit.linkedin} 
											onChange={e=>setEdit({ ...edit, linkedin: e.target.value })} 
											placeholder="https://linkedin.com/in/username"
											className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
										/>
									</div>
								</div>
							) : (
								<div className="space-y-3">
									{user.socials?.instagram ? (
										<a 
											href={user.socials.instagram} 
											target="_blank" 
											rel="noreferrer"
											className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-pink-300 hover:bg-pink-50 transition-all group"
										>
											<Instagram className="w-5 h-5 text-pink-600" />
											<span className="text-slate-700 group-hover:text-pink-700 font-medium">Instagram</span>
										</a>
									) : null}
									{user.socials?.linkedin ? (
										<a 
											href={user.socials.linkedin} 
											target="_blank" 
											rel="noreferrer"
											className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
										>
											<Linkedin className="w-5 h-5 text-blue-600" />
											<span className="text-slate-700 group-hover:text-blue-700 font-medium">LinkedIn</span>
										</a>
									) : null}
									{!user.socials?.instagram && !user.socials?.linkedin && (
										<p className="text-slate-400 italic text-sm">No social links added</p>
									)}
								</div>
							)}
							
							{isOwner && (
								<button 
									onClick={saveChanges}
									className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2 group"
								>
									<Check className="w-5 h-5 group-hover:scale-110 transition-transform" />
									Save Changes
								</button>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Crop Modal */}
			{showCrop && (
				<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
					<div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
						<div className="p-6 border-b border-slate-200">
							<h2 className="text-2xl font-bold text-slate-900">Crop Your Photo</h2>
							<p className="text-slate-600 mt-1">Adjust the position and zoom to get the perfect profile picture</p>
						</div>
						
						<div className="p-6">
							<div className="relative h-96 bg-slate-900 rounded-xl overflow-hidden mb-6 shadow-inner">
								<Cropper
									image={cropPreview}
									crop={crop}
									zoom={zoom}
									aspect={1}
									onCropChange={setCrop}
									onCropComplete={(croppedArea, croppedAreaPixels) => {
										setCroppedAreaPixels(croppedAreaPixels)
									}}
									onZoomChange={setZoom}
									showGrid={true}
									style={{
										containerStyle: {
											width: '100%',
											height: '100%',
											position: 'relative'
										}
									}}
								/>
							</div>
							
							<div className="mb-6">
								<div className="flex items-center justify-between mb-3">
									<label className="text-sm font-semibold text-slate-700">Zoom Level</label>
									<span className="text-sm font-bold text-blue-600">{Math.round(zoom * 100)}%</span>
								</div>
								<input
									type="range"
									min={1}
									max={3}
									step={0.1}
									value={zoom}
									onChange={(e) => setZoom(Number(e.target.value))}
									className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
								/>
							</div>
						</div>
						
						<div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-3 justify-end rounded-b-2xl">
							<button 
								onClick={() => {
									setShowCrop(false)
									setCropFile(null)
									setCropPreview('')
									setCrop({ x: 0, y: 0 })
									setZoom(1)
								}} 
								className="px-6 py-2.5 border border-slate-300 bg-white text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-all"
							>
								Cancel
							</button>
							<button 
								onClick={uploadCroppedImage}
								className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all hover:shadow-lg flex items-center gap-2"
							>
								<Check className="w-4 h-4" />
								Use This Photo
							</button>
						</div>
					</div>
				</div>
			)}

			<style jsx>{`
				@keyframes fade-in {
					from { opacity: 0; transform: translateY(-10px); }
					to { opacity: 1; transform: translateY(0); }
				}
				.animate-fade-in {
					animation: fade-in 0.3s ease-out;
				}
				.line-clamp-2 {
					display: -webkit-box;
					-webkit-line-clamp: 2;
					-webkit-box-orient: vertical;
					overflow: hidden;
				}
			`}</style>
		</div>
	)
}