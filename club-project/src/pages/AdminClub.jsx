import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../lib/api';
import { Shield, LogOut, ArrowLeft, Plus, Edit2, Trash2, Users, Calendar, Image, GraduationCap, Briefcase, Search, X, Check, Clock, MapPin, AlertCircle, ChevronDown, UserPlus, FileText, Eye, Mail } from 'lucide-react';

export default function AdminClub() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [club, setClub] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddMember, setShowAddMember] = useState(false);
    const [newMember, setNewMember] = useState({ identifier: '', designation: 'Member' });
    const [editingMember, setEditingMember] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showCreateEvent, setShowCreateEvent] = useState(false);
    const [events, setEvents] = useState([]);
    // Load activeTab from localStorage or default to 'members'
    const [activeTab, setActiveTab] = useState(() => {
        const savedTab = localStorage.getItem(`adminClubTab_${id}`);
        return savedTab || 'members';
    });
    const [editingEvent, setEditingEvent] = useState(null);
    const [showEditEvent, setShowEditEvent] = useState(false);
    const [eventRegistrations, setEventRegistrations] = useState({}); // eventId -> registrations array
    const [loadingRegistrations, setLoadingRegistrations] = useState({}); // eventId -> loading state
    const [galleryImages, setGalleryImages] = useState([]);
    const [showGalleryUpload, setShowGalleryUpload] = useState(false);
    const [alumni, setAlumni] = useState([]);
    const [showAlumniUpload, setShowAlumniUpload] = useState(false);
    const [hiringStatus, setHiringStatus] = useState(null);
    const [showHiringModal, setShowHiringModal] = useState(false);
    const [applications, setApplications] = useState([]);
    const [showDesignationModal, setShowDesignationModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);

    // Save activeTab to localStorage whenever it changes
    useEffect(() => {
        if (id && activeTab) {
            localStorage.setItem(`adminClubTab_${id}`, activeTab);
        }
    }, [activeTab, id]);

    // Update activeTab when club id changes (switching between clubs)
    useEffect(() => {
        const savedTab = localStorage.getItem(`adminClubTab_${id}`);
        if (savedTab) {
            setActiveTab(savedTab);
        } else {
            setActiveTab('members');
        }
    }, [id]);

    useEffect(() => {
        loadClubAndMembers();
    }, [id]);

    const loadClubAndMembers = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('adminToken');
            const [clubRes, membersRes] = await Promise.all([
                fetch(`${API_URL}/admin/clubs`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${API_URL}/admin/clubs/${id}/members`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            if (!clubRes.ok || !membersRes.ok) {
                throw new Error('Failed to load data');
            }

            const clubData = await clubRes.json();
            const membersData = await membersRes.json();
            
            const currentClub = clubData.clubs.find(c => c._id === id);
            if (!currentClub) {
                throw new Error('Club not found');
            }

            setClub(currentClub);
            setMembers(membersData.members);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const searchUsers = async (query) => {
        console.log('Searching for:', query);
        if (query.length < 2) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }

        setSearchLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            console.log('Token:', token ? 'exists' : 'missing');
            console.log('API URL:', `${API_URL}/admin/users/search?q=${encodeURIComponent(query)}`);
            
            const res = await fetch(`${API_URL}/admin/users/search?q=${encodeURIComponent(query)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('Response status:', res.status);
            if (res.ok) {
                const data = await res.json();
                console.log('Search results:', data);
                setSearchResults(data.users);
                setShowDropdown(true);
            } else {
                const errorData = await res.json();
                console.error('Search API error:', errorData);
            }
        } catch (e) {
            console.error('Search error:', e);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleUserSelect = (user) => {
        setNewMember({ ...newMember, identifier: user.username });
        setShowDropdown(false);
        setSearchResults([]);
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_URL}/admin/clubs/${id}/members`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(newMember)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to add member');
            }

            setNewMember({ identifier: '', designation: 'Member' });
            setShowAddMember(false);
            setSearchResults([]);
            setShowDropdown(false);
            loadClubAndMembers(); // Reload members
        } catch (e) {
            setError(e.message);
        }
    };

    const handleUpdateMember = async (memberId, updates) => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_URL}/admin/memberships/${memberId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update member');
            }

            setEditingMember(null);
            loadClubAndMembers(); // Reload members
        } catch (e) {
            setError(e.message);
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!confirm('Are you sure you want to remove this member?')) return;
        
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_URL}/admin/memberships/${memberId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to remove member');
            }

            loadClubAndMembers(); // Reload members
        } catch (e) {
            setError(e.message);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    const loadEvents = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_URL}/events/club/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.ok) {
                const data = await res.json();
                setEvents(data.events || []);
            }
        } catch (e) {
            console.error('Error loading events:', e);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_URL}/events/${eventId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete event');
            }

            loadEvents();
        } catch (e) {
            alert(e.message);
        }
    };

    const handleUpdateRegistrationDeadline = async (eventId, newDeadline) => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_URL}/events/${eventId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    registrationDeadline: newDeadline
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update registration deadline');
            }

            loadEvents();
            alert('Registration deadline updated successfully!');
        } catch (e) {
            alert(e.message);
        }
    };

    const endRegistrationNow = (event) => {
        if (!confirm('Close registration immediately for this event?')) return;
        const now = new Date().toISOString().slice(0, 16);
        handleUpdateRegistrationDeadline(event._id, now);
    };

    const extendRegistration = (event) => {
        const days = prompt('Extend registration by how many days?', '7');
        if (!days || isNaN(days)) return;
        
        const newDate = new Date(event.registrationDeadline);
        newDate.setDate(newDate.getDate() + parseInt(days));
        const newDeadline = newDate.toISOString().slice(0, 16);
        handleUpdateRegistrationDeadline(event._id, newDeadline);
    };

    const loadEventRegistrations = async (eventId) => {
        setLoadingRegistrations(prev => ({ ...prev, [eventId]: true }));
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_URL}/events/${eventId}/registrations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.ok) {
                const data = await res.json();
                setEventRegistrations(prev => ({ ...prev, [eventId]: data.registrations || [] }));
            }
        } catch (e) {
            console.error('Error loading registrations:', e);
        } finally {
            setLoadingRegistrations(prev => ({ ...prev, [eventId]: false }));
        }
    };

    useEffect(() => {
        if (activeTab === 'events') {
            loadEvents();
        } else if (activeTab === 'gallery') {
            loadGalleryImages();
        } else if (activeTab === 'alumni') {
            loadAlumni();
        } else if (activeTab === 'hiring') {
            loadHiringStatus();
            loadApplications();
        }
    }, [activeTab, id]);

    const loadHiringStatus = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_URL}/admin/clubs/${id}/hiring`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.ok) {
                const data = await res.json();
                setHiringStatus(data.hiringStatus);
            }
        } catch (e) {
            console.error('Error loading hiring status:', e);
        }
    };

    const handleUpdateHiring = async (formData) => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_URL}/admin/clubs/${id}/hiring`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update hiring status');
            }

            loadHiringStatus();
        } catch (e) {
            alert(e.message);
        }
    };

    const loadApplications = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_URL}/admin/clubs/${id}/applications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.ok) {
                const data = await res.json();
                setApplications(data.applications || []);
            }
        } catch (e) {
            console.error('Error loading applications:', e);
        }
    };

    const handleUpdateApplicationStatus = async (applicationId, status, designation = 'Member', rejectionMessage = '') => {
        try {
            const token = localStorage.getItem('adminToken');
            const body = { status };
            if (status === 'approved') {
                body.designation = designation;
            } else if (status === 'rejected') {
                body.rejectionMessage = rejectionMessage;
            }

            const res = await fetch(`${API_URL}/admin/applications/${applicationId}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update application');
            }

            loadApplications();
            loadClubAndMembers(); // Reload members to show newly added member
            setShowDesignationModal(false);
            setShowRejectModal(false);
            setSelectedApplication(null);
            alert(`Application ${status} successfully!`);
        } catch (e) {
            alert(e.message);
        }
    };

    const handleApproveClick = (application) => {
        setSelectedApplication(application);
        setShowDesignationModal(true);
    };

    const handleRejectClick = (application) => {
        setSelectedApplication(application);
        setShowRejectModal(true);
    };

    const handleConfirmReject = async (rejectionMessage) => {
        await handleUpdateApplicationStatus(selectedApplication._id, 'rejected', null, rejectionMessage);
    };

    const loadGalleryImages = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_URL}/admin/clubs/${id}/gallery`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.ok) {
                const data = await res.json();
                setGalleryImages(data.images || []);
            }
        } catch (e) {
            console.error('Error loading gallery images:', e);
        }
    };

    const handleDeleteGalleryImage = async (imageId) => {
        if (!confirm('Are you sure you want to delete this photo?')) return;
        
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_URL}/admin/clubs/${id}/gallery/${imageId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete photo');
            }

            loadGalleryImages();
        } catch (e) {
            alert(e.message);
        }
    };

    const loadAlumni = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_URL}/admin/clubs/${id}/alumni`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.ok) {
                const data = await res.json();
                setAlumni(data.alumni || []);
            }
        } catch (e) {
            console.error('Error loading alumni:', e);
        }
    };

    const handleDeleteAlumni = async (alumniId) => {
        if (!confirm('Are you sure you want to delete this alumnus?')) return;
        
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_URL}/admin/clubs/${id}/alumni/${alumniId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete alumnus');
            }

            loadAlumni();
        } catch (e) {
            alert(e.message);
        }
    };

    // Helper function to determine event status
    const getEventStatus = (event) => {
        const now = new Date();
        const startAt = new Date(event.startAt);
        const endAt = event.endAt ? new Date(event.endAt) : null;
        const registrationDeadline = new Date(event.registrationDeadline);

        if (now < startAt) {
            return { status: 'Upcoming', color: '#ffc107', dot: '●' };
        } else if (endAt && now > endAt) {
            return { status: 'Event Ended', color: '#dc3545', dot: '●' };
        } else if (!endAt && now >= startAt) {
            return { status: 'Live', color: '#28a745', dot: '●' };
        } else if (endAt && now >= startAt && now <= endAt) {
            return { status: 'Live', color: '#28a745', dot: '●' };
        } else {
            return { status: 'Unknown', color: '#6c757d', dot: '●' };
        }
    };

    if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
    if (error) return <div style={{ padding: 20, color: 'red' }}>Error: {error}</div>;
    if (!club) return <div style={{ padding: 20 }}>Club not found</div>;

    
return (
    <div className="admin-club-container">
        <style>{`/* ========================================
   ENHANCED MODAL STYLES
   Modern, accessible, and visually stunning
   ======================================== */

/* Modal Overlay - Backdrop */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
        135deg,
        rgba(15, 23, 42, 0.75) 0%,
        rgba(30, 41, 59, 0.85) 100%
    );
    backdrop-filter: blur(12px) saturate(150%);
    -webkit-backdrop-filter: blur(12px) saturate(150%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 20px;
    animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow-y: auto;
}

/* Modal Content Container */
.modal-content {
    background: linear-gradient(
        135deg,
        rgba(30, 41, 59, 0.95) 0%,
        rgba(15, 23, 42, 0.98) 100%
    );
    padding: 32px;
    border-radius: 24px;
    width: 90%;
    max-width: 620px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 
        0 20px 60px rgba(0, 0, 0, 0.5),
        0 0 0 1px rgba(255, 255, 255, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(59, 130, 246, 0.2);
    position: relative;
    animation: modalSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    transform-origin: center center;
}

/* Smooth Scrollbar Styling */
.modal-content::-webkit-scrollbar {
    width: 8px;
}

.modal-content::-webkit-scrollbar-track {
    background: rgba(15, 23, 42, 0.4);
    border-radius: 10px;
}

.modal-content::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.4);
    border-radius: 10px;
    transition: background 0.3s ease;
}

.modal-content::-webkit-scrollbar-thumb:hover {
    background: rgba(59, 130, 246, 0.6);
}

/* Firefox scrollbar */
.modal-content {
    scrollbar-width: thin;
    scrollbar-color: rgba(59, 130, 246, 0.4) rgba(15, 23, 42, 0.4);
}

/* Optional: Glow effect on modal border */
.modal-content::before {
    content: '';
    position: absolute;
    inset: -2px;
    background: linear-gradient(
        135deg,
        rgba(59, 130, 246, 0.3),
        rgba(147, 51, 234, 0.2),
        rgba(59, 130, 246, 0.3)
    );
    border-radius: 24px;
    opacity: 0;
    z-index: -1;
    transition: opacity 0.3s ease;
    filter: blur(8px);
}

.modal-content:hover::before {
    opacity: 0.6;
}

/* Animations */
@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes modalSlideIn {
    0% {
        transform: scale(0.9) translateY(20px);
        opacity: 0;
    }
    50% {
        transform: scale(1.01) translateY(-2px);
    }
    100% {
        transform: scale(1) translateY(0);
        opacity: 1;
    }
}

/* Close animation (add this class when closing) */
.modal-overlay.closing {
    animation: fadeOut 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.modal-content.closing {
    animation: modalSlideOut 0.3s cubic-bezier(0.4, 0, 0.6, 1) forwards;
}

@keyframes fadeOut {
    from {
        opacity: 1;
    }
    to {
        opacity: 0;
    }
}

@keyframes modalSlideOut {
    from {
        transform: scale(1) translateY(0);
        opacity: 1;
    }
    to {
        transform: scale(0.95) translateY(10px);
        opacity: 0;
    }
}

/* Modal Header Styling (optional enhancement) */
.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.modal-title {
    font-size: 24px;
    font-weight: 700;
    color: #f1f5f9;
    margin: 0;
    letter-spacing: -0.5px;
    background: linear-gradient(135deg, #f1f5f9 0%, #93c5fd 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

/* Close button enhancement (if you have one) */
.modal-close-btn {
    padding: 8px;
    background: rgba(239, 68, 68, 0.1);
    color: #fca5a5;
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
}

.modal-close-btn:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.4);
    transform: rotate(90deg) scale(1.1);
}

/* Modal Footer (optional) */
.modal-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 28px;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
}

/* Enhanced form elements within modals */
.modal-content .form-group {
    margin-bottom: 20px;
}

.modal-content .form-label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #cbd5e1;
    letter-spacing: 0.3px;
}

.modal-content .form-input,
.modal-content .form-select,
.modal-content .form-textarea {
    width: 100%;
    padding: 12px 16px;
    background: rgba(15, 23, 42, 0.8);
    color: #f1f5f9;
    border: 2px solid rgba(100, 116, 139, 0.3);
    border-radius: 12px;
    font-size: 14px;
    transition: all 0.3s ease;
    box-sizing: border-box;
}

.modal-content .form-input:focus,
.modal-content .form-select:focus,
.modal-content .form-textarea:focus {
    outline: none;
    border-color: #3b82f6;
    background: rgba(15, 23, 42, 0.95);
    box-shadow: 
        0 0 0 4px rgba(59, 130, 246, 0.15),
        0 4px 12px rgba(59, 130, 246, 0.2);
    transform: translateY(-1px);
}

/* Mobile Responsive */
@media (max-width: 640px) {
    .modal-overlay {
        padding: 16px;
        align-items: flex-start;
        padding-top: 40px;
    }

    .modal-content {
        padding: 24px 20px;
        border-radius: 20px;
        max-width: 100%;
        width: 100%;
        animation: modalSlideInMobile 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .modal-title {
        font-size: 20px;
    }

    @keyframes modalSlideInMobile {
        from {
            transform: translateY(40px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
}

/* Tablet adjustments */
@media (min-width: 641px) and (max-width: 1024px) {
    .modal-content {
        max-width: 560px;
        padding: 28px 24px;
    }
}

/* Large screens - more breathing room */
@media (min-width: 1440px) {
    .modal-content {
        max-width: 680px;
        padding: 36px 40px;
    }
}

/* Accessibility - Focus visible states */
.modal-overlay:focus-visible,
.modal-content:focus-visible {
    outline: 3px solid rgba(59, 130, 246, 0.6);
    outline-offset: 4px;
}

/* Prevent body scroll when modal is open (add to body tag) */
body.modal-open {
    overflow: hidden;
    padding-right: var(--scrollbar-width, 0);
}

/* Dark mode support (if needed) */
@media (prefers-color-scheme: light) {
    .modal-overlay {
        background: linear-gradient(
            135deg,
            rgba(241, 245, 249, 0.85) 0%,
            rgba(226, 232, 240, 0.9) 100%
        );
    }

    .modal-content {
        background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.98) 0%,
            rgba(248, 250, 252, 0.95) 100%
        );
        border-color: rgba(203, 213, 225, 0.4);
    }

    .modal-title {
        background: linear-gradient(135deg, #0f172a 0%, #3b82f6 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
}

/* Loading state (optional) */
.modal-content.loading {
    opacity: 0.6;
    pointer-events: none;
}

.modal-content.loading::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(15, 23, 42, 0.5);
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% {
        opacity: 0.4;
    }
    50% {
        opacity: 0.7;
    }
}
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
            .admin-club-container { min-height: 100vh; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #cbd5e1 }
            .admin-header { background: rgba(30,41,59,0.8); border-bottom: 1px solid rgba(255,255,255,0.06); padding: 20px 32px; backdrop-filter: blur(10px); display:flex; justify-content:space-between; align-items:center; gap:16px; flex-wrap:wrap; }
            .header-left{ display:flex; gap:12px; align-items:center; flex:1 }
            .back-btn{ padding:10px 18px; background: rgba(59,130,246,0.12); color:#93c5fd; border:1px solid rgba(59,130,246,0.22); border-radius:10px; cursor:pointer; display:flex; align-items:center; gap:8px; font-weight:600 }
            .create-event-btn{ padding:10px 18px; background: linear-gradient(135deg,#10b981 0%,#059669 100%); color:white; border-radius:10px; cursor:pointer; display:flex; align-items:center; gap:8px; font-weight:600 }
            .club-title{ color:#f1f5f9; font-size:20px; font-weight:700; margin:0 }
            .tab-navigation{ display:flex; gap:8px; padding:6px; background: rgba(15,23,42,0.6); border-radius:12px }
            .tab-btn{ padding:10px 16px; background:transparent; color:#94a3b8; border:none; border-radius:8px; cursor:pointer; display:flex; gap:8px; align-items:center; font-weight:600 }
            .tab-btn.active{ background: linear-gradient(135deg,#3b82f6 0%,#2563eb 100%); color:white }
            .logout-btn{ padding:10px 18px; background: rgba(239,68,68,0.12); color:#fca5a5; border-radius:10px; display:flex; gap:8px; align-items:center; cursor:pointer }
            .content-area{ padding:32px; max-width:1400px; margin:0 auto }
            .card{ background: rgba(30,41,59,0.6); border-radius:16px; padding:24px; color:#cbd5e1; margin-bottom:24px }
            .card-header{ display:flex; justify-content:space-between; align-items:center; margin-bottom:16px }
            .card-title{ display:flex; gap:12px; align-items:center; font-weight:700; color:#f1f5f9 }
            .form-label{ display:block; margin-bottom:8px; font-size:14px; font-weight:600; color:#cbd5e1 }
            .form-input, .form-select, .form-textarea{ width:100%; padding:12px 16px; border-radius:10px; border:2px solid rgba(100,116,139,0.15); background:rgba(15,23,42,0.6); color:#f1f5f9 }
            .primary-btn{ padding:10px 20px; background: linear-gradient(135deg,#3b82f6 0%,#2563eb 100%); color:white; border:none; border-radius:10px; cursor:pointer; display:flex; gap:8px; align-items:center; font-weight:600 }
            .success-btn{ padding:8px 16px; background: linear-gradient(135deg,#10b981 0%,#059669 100%); color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600 }
            .danger-btn{ padding:8px 16px; background: linear-gradient(135deg,#ef4444 0%,#dc2626 100%); color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600 }
            .secondary-btn{ padding:8px 16px; background: rgba(100,116,139,0.2); color:#cbd5e1; border:1px solid rgba(100,116,139,0.3); border-radius:8px; cursor:pointer; font-weight:600 }
            .table-container{ overflow-x:auto; border-radius:12px; background: rgba(15,23,42,0.4); padding:8px }
            .modern-table{ width:100%; border-collapse:collapse }
            .modern-table th{ text-align:left; padding:12px; color:#93c5fd; font-weight:700 }
            .modern-table td{ padding:12px; color:#cbd5e1 }
            .badge{ padding:6px 12px; border-radius:20px; font-weight:700 }
            .badge-primary{ background: rgba(59,130,246,0.12); color:#93c5fd }
            .badge-success{ background: rgba(16,185,129,0.12); color:#6ee7b7 }
            .badge-warning{ background: rgba(245,158,11,0.12); color:#fcd34d }
            .badge-danger{ background: rgba(239,68,68,0.12); color:#fca5a5 }
            .gallery-grid{ display:grid; grid-template-columns: repeat(auto-fill,minmax(240px,1fr)); gap:20px }
            .alumni-grid{ display:grid; grid-template-columns: repeat(auto-fill,minmax(200px,1fr)); gap:24px }
            .event-card{ background: rgba(15,23,42,0.6); border-radius:14px; padding:20px; margin-bottom:16px }
            .autocomplete-dropdown{ position:absolute; top:calc(100% + 4px); left:0; right:0; background:#1e293b; border:1px solid rgba(59,130,246,0.3); border-radius:12px; z-index:1000; max-height:280px; overflow-y:auto }
            .autocomplete-item{ padding:14px 16px; display:flex; gap:12px; align-items:center; cursor:pointer; border-bottom:1px solid rgba(255,255,255,0.03) }
            @media (max-width:768px){ .admin-header{ padding:16px 20px } .content-area{ padding:20px } }
        `}</style>

        <header className="admin-header">
            <div className="header-left">
                <button className="back-btn" onClick={() => navigate('/admin')}>
                    <ArrowLeft size={18} /> Back
                </button>
                <button className="create-event-btn" onClick={() => setShowCreateEvent(true)}>
                    <Plus size={18} /> Create Event
                </button>
                <h1 className="club-title">{club.name}</h1>
            </div>

            <div className="tab-navigation" role="tablist" aria-label="Club tabs">
                <button onClick={() => setActiveTab('members')} className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}><Users size={16} /> Members</button>
                <button onClick={() => setActiveTab('events')} className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}><Calendar size={16} /> Events</button>
                <button onClick={() => setActiveTab('gallery')} className={`tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}><Image size={16} /> Gallery</button>
                <button onClick={() => setActiveTab('alumni')} className={`tab-btn ${activeTab === 'alumni' ? 'active' : ''}`}><GraduationCap size={16} /> Alumni</button>
                <button onClick={() => setActiveTab('hiring')} className={`tab-btn ${activeTab === 'hiring' ? 'active' : ''}`}><Briefcase size={16} /> Hiring</button>
            </div>

            <button className="logout-btn" onClick={handleLogout}><LogOut size={18} /> Logout</button>
        </header>

        <div className="content-area">
            {/* Members */}
            {activeTab === 'members' && (
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title"><Users size={24} /> Members ({members.length})</h2>
                        <button className="primary-btn" onClick={() => setShowAddMember(!showAddMember)}><UserPlus size={16} /> {showAddMember ? 'Cancel' : 'Add Member'}</button>
                    </div>

                    {showAddMember && (
                        <form onSubmit={handleAddMember} style={{ display:'grid', gridTemplateColumns:'1fr 240px 140px', gap:12 }}>
                            <div style={{ position:'relative' }}>
                                <label className="form-label">Username or Email</label>
                                <input
                                    className="form-input"
                                    value={newMember.identifier}
                                    onChange={(e) => { setNewMember({ ...newMember, identifier: e.target.value }); searchUsers(e.target.value); }}
                                    onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
                                    onBlur={() => { setTimeout(() => setShowDropdown(false), 200); }}
                                    placeholder="Type to search users..."
                                    required
                                />
                                {showDropdown && (searchResults.length > 0 || searchLoading) && (
                                    <div className="autocomplete-dropdown">
                                        {searchLoading ? <div style={{ padding:12, textAlign:'center' }}>Searching...</div> : (
                                            searchResults.map(user => (
                                                <div key={user._id} className="autocomplete-item" onClick={() => handleUserSelect(user)}>
                                                    <div style={{ width:40, height:40, borderRadius:20, overflow:'hidden', flexShrink:0, background:'rgba(59,130,246,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                                        {user.avatarUrl ? (<img src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `${API_URL.replace('/api','')}${user.avatarUrl}`} alt={user.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />) : (user.name?.[0]?.toUpperCase() || 'U')}
                                                    </div>
                                                    <div style={{ flex:1 }}>
                                                        <div style={{ fontWeight:600 }}>{user.name}</div>
                                                        <div style={{ color:'#94a3b8' }}>@{user.username}</div>
                                                        <div style={{ color:'#6b7280', fontSize:12 }}>{user.email}</div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="form-label">Designation</label>
                                <select className="form-select" value={newMember.designation} onChange={(e) => setNewMember({ ...newMember, designation: e.target.value })}>
                                    <option>President</option>
                                    <option>Vice-President</option>
                                    <option>Treasurer</option>
                                    <option>Secretary</option>
                                    <option>Head</option>
                                    <option>Executive</option>
                                    <option>Member</option>
                                </select>
                            </div>

                            <div style={{ display:'flex', alignItems:'end' }}>
                                <button className="success-btn" type="submit">Add</button>
                            </div>
                        </form>
                    )}

                    <div className="table-container" style={{ marginTop:16 }}>
                        <table className="modern-table" role="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Username</th>
                                    <th>Designation</th>
                                    <th>Joined</th>
                                    <th style={{ textAlign:'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map(member => (
                                    <tr key={member._id}>
                                        <td>{member.user.name}</td>
                                        <td>@{member.user.username}</td>
                                        <td>
                                            {editingMember === member._id ? (
                                                <select className="form-select" value={member.designation} onChange={(e) => handleUpdateMember(member._id, { designation: e.target.value })}>
                                                    <option>President</option>
                                                    <option>Vice-President</option>
                                                    <option>Treasurer</option>
                                                    <option>Secretary</option>
                                                    <option>Head</option>
                                                    <option>Executive</option>
                                                    <option>Member</option>
                                                </select>
                                            ) : (
                                                <span className="badge badge-primary">{member.designation}</span>
                                            )}
                                        </td>
                                        <td>{new Date(member.joinedAt).toLocaleDateString()}</td>
                                        <td style={{ textAlign:'center' }}>
                                            <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
                                                {editingMember === member._id ? (
                                                    <button className="secondary-btn" onClick={() => setEditingMember(null)}>Cancel</button>
                                                ) : (
                                                    <>
                                                        <button className="primary-btn" onClick={() => setEditingMember(member._id)}><Edit2 size={14} /> Edit</button>
                                                        <button className="danger-btn" onClick={() => handleRemoveMember(member._id)}><Trash2 size={14} /> Remove</button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Events */}
            {activeTab === 'events' && (
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title"><Calendar size={24} /> Events ({events.length})</h2>
                        <div style={{ display:'flex', gap:8 }}>
                            <button className="primary-btn" onClick={() => setShowCreateEvent(true)}><Plus size={16} /> New Event</button>
                        </div>
                    </div>

                    {events.length === 0 ? (
                        <div className="empty-state">No events created yet. Click "Create Event" to get started.</div>
                    ) : (
                        <div style={{ display:'grid', gap:16 }}>
                            {events.map(event => (
                                <div key={event._id} className="event-card">
                                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start' }}>
                                        <div style={{ flex:1 }}>
                                            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                                                <h3 style={{ margin:0 }}>{event.title}</h3>
                                                <span style={{ padding:'4px 10px', borderRadius:12, fontWeight:700 }}>
                                                    {getEventStatus(event).status}
                                                </span>
                                            </div>
                                            {event.description && <p style={{ color:'#94a3b8' }}>{event.description.substring(0,150)}{event.description.length>150 ? '...' : ''}</p>}
                                            <div style={{ display:'flex', gap:12, flexWrap:'wrap', color:'#94a3b8' }}>
                                                {event.startAt && <span>📅 {new Date(event.startAt).toLocaleString()}</span>}
                                                {event.endAt && <span>🏁 {new Date(event.endAt).toLocaleString()}</span>}
                                                {event.registrationDeadline && <span>⏰ {new Date(event.registrationDeadline).toLocaleString()}</span>}
                                                {event.location && <span>📍 {event.location}</span>}
                                            </div>
                                        </div>

                                        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                                            <div style={{ display:'flex', gap:8 }}>
                                                <button className="secondary-btn" onClick={() => { setEditingEvent(event); setShowEditEvent(true); }}><Edit2 size={14} /> Edit</button>
                                                <button className="danger-btn" onClick={() => handleDeleteEvent(event._id)}><Trash2 size={14} /> Delete</button>
                                            </div>
                                            <div style={{ display:'flex', gap:8 }}>
                                                <button className="secondary-btn" onClick={() => endRegistrationNow(event)}>End Registration Now</button>
                                                <button className="success-btn" onClick={() => extendRegistration(event)}>Extend Registration</button>
                                            </div>
                                            <div>
                                                <button className="primary-btn" onClick={() => loadEventRegistrations(event._id)}>View Registrations</button>
                                            </div>
                                        </div>
                                    </div>

                                    {eventRegistrations[event._id] !== undefined && (
                                        <div style={{ marginTop:12, padding:12, background:'rgba(255,255,255,0.03)', borderRadius:8 }}>
                                            <h4 style={{ margin:0, marginBottom:8 }}>Registered Users ({eventRegistrations[event._id]?.length || 0})</h4>
                                            {loadingRegistrations[event._id] ? (
                                                <p style={{ margin:0, color:'#9ca3af' }}>Loading...</p>
                                            ) : eventRegistrations[event._id]?.length === 0 ? (
                                                <p style={{ margin:0, color:'#9ca3af' }}>No registrations yet</p>
                                            ) : (
                                                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                                                    {eventRegistrations[event._id].map(reg => (
                                                        <div key={reg._id} style={{ padding:'6px 12px', borderRadius:6, background:'rgba(255,255,255,0.02)' }}>
                                                            <strong>{reg.user.name}</strong> ({reg.user.username})
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Gallery */}
            {activeTab === 'gallery' && (
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title"><Image size={24} /> Gallery</h2>
                        <button className="primary-btn" onClick={() => setShowGalleryUpload(true)}><Plus size={16} /> Upload Photo</button>
                    </div>

                    {galleryImages.length === 0 ? (
                        <div className="empty-state">No photos in gallery yet. Upload some photos to get started.</div>
                    ) : (
                        <div className="gallery-grid">
                            {galleryImages.map(img => (
                                <div key={img._id} className="gallery-item" style={{ position:'relative', borderRadius:12, overflow:'hidden', aspectRatio:'4/3' }}>
                                    <img src={img.imageUrl} alt={img.caption || 'Gallery photo'} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                                    <button onClick={() => handleDeleteGalleryImage(img._id)} className="icon-btn" style={{ position:'absolute', top:12, right:12 }}><Trash2 size={14} /></button>
                                    {img.caption && <p style={{ marginTop:8, color:'#9ca3af' }}>{img.caption}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Alumni */}
            {activeTab === 'alumni' && (
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title"><GraduationCap size={24} /> Alumni</h2>
                        <button className="primary-btn" onClick={() => setShowAlumniUpload(true)}><Plus size={16} /> Add Alumni</button>
                    </div>

                    {alumni.length === 0 ? (
                        <div className="empty-state">No alumni added yet. Click "Add Alumni" to get started.</div>
                    ) : (
                        <div className="alumni-grid">
                            {alumni.map(a => (
                                <div key={a._id} className="alumni-card">
                                    <img src={a.photoUrl} alt={a.name} style={{ width:140, height:140, borderRadius:'50%', objectFit:'cover', border:'4px solid rgba(59,130,246,0.5)' }} />
                                    {a.isFounder && <div className="founder-badge" style={{ marginTop:8 }}>FOUNDER</div>}
                                    <h4 style={{ marginTop:12 }}>{a.name}</h4>
                                    {a.designation && <p style={{ color:'#9ca3af' }}>{a.designation}</p>}
                                    {a.yearGraduated && <p style={{ color:'#6b7280' }}>{a.yearGraduated}</p>}
                                    <button className="danger-btn" onClick={() => handleDeleteAlumni(a._id)} style={{ marginTop:8 }}>Delete</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Hiring */}
            {activeTab === 'hiring' && (
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title"><Briefcase size={24} /> Hiring</h2>
                        <button className="primary-btn" onClick={() => setShowHiringModal(true)}><Plus size={16} /> Manage Hiring</button>
                    </div>

                    {hiringStatus ? (
                        <div className="card" style={{ marginBottom:16 }}>
                            <h3 style={{ marginTop:0 }}>{hiringStatus.isHiring ? '✓ Currently Hiring' : '✗ Not Currently Hiring'}</h3>
                            {hiringStatus.hiringDeadline && <p><strong>Hiring Ends:</strong> {new Date(hiringStatus.hiringDeadline).toLocaleString()}</p>}
                            {hiringStatus.hiringDescription && <p style={{ color:'#9ca3af' }}>{hiringStatus.hiringDescription}</p>}
                        </div>
                    ) : (
                        <div className="empty-state">No hiring status set. Click "Manage Hiring" to begin.</div>
                    )}

                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title"><FileText size={20} /> Applications ({applications.filter(a => a.status === 'pending').length})</h3>
                        </div>
                        <div className="table-container">
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Applied At</th>
                                        <th>Status</th>
                                        <th style={{ textAlign:'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.filter(app => app.status === 'pending').map(app => (
                                        <tr key={app._id}>
                                            <td>{app.user?.name || 'Unknown'}</td>
                                            <td>@{app.user?.username || 'unknown'}</td>
                                            <td>{app.user?.email || '-'}</td>
                                            <td style={{ color:'#9ca3af' }}>{new Date(app.appliedAt).toLocaleString()}</td>
                                            <td>
                                                <span className={`badge ${app.status === 'approved' ? 'badge-success' : app.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                                                    {app.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ textAlign:'center' }}>
                                                <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
                                                    <button className="success-btn" onClick={() => handleApproveClick(app)} disabled={app.status === 'approved'}>Approve</button>
                                                    <button className="danger-btn" onClick={() => handleRejectClick(app)} disabled={app.status === 'rejected'}>Reject</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            )}

        </div>

        {/* Modals preserved from original logic (handlers/forms remain unchanged) */}
        {/* Hiring Modal */}
        {showHiringModal && (
            <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowHiringModal(false); }}>
                <div className="modal-content">
                    <div className="modal-header"><h2 className="modal-title">Manage Hiring</h2></div>
                    <HiringForm 
                        clubId={id}
                        hiringStatus={hiringStatus}
                        onClose={() => setShowHiringModal(false)}
                        onSuccess={() => { setShowHiringModal(false); loadHiringStatus(); }}
                        onSubmit={handleUpdateHiring}
                    />
                </div>
            </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedApplication && (
            <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowRejectModal(false); }}>
                <div className="modal-content">
                    <div className="modal-header"><h2 className="modal-title">Reject Application</h2></div>
                    <div style={{ marginBottom:16 }}>
                        <p><strong>User:</strong> {selectedApplication.user?.name || 'Unknown'}</p>
                        <p><strong>Username:</strong> @{selectedApplication.user?.username || 'unknown'}</p>
                    </div>
                    <div style={{ marginBottom:16 }}>
                        <label style={{ display:'block', marginBottom:8, fontWeight:'bold' }}>Rejection Message (optional)</label>
                        <textarea id="rejection-message" rows={4} placeholder="Enter a message..." className="form-textarea" />
                    </div>
                    <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                        <button className="secondary-btn" onClick={() => { setShowRejectModal(false); setSelectedApplication(null); }}>Cancel</button>
                        <button className="danger-btn" onClick={() => { const msg = document.getElementById('rejection-message').value; handleConfirmReject(msg); }}>Reject</button>
                    </div>
                </div>
            </div>
        )}

        {/* Designation Modal */}
        {showDesignationModal && selectedApplication && (
            <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowDesignationModal(false); }}>
                <div className="modal-content">
                    <div className="modal-header"><h2 className="modal-title">Approve Application</h2></div>
                    <div style={{ marginBottom:16 }}>
                        <p><strong>User:</strong> {selectedApplication.user?.name || 'Unknown'}</p>
                        <p><strong>Username:</strong> @{selectedApplication.user?.username || 'unknown'}</p>
                        <p><strong>Email:</strong> {selectedApplication.user?.email || '-'}</p>
                    </div>
                    <div style={{ marginBottom:16 }}>
                        <label className="form-label">Assign Designation</label>
                        <select id="designation-select" className="form-select">
                            <option>Member</option>
                            <option>Executive</option>
                            <option>Head</option>
                            <option>Secretary</option>
                            <option>Treasurer</option>
                            <option>Vice-President</option>
                            <option>President</option>
                        </select>
                    </div>
                    <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                        <button className="secondary-btn" onClick={() => { setShowDesignationModal(false); setSelectedApplication(null); }}>Cancel</button>
                        <button className="success-btn" onClick={() => { const designation = document.getElementById('designation-select').value; handleUpdateApplicationStatus(selectedApplication._id, 'approved', designation); }}>Approve</button>
                    </div>
                </div>
            </div>
        )}

        {/* Alumni Upload */}
        {showAlumniUpload && (
            <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowAlumniUpload(false); }}>
                <div className="modal-content">
                    <div className="modal-header"><h2 className="modal-title">Add Alumni</h2></div>
                    <AlumniUploadForm clubId={id} onClose={() => setShowAlumniUpload(false)} onSuccess={() => { setShowAlumniUpload(false); loadAlumni(); }} />
                </div>
            </div>
        )}

        {/* Gallery Upload */}
        {showGalleryUpload && (
            <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowGalleryUpload(false); }}>
                <div className="modal-content">
                    <div className="modal-header"><h2 className="modal-title">Upload Gallery Photo</h2></div>
                    <GalleryUploadForm clubId={id} onClose={() => setShowGalleryUpload(false)} onSuccess={() => { setShowGalleryUpload(false); loadGalleryImages(); }} />
                </div>
            </div>
        )}

        {/* Edit Event */}
        {showEditEvent && editingEvent && (
            <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowEditEvent(false); }}>
                <div className="modal-content">
                    <div className="modal-header"><h2 className="modal-title">Edit Event</h2></div>
                    <EventForm clubId={id} event={editingEvent} onClose={() => { setShowEditEvent(false); setEditingEvent(null); }} onSuccess={() => { setShowEditEvent(false); setEditingEvent(null); loadEvents(); }} />
                </div>
            </div>
        )}

        {/* Create Event */}
        {showCreateEvent && (
            <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowCreateEvent(false); }}>
                <div className="modal-content">
                    <div className="modal-header"><h2 className="modal-title">Create New Event</h2></div>
                    <EventForm clubId={id} onClose={() => setShowCreateEvent(false)} onSuccess={() => { setShowCreateEvent(false); loadEvents(); setActiveTab('events'); }} />
                </div>
            </div>
        )}

    </div>
);

}

// Event Creation/Edit Form Component
function EventForm({ clubId, event, onClose, onSuccess }) {
    const isEditing = !!event;
    
    const [formData, setFormData] = useState({
        title: event?.title || '',
        description: event?.description || '',
        notice: event?.notice || '',
        location: event?.location || '',
        startAt: event?.startAt ? new Date(event.startAt).toISOString().slice(0, 16) : '',
        endAt: event?.endAt ? new Date(event.endAt).toISOString().slice(0, 16) : '',
        registrationDeadline: event?.registrationDeadline ? new Date(event.registrationDeadline).toISOString().slice(0, 16) : ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('adminToken');
            const url = isEditing 
                ? `${API_URL}/events/${event._id}`
                : `${API_URL}/events`;
            
            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    clubId,
                    ...formData
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || `Failed to ${isEditing ? 'update' : 'create'} event`);
            }

            onSuccess();
        } catch (e) {
            console.error(`Error ${isEditing ? 'updating' : 'creating'} event:`, e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                    Event Title *
                </label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    style={{
                        width: '100%',
                        padding: 8,
                        border: '1px solid #ddd',
                        borderRadius: 4
                    }}
                />
            </div>

            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                    Description
                </label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    style={{
                        width: '100%',
                        padding: 8,
                        border: '1px solid #ddd',
                        borderRadius: 4
                    }}
                />
            </div>

            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                    Notice Section
                </label>
                <textarea
                    name="notice"
                    value={formData.notice}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Additional event details, requirements, or important notices..."
                    style={{
                        width: '100%',
                        padding: 8,
                        border: '1px solid #ddd',
                        borderRadius: 4
                    }}
                />
            </div>

            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                    Location
                </label>
                <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    style={{
                        width: '100%',
                        padding: 8,
                        border: '1px solid #ddd',
                        borderRadius: 4
                    }}
                />
            </div>

            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                    Event Start Date & Time *
                </label>
                <input
                    type="datetime-local"
                    name="startAt"
                    value={formData.startAt}
                    onChange={handleChange}
                    required
                    style={{
                        width: '100%',
                        padding: 8,
                        border: '1px solid #ddd',
                        borderRadius: 4
                    }}
                />
            </div>

            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                    Event End Date & Time
                </label>
                <input
                    type="datetime-local"
                    name="endAt"
                    value={formData.endAt}
                    onChange={handleChange}
                    style={{
                        width: '100%',
                        padding: 8,
                        border: '1px solid #ddd',
                        borderRadius: 4
                    }}
                />
            </div>

            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                    Registration Deadline *
                </label>
                <input
                    type="datetime-local"
                    name="registrationDeadline"
                    value={formData.registrationDeadline}
                    onChange={handleChange}
                    required
                    style={{
                        width: '100%',
                        padding: 8,
                        border: '1px solid #ddd',
                        borderRadius: 4
                    }}
                />
                <small style={{ color: '#666' }}>
                    Registration will close at this time
                </small>
            </div>

            {error && (
                <div style={{ 
                    color: '#dc3545', 
                    marginBottom: 16, 
                    padding: 8, 
                    background: '#f8d7da', 
                    border: '1px solid #f5c6cb', 
                    borderRadius: 4 
                }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                    type="button"
                    onClick={onClose}
                    style={{
                        padding: '8px 16px',
                        background: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer'
                    }}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '8px 16px',
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1
                    }}
                >
                    {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Event' : 'Create Event')}
                </button>
            </div>
        </form>
    );
}

// Gallery Upload Form Component
function GalleryUploadForm({ clubId, onClose, onSuccess }) {
    const [file, setFile] = useState(null);
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }
            setFile(selectedFile);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a photo');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('adminToken');
            const formData = new FormData();
            formData.append('photo', file);
            if (caption) {
                formData.append('caption', caption);
            }

            const res = await fetch(`${API_URL}/admin/clubs/${clubId}/gallery`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to upload photo');
            }

            onSuccess();
        } catch (e) {
            console.error('Error uploading photo:', e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                    Photo *
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    style={{
                        width: '100%',
                        padding: 8,
                        border: '1px solid #ddd',
                        borderRadius: 4
                    }}
                />
            </div>

            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                    Caption (optional)
                </label>
                <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={3}
                    placeholder="Add a caption for this photo..."
                    style={{
                        width: '100%',
                        padding: 8,
                        border: '1px solid #ddd',
                        borderRadius: 4
                    }}
                />
            </div>

            {error && (
                <div style={{ 
                    color: '#dc3545', 
                    marginBottom: 16, 
                    padding: 8, 
                    background: '#f8d7da', 
                    border: '1px solid #f5c6cb', 
                    borderRadius: 4 
                }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                    type="button"
                    onClick={onClose}
                    style={{
                        padding: '8px 16px',
                        background: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer'
                    }}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '8px 16px',
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1
                    }}
                >
                    {loading ? 'Uploading...' : 'Upload'}
                </button>
            </div>
        </form>
    );
}

// Alumni Upload Form Component
function AlumniUploadForm({ clubId, onClose, onSuccess }) {
    const [file, setFile] = useState(null);
    const [name, setName] = useState('');
    const [designation, setDesignation] = useState('');
    const [yearGraduated, setYearGraduated] = useState('');
    const [isFounder, setIsFounder] = useState(false);
    const [bio, setBio] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }
            setFile(selectedFile);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !name) {
            setError('Please select a photo and enter a name');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('adminToken');
            const formData = new FormData();
            formData.append('photo', file);
            formData.append('name', name);
            if (designation) formData.append('designation', designation);
            if (yearGraduated) formData.append('yearGraduated', yearGraduated);
            formData.append('isFounder', isFounder);
            if (bio) formData.append('bio', bio);

            const res = await fetch(`${API_URL}/admin/clubs/${clubId}/alumni`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to add alumnus');
            }

            onSuccess();
        } catch (e) {
            console.error('Error adding alumnus:', e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                    Photo *
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    style={{
                        width: '100%',
                        padding: 8,
                        border: '1px solid #ddd',
                        borderRadius: 4
                    }}
                />
            </div>

            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                    Name *
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{
                        width: '100%',
                        padding: 8,
                        border: '1px solid #ddd',
                        borderRadius: 4
                    }}
                />
            </div>

            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                    Designation (e.g., Former President)
                </label>
                <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="Former President"
                    style={{
                        width: '100%',
                        padding: 8,
                        border: '1px solid #ddd',
                        borderRadius: 4
                    }}
                />
            </div>

            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                    Year Graduated
                </label>
                <input
                    type="number"
                    value={yearGraduated}
                    onChange={(e) => setYearGraduated(e.target.value)}
                    placeholder="2024"
                    style={{
                        width: '100%',
                        padding: 8,
                        border: '1px solid #ddd',
                        borderRadius: 4
                    }}
                />
            </div>

            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                        type="checkbox"
                        checked={isFounder}
                        onChange={(e) => setIsFounder(e.target.checked)}
                        style={{ width: 16, height: 16 }}
                    />
                    <span style={{ fontWeight: 'bold' }}>Mark as Founder</span>
                </label>
            </div>

            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                    Bio (optional)
                </label>
                <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    placeholder="Brief bio about the alumnus..."
                    style={{
                        width: '100%',
                        padding: 8,
                        border: '1px solid #ddd',
                        borderRadius: 4
                    }}
                />
            </div>

            {error && (
                <div style={{ 
                    color: '#dc3545', 
                    marginBottom: 16, 
                    padding: 8, 
                    background: '#f8d7da', 
                    border: '1px solid #f5c6cb', 
                    borderRadius: 4 
                }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                    type="button"
                    onClick={onClose}
                    style={{
                        padding: '8px 16px',
                        background: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer'
                    }}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '8px 16px',
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1
                    }}
                >
                    {loading ? 'Adding...' : 'Add Alumni'}
                </button>
            </div>
        </form>
    );
}

// Hiring Form Component
function HiringForm({ clubId, hiringStatus, onClose, onSuccess, onSubmit }) {
    const [isHiring, setIsHiring] = useState(hiringStatus?.isHiring || false);
    const [deadline, setDeadline] = useState(
        hiringStatus?.hiringDeadline 
            ? new Date(hiringStatus.hiringDeadline).toISOString().slice(0, 16) 
            : ''
    );
    const [description, setDescription] = useState(hiringStatus?.hiringDescription || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await onSubmit({
                isHiring,
                hiringDeadline: deadline || null,
                hiringDescription: description
            });
            onSuccess();
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                        type="checkbox"
                        checked={isHiring}
                        onChange={(e) => setIsHiring(e.target.checked)}
                        style={{ width: 18, height: 18 }}
                    />
                    <span style={{ fontWeight: 'bold', fontSize: 16 }}>Currently Hiring</span>
                </label>
            </div>

            {isHiring && (
                <>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                            Hiring Deadline
                        </label>
                        <input
                            type="datetime-local"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            style={{
                                width: '100%',
                                padding: 8,
                                border: '1px solid #ddd',
                                borderRadius: 4
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                            Description (optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            placeholder="Add details about the hiring process, requirements, etc..."
                            style={{
                                width: '100%',
                                padding: 8,
                                border: '1px solid #ddd',
                                borderRadius: 4
                            }}
                        />
                    </div>
                </>
            )}

            {error && (
                <div style={{ 
                    color: '#dc3545', 
                    marginBottom: 16, 
                    padding: 8, 
                    background: '#f8d7da', 
                    border: '1px solid #f5c6cb', 
                    borderRadius: 4 
                }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                    type="button"
                    onClick={onClose}
                    style={{
                        padding: '8px 16px',
                        background: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer'
                    }}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '8px 16px',
                        background: isHiring ? '#007bff' : '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1
                    }}
                >
                    {loading ? 'Saving...' : (isHiring ? 'Start Hiring' : 'Stop Hiring')}
                </button>
            </div>
        </form>
    );
}
