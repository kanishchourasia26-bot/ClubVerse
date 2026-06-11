// Event utility functions

// Get event status based on current time
export function getEventStatus(event) {
    const now = new Date();
    const startDate = new Date(event.startAt);
    const endDate = event.endAt ? new Date(event.endAt) : null;
    const regDeadline = new Date(event.registrationDeadline);

    // Check if event has ended (this takes priority)
    if (endDate && now > endDate) {
        return {
            status: 'ended',
            label: 'Event Ended',
            color: '#dc3545',
            dotColor: '#dc3545'
        };
    }

    // Check if event is live (between start and end)
    if (now >= startDate && (!endDate || now <= endDate)) {
        return {
            status: 'live',
            label: 'Live',
            color: '#28a745',
            dotColor: '#28a745'
        };
    }

    // Event is upcoming
    return {
        status: 'upcoming',
        label: 'Upcoming',
        color: '#ffc107',
        dotColor: '#ffc107'
    };
}

// Calculate time remaining until registration deadline
export function getTimeUntilDeadline(deadline) {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;

    if (diff <= 0) {
        return {
            days: 0,
            hours: 0,
            minutes: 0,
            total: 0,
            expired: true
        };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return {
        days,
        hours,
        minutes,
        total: diff,
        expired: false
    };
}

// Format time remaining as string
export function formatTimeRemaining(timeData) {
    if (timeData.expired) {
        return 'Registration Closed';
    }

    const parts = [];
    if (timeData.days > 0) parts.push(`${timeData.days}d`);
    if (timeData.hours > 0) parts.push(`${timeData.hours}h`);
    if (timeData.minutes > 0) parts.push(`${timeData.minutes}m`);

    if (parts.length === 0) {
        return 'Registration Closing Soon';
    }

    return `Registration closes in ${parts.join(' ')}`;
}

// Format event date for display
export function formatEventDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Check if user can register for event
export function canRegisterForEvent(event, userRegistrations = []) {
    const now = new Date();
    const regDeadline = new Date(event.registrationDeadline);
    
    // Registration deadline passed
    if (now > regDeadline) return false;
    
    // Event not open
    if (!event.isOpen) return false;
    
    // User already registered
    const isRegistered = userRegistrations.some(reg => {
        if (!reg.event) return false;
        const regEventId = typeof reg.event === 'object' ? reg.event._id : reg.event;
        return String(regEventId) === String(event._id);
    });
    if (isRegistered) return false;
    
    return true;
}
