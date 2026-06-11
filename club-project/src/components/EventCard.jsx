import React, { useState, useEffect } from 'react';

// Mock utility functions for demonstration
const getEventStatus = (event) => ({
    label: 'Open',
    color: '#28a745',
    dotColor: '#28a745'
});

const getTimeUntilDeadline = (deadline) => ({
    expired: false,
    days: 5,
    hours: 12,
    minutes: 30
});

const formatTimeRemaining = (time) => {
    if (time.days > 0) return `${time.days} days remaining`;
    if (time.hours > 0) return `${time.hours} hours remaining`;
    return `${time.minutes} minutes remaining`;
};

const formatEventDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const canRegisterForEvent = (event, userRegistrations) => {
    return true; // Mock implementation
};

// Mock event data for preview
const mockEvent = {
    _id: '1',
    title: 'Tech Conference 2024',
    description: 'Join us for an amazing conference featuring industry leaders and cutting-edge technology discussions.',
    startAt: new Date('2024-12-20T09:00:00'),
    endAt: new Date('2024-12-20T17:00:00'),
    location: 'Convention Center, Downtown',
    registrationDeadline: new Date('2024-12-15T23:59:59'),
    notice: 'Please bring a valid ID for registration check-in.'
};

export default function EventCard({ event = mockEvent, onRegister = () => {}, userRegistrations = [] }) {
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [eventStatus, setEventStatus] = useState(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        // Calculate initial status and time remaining
        setEventStatus(getEventStatus(event));
        setTimeRemaining(getTimeUntilDeadline(event.registrationDeadline));

        // Update countdown every minute
        const interval = setInterval(() => {
            setTimeRemaining(getTimeUntilDeadline(event.registrationDeadline));
            setEventStatus(getEventStatus(event));
        }, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [event]);

    const handleRegister = () => {
        if (canRegisterForEvent(event, userRegistrations)) {
            onRegister(event);
        }
    };

    const canRegister = canRegisterForEvent(event, userRegistrations);
    // Check if user is registered (reg.event is a populated object from API)
    const isRegistered = userRegistrations.some(reg => {
        // The event field is populated, so it's an object with _id
        const regEventId = typeof reg.event === 'object' ? reg.event._id : reg.event;
        const eventId = event._id;
        return String(regEventId) === String(eventId);
    });

    // Debug logging
    if (userRegistrations.length > 0) {
        console.log('EventCard Debug:', {
            eventId: event._id,
            userRegistrations: userRegistrations.map(r => ({ 
                regId: r._id, 
                eventId: r.event ? (typeof r.event === 'object' ? r.event._id : r.event) : null
            })),
            isRegistered: isRegistered
        });
    }

    return (
        <article 
            style={{
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: 16,
                padding: 0,
                marginBottom: 20,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                boxShadow: isHovered 
                    ? '0 12px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)' 
                    : '0 4px 16px rgba(0, 0, 0, 0.06)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isHovered ? 'translateY(-4px)' : 'translateY(0)'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Decorative gradient bar */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: `linear-gradient(90deg, ${eventStatus?.dotColor || '#6c757d'}, ${eventStatus?.dotColor || '#6c757d'}dd)`,
                opacity: 0.8
            }} />

            {/* Content Container */}
            <div style={{ padding: '28px 24px 24px 24px' }}>
                {/* Header Section */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 20,
                    gap: 16
                }}>
                    {/* Title */}
                    <h3 style={{
                        margin: 0,
                        fontSize: 22,
                        fontWeight: '700',
                        color: '#1a1a1a',
                        lineHeight: 1.3,
                        letterSpacing: '-0.02em',
                        flex: 1
                    }}>
                        {event.title}
                    </h3>

                    {/* Status Badge */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 14px',
                        borderRadius: 24,
                        backgroundColor: `${eventStatus?.dotColor || '#6c757d'}15`,
                        border: `1.5px solid ${eventStatus?.dotColor || '#6c757d'}30`,
                        flexShrink: 0
                    }}>
                        <div style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: eventStatus?.dotColor || '#6c757d',
                            boxShadow: `0 0 8px ${eventStatus?.dotColor || '#6c757d'}50`
                        }} />
                        <span style={{
                            fontSize: 12,
                            fontWeight: '600',
                            color: eventStatus?.color || '#6c757d',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            {eventStatus?.label || 'Unknown'}
                        </span>
                    </div>
                </div>

                {/* Event Details Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 12,
                    marginBottom: 20,
                    padding: 16,
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 12,
                    border: '1px solid rgba(0, 0, 0, 0.06)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10
                    }}>
                        <span style={{
                            fontSize: 18,
                            filter: 'grayscale(0.2)'
                        }}>📅</span>
                        <div>
                            <div style={{
                                fontSize: 11,
                                color: '#6c757d',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: 2
                            }}>
                                Start
                            </div>
                            <div style={{
                                fontSize: 14,
                                color: '#2d3748',
                                fontWeight: '500'
                            }}>
                                {formatEventDate(event.startAt)}
                            </div>
                        </div>
                    </div>

                    {event.endAt && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10
                        }}>
                            <span style={{
                                fontSize: 18,
                                filter: 'grayscale(0.2)'
                            }}>🏁</span>
                            <div>
                                <div style={{
                                    fontSize: 11,
                                    color: '#6c757d',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginBottom: 2
                                }}>
                                    End
                                </div>
                                <div style={{
                                    fontSize: 14,
                                    color: '#2d3748',
                                    fontWeight: '500'
                                }}>
                                    {formatEventDate(event.endAt)}
                                </div>
                            </div>
                        </div>
                    )}

                    {event.location && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            gridColumn: event.endAt ? 'auto' : 'span 1'
                        }}>
                            <span style={{
                                fontSize: 18,
                                filter: 'grayscale(0.2)'
                            }}>📍</span>
                            <div>
                                <div style={{
                                    fontSize: 11,
                                    color: '#6c757d',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginBottom: 2
                                }}>
                                    Location
                                </div>
                                <div style={{
                                    fontSize: 14,
                                    color: '#2d3748',
                                    fontWeight: '500'
                                }}>
                                    {event.location}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Description */}
                {event.description && (
                    <p style={{
                        margin: '0 0 20px 0',
                        color: '#4a5568',
                        lineHeight: 1.7,
                        fontSize: 15
                    }}>
                        {event.description}
                    </p>
                )}

                {/* Notice Section */}
                {event.notice && (
                    <div style={{
                        marginBottom: 20,
                        padding: 16,
                        background: 'linear-gradient(135deg, #fff3cd 0%, #fff8e1 100%)',
                        border: '1.5px solid #ffd54f',
                        borderLeft: '4px solid #ffc107',
                        borderRadius: 10,
                        fontSize: 14
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: 8
                        }}>
                            <span style={{ fontSize: 16 }}>📢</span>
                            <strong style={{
                                color: '#856404',
                                fontWeight: '700',
                                fontSize: 13,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Important Notice
                            </strong>
                        </div>
                        <div style={{
                            color: '#856404',
                            lineHeight: 1.6
                        }}>
                            {event.notice}
                        </div>
                    </div>
                )}

                {/* Registration Footer */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 20,
                    borderTop: '1.5px solid rgba(0, 0, 0, 0.08)',
                    gap: 16,
                    flexWrap: 'wrap'
                }}>
                    {/* Time Remaining */}
                    <div style={{ flex: '1 1 200px' }}>
                        {timeRemaining && !timeRemaining.expired ? (
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '8px 14px',
                                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                                borderRadius: 8,
                                border: '1.5px solid #90caf9'
                            }}>
                                <span style={{ fontSize: 16 }}>⏱️</span>
                                <span style={{
                                    fontSize: 13,
                                    color: '#1565c0',
                                    fontWeight: '600'
                                }}>
                                    {formatTimeRemaining(timeRemaining)}
                                </span>
                            </div>
                        ) : (
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '8px 14px',
                                background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
                                borderRadius: 8,
                                border: '1.5px solid #ef5350'
                            }}>
                                <span style={{ fontSize: 16 }}>🔒</span>
                                <span style={{
                                    fontSize: 13,
                                    color: '#c62828',
                                    fontWeight: '600'
                                }}>
                                    Registration Closed
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Action Button */}
                    <div>
                        {isRegistered ? (
                            <button
                                disabled
                                style={{
                                    padding: '12px 28px',
                                    background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 10,
                                    cursor: 'not-allowed',
                                    fontWeight: '600',
                                    fontSize: 14,
                                    opacity: 0.9,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                                    letterSpacing: '0.02em'
                                }}
                            >
                                <span style={{ fontSize: 16 }}>✓</span>
                                Registered
                            </button>
                        ) : canRegister ? (
                            <button
                                onClick={handleRegister}
                                style={{
                                    padding: '12px 28px',
                                    background: isHovered 
                                        ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)' 
                                        : 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 10,
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: 14,
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: isHovered 
                                        ? '0 8px 24px rgba(33, 150, 243, 0.4)' 
                                        : '0 4px 12px rgba(33, 150, 243, 0.3)',
                                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                                    letterSpacing: '0.02em'
                                }}
                            >
                                Register Now →
                            </button>
                        ) : (
                            <button
                                disabled
                                style={{
                                    padding: '12px 28px',
                                    background: 'linear-gradient(135deg, #9e9e9e 0%, #757575 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 10,
                                    cursor: 'not-allowed',
                                    fontWeight: '600',
                                    fontSize: 14,
                                    opacity: 0.7,
                                    letterSpacing: '0.02em'
                                }}
                            >
                                Registrations Closed
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}