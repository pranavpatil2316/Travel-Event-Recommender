// Database management for events, ratings, and reviews
// Using IndexedDB for client-side storage (works offline and online)

class EventDatabase {
    constructor() {
        this.dbName = 'TravelEventDB';
        this.version = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Events table
                if (!db.objectStoreNames.contains('events')) {
                    const eventsStore = db.createObjectStore('events', { keyPath: 'id', autoIncrement: true });
                    eventsStore.createIndex('city', 'city', { unique: false });
                    eventsStore.createIndex('category', 'category', { unique: false });
                    eventsStore.createIndex('start_time', 'start_time', { unique: false });
                }

                // Ratings table
                if (!db.objectStoreNames.contains('ratings')) {
                    const ratingsStore = db.createObjectStore('ratings', { keyPath: 'id', autoIncrement: true });
                    ratingsStore.createIndex('event_id', 'event_id', { unique: false });
                    ratingsStore.createIndex('user_id', 'user_id', { unique: false });
                    ratingsStore.createIndex('rating', 'rating', { unique: false });
                }

                // Reviews table
                if (!db.objectStoreNames.contains('reviews')) {
                    const reviewsStore = db.createObjectStore('reviews', { keyPath: 'id', autoIncrement: true });
                    reviewsStore.createIndex('event_id', 'event_id', { unique: false });
                    reviewsStore.createIndex('user_id', 'user_id', { unique: false });
                    reviewsStore.createIndex('rating', 'rating', { unique: false });
                }

                // Users table (for tracking user sessions)
                if (!db.objectStoreNames.contains('users')) {
                    const usersStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
                    usersStore.createIndex('session_id', 'session_id', { unique: true });
                }
            };
        });
    }

    // Event operations
    async addEvent(event) {
        const transaction = this.db.transaction(['events'], 'readwrite');
        const store = transaction.objectStore('events');
        return new Promise((resolve, reject) => {
            const request = store.add({
                ...event,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getEvents(city = null, category = null) {
        const transaction = this.db.transaction(['events'], 'readonly');
        const store = transaction.objectStore('events');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => {
                let events = request.result;
                
                // Filter by city if specified
                if (city) {
                    events = events.filter(event => 
                        event.city.toLowerCase() === city.toLowerCase()
                    );
                }
                
                // Filter by category if specified
                if (category) {
                    events = events.filter(event => 
                        event.category === category
                    );
                }
                
                resolve(events);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getUpcomingEvents(city = null, days = 30) {
        const transaction = this.db.transaction(['events'], 'readonly');
        const store = transaction.objectStore('events');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => {
                const now = new Date();
                const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
                
                let events = request.result.filter(event => {
                    const eventDate = new Date(event.start_time);
                    return eventDate > now && eventDate <= futureDate;
                });
                
                // Filter by city if specified
                if (city) {
                    events = events.filter(event => 
                        event.city.toLowerCase() === city.toLowerCase()
                    );
                }
                
                // Sort by start time
                events.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
                
                resolve(events);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Rating operations
    async addRating(eventId, userId, rating) {
        const transaction = this.db.transaction(['ratings'], 'readwrite');
        const store = transaction.objectStore('ratings');
        return new Promise((resolve, reject) => {
            const request = store.add({
                event_id: eventId,
                user_id: userId,
                rating: rating,
                created_at: new Date().toISOString()
            });
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getEventRatings(eventId) {
        const transaction = this.db.transaction(['ratings'], 'readonly');
        const store = transaction.objectStore('ratings');
        const index = store.index('event_id');
        return new Promise((resolve, reject) => {
            const request = index.getAll(eventId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAverageRating(eventId) {
        const ratings = await this.getEventRatings(eventId);
        if (ratings.length === 0) return 0;
        
        const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
        return sum / ratings.length;
    }

    // Review operations
    async addReview(eventId, userId, rating, reviewText, userName = 'Anonymous') {
        const transaction = this.db.transaction(['reviews'], 'readwrite');
        const store = transaction.objectStore('reviews');
        return new Promise((resolve, reject) => {
            const request = store.add({
                event_id: eventId,
                user_id: userId,
                rating: rating,
                review_text: reviewText,
                user_name: userName,
                created_at: new Date().toISOString()
            });
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getEventReviews(eventId) {
        const transaction = this.db.transaction(['reviews'], 'readonly');
        const store = transaction.objectStore('reviews');
        const index = store.index('event_id');
        return new Promise((resolve, reject) => {
            const request = index.getAll(eventId);
            request.onsuccess = () => {
                const reviews = request.result;
                // Sort by creation date (newest first)
                reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                resolve(reviews);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // User operations
    async getOrCreateUser(sessionId) {
        const transaction = this.db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');
        const index = store.index('session_id');
        
        return new Promise((resolve, reject) => {
            const request = index.get(sessionId);
            request.onsuccess = () => {
                if (request.result) {
                    resolve(request.result);
                } else {
                    // Create new user
                    const addRequest = store.add({
                        session_id: sessionId,
                        created_at: new Date().toISOString()
                    });
                    addRequest.onsuccess = () => {
                        resolve({ id: addRequest.result, session_id: sessionId });
                    };
                    addRequest.onerror = () => reject(addRequest.error);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Utility methods
    async getEventWithStats(eventId) {
        const transaction = this.db.transaction(['events', 'ratings', 'reviews'], 'readonly');
        const eventsStore = transaction.objectStore('events');
        const ratingsStore = transaction.objectStore('ratings');
        const reviewsStore = transaction.objectStore('reviews');
        
        return new Promise((resolve, reject) => {
            const eventRequest = eventsStore.get(eventId);
            eventRequest.onsuccess = () => {
                const event = eventRequest.result;
                if (!event) {
                    resolve(null);
                    return;
                }

                // Get ratings
                const ratingsIndex = ratingsStore.index('event_id');
                const ratingsRequest = ratingsIndex.getAll(eventId);
                ratingsRequest.onsuccess = () => {
                    const ratings = ratingsRequest.result;
                    const averageRating = ratings.length > 0 ? 
                        ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0;

                    // Get reviews
                    const reviewsIndex = reviewsStore.index('event_id');
                    const reviewsRequest = reviewsIndex.getAll(eventId);
                    reviewsRequest.onsuccess = () => {
                        const reviews = reviewsRequest.result;
                        reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                        resolve({
                            ...event,
                            averageRating: averageRating,
                            ratingCount: ratings.length,
                            reviews: reviews
                        });
                    };
                    reviewsRequest.onerror = () => reject(reviewsRequest.error);
                };
                ratingsRequest.onerror = () => reject(ratingsRequest.error);
            };
            eventRequest.onerror = () => reject(eventRequest.error);
        });
    }
}

// Global database instance
let eventDB = new EventDatabase();

// Initialize database
async function initDatabase() {
    try {
        await eventDB.init();
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Database initialization failed:', error);
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
    return await eventDB.getOrCreateUser(sessionId);
}
