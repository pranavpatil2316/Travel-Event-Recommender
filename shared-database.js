// Shared Database API Client for Travel Event Recommender
// This replaces the IndexedDB implementation with a shared database

class SharedEventDatabase {
    constructor() {
        this.baseUrl = window.location.origin;
        this.apiEndpoints = {
            getEvents: '/.netlify/functions/get-events',
            getReviews: '/.netlify/functions/get-reviews',
            submitReview: '/.netlify/functions/submit-review',
            addEvent: '/.netlify/functions/add-event'
        };
    }

    // Event operations
    async getEvents(city = null, category = null) {
        try {
            const params = new URLSearchParams();
            if (city) params.append('city', city);
            if (category) params.append('category', category);

            const response = await fetch(`${this.apiEndpoints.getEvents}?${params}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching events:', error);
            return [];
        }
    }

    async addEvent(event) {
        try {
            const response = await fetch(this.apiEndpoints.addEvent, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.eventId;
        } catch (error) {
            console.error('Error adding event:', error);
            return Date.now(); // Fallback ID
        }
    }

    // Rating operations
    async addRating(eventId, userId, rating) {
        try {
            const response = await fetch(this.apiEndpoints.submitReview, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    eventId: eventId,
                    rating: rating,
                    reviewText: '',
                    userName: 'Anonymous'
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error adding rating:', error);
            throw error;
        }
    }

    async getEventRatings(eventId) {
        try {
            const response = await fetch(`${this.apiEndpoints.getReviews}?eventId=${eventId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.ratingCount || 0;
        } catch (error) {
            console.error('Error getting ratings:', error);
            return 0;
        }
    }

    async getAverageRating(eventId) {
        try {
            const response = await fetch(`${this.apiEndpoints.getReviews}?eventId=${eventId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.averageRating || 0;
        } catch (error) {
            console.error('Error getting average rating:', error);
            return 0;
        }
    }

    // Review operations
    async addReview(eventId, userId, rating, reviewText, userName = 'Anonymous') {
        try {
            const response = await fetch(this.apiEndpoints.submitReview, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    eventId: eventId,
                    rating: rating,
                    reviewText: reviewText,
                    userName: userName
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error adding review:', error);
            throw error;
        }
    }

    async getEventReviews(eventId) {
        try {
            const response = await fetch(`${this.apiEndpoints.getReviews}?eventId=${eventId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.reviews || [];
        } catch (error) {
            console.error('Error getting reviews:', error);
            return [];
        }
    }

    // User operations (simplified for shared database)
    async getOrCreateUser(sessionId) {
        // For shared database, we'll use a simple session-based approach
        return {
            id: sessionId,
            session_id: sessionId
        };
    }

    // Utility methods
    async getEventWithStats(eventId) {
        try {
            const response = await fetch(`${this.apiEndpoints.getReviews}?eventId=${eventId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Get event details from events list
            const events = await this.getEvents();
            const event = events.find(e => e.id == eventId);
            
            if (!event) {
                return null;
            }

            return {
                ...event,
                averageRating: data.averageRating || 0,
                ratingCount: data.ratingCount || 0,
                reviews: data.reviews || []
            };
        } catch (error) {
            console.error('Error getting event with stats:', error);
            return null;
        }
    }

    async getUpcomingEvents(city = null, days = 30) {
        try {
            const events = await this.getEvents(city);
            const now = new Date();
            const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
            
            return events.filter(event => {
                const eventDate = new Date(event.start_time);
                return eventDate > now && eventDate <= futureDate;
            }).sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
        } catch (error) {
            console.error('Error getting upcoming events:', error);
            return [];
        }
    }
}

// Global shared database instance
let sharedEventDB = new SharedEventDatabase();

// Initialize shared database
async function initSharedDatabase() {
    try {
        console.log('Shared database initialized successfully');
        return true;
    } catch (error) {
        console.error('Shared database initialization failed:', error);
        return false;
    }
}

// Generate unique session ID
function generateSessionId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Get or create user session
async function getCurrentUser() {
    let sessionId = localStorage.getItem('userSessionId');
    if (!sessionId) {
        sessionId = generateSessionId();
        localStorage.setItem('userSessionId', sessionId);
    }
    return await sharedEventDB.getOrCreateUser(sessionId);
}

