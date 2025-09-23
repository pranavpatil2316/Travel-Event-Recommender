// Advanced Recommendation Engine for Travel Event Recommender
// Implements collaborative filtering, content-based filtering, and user preference learning

class RecommendationEngine {
    constructor() {
        this.userPreferences = new Map(); // Store user preferences
        this.eventSimilarity = new Map(); // Store event similarity scores
        this.userSimilarity = new Map(); // Store user similarity scores
        this.recommendationCache = new Map(); // Cache recommendations
    }

    // Initialize user preferences from their rating history
    async initializeUserPreferences(userId) {
        try {
            const userRatings = await this.getUserRatings(userId);
            const preferences = this.calculateUserPreferences(userRatings);
            this.userPreferences.set(userId, preferences);
            return preferences;
        } catch (error) {
            console.error('Error initializing user preferences:', error);
            return this.getDefaultPreferences();
        }
    }

    // Get user's rating history
    async getUserRatings(userId) {
        try {
            // Get all ratings for the user
            const response = await fetch(`/.netlify/functions/get-user-ratings?userId=${userId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch user ratings');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching user ratings:', error);
            console.log('Falling back to empty ratings for user:', userId);
            return [];
        }
    }

    // Calculate user preferences based on their ratings
    calculateUserPreferences(userRatings) {
        const preferences = {
            categories: {},
            indoorOutdoor: { indoor: 0, outdoor: 0 },
            averageRating: 0,
            totalRatings: userRatings.length,
            preferredCities: {},
            preferredSeasons: {},
            ratingPattern: {}
        };

        if (userRatings.length === 0) {
            return this.getDefaultPreferences();
        }

        // Analyze rating patterns
        userRatings.forEach(rating => {
            const event = rating.event;
            const score = rating.rating;

            // Category preferences
            if (!preferences.categories[event.category]) {
                preferences.categories[event.category] = { total: 0, count: 0, avg: 0 };
            }
            preferences.categories[event.category].total += score;
            preferences.categories[event.category].count += 1;
            preferences.categories[event.category].avg = 
                preferences.categories[event.category].total / preferences.categories[event.category].count;

            // Indoor/Outdoor preferences
            preferences.indoorOutdoor[event.indoor_outdoor] += score;

            // City preferences
            if (!preferences.preferredCities[event.city]) {
                preferences.preferredCities[event.city] = { total: 0, count: 0, avg: 0 };
            }
            preferences.preferredCities[event.city].total += score;
            preferences.preferredCities[event.city].count += 1;
            preferences.preferredCities[event.city].avg = 
                preferences.preferredCities[event.city].total / preferences.preferredCities[event.city].count;

            // Rating pattern analysis
            if (!preferences.ratingPattern[score]) {
                preferences.ratingPattern[score] = 0;
            }
            preferences.ratingPattern[score] += 1;
        });

        // Calculate overall average rating
        preferences.averageRating = userRatings.reduce((sum, r) => sum + r.rating, 0) / userRatings.length;

        return preferences;
    }

    // Get default preferences for new users
    getDefaultPreferences() {
        return {
            categories: {
                'Art & Culture': { avg: 3.5 },
                'History & Heritage': { avg: 3.5 },
                'Nature & Parks': { avg: 3.5 },
                'Food & Drink': { avg: 3.5 },
                'Adventure & Sports': { avg: 3.5 },
                'Shopping & Fashion': { avg: 3.5 },
                'Entertainment': { avg: 3.5 },
                'Sightseeing': { avg: 3.5 }
            },
            indoorOutdoor: { indoor: 3.5, outdoor: 3.5 },
            averageRating: 3.5,
            totalRatings: 0,
            preferredCities: {},
            preferredSeasons: {},
            ratingPattern: {}
        };
    }

    // Collaborative Filtering: Find similar users
    async findSimilarUsers(userId, limit = 10) {
        try {
            const allUsers = await this.getAllUsers();
            const userPreferences = this.userPreferences.get(userId);
            
            if (!userPreferences || userPreferences.totalRatings < 3) {
                return []; // Need at least 3 ratings for meaningful similarity
            }

            const similarities = [];

            for (const otherUserId of allUsers) {
                if (otherUserId === userId) continue;

                const otherPreferences = this.userPreferences.get(otherUserId);
                if (!otherPreferences || otherPreferences.totalRatings < 3) continue;

                const similarity = this.calculateUserSimilarity(userPreferences, otherPreferences);
                if (similarity > 0.3) { // Only consider users with >30% similarity
                    similarities.push({
                        userId: otherUserId,
                        similarity: similarity,
                        preferences: otherPreferences
                    });
                }
            }

            return similarities
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, limit);
        } catch (error) {
            console.error('Error finding similar users:', error);
            return [];
        }
    }

    // Calculate similarity between two users using Pearson correlation
    calculateUserSimilarity(user1Prefs, user2Prefs) {
        const categories1 = user1Prefs.categories;
        const categories2 = user2Prefs.categories;

        // Find common categories
        const commonCategories = Object.keys(categories1).filter(cat => 
            categories2[cat] && categories1[cat].count > 0 && categories2[cat].count > 0
        );

        if (commonCategories.length < 2) return 0;

        // Calculate Pearson correlation coefficient
        const n = commonCategories.length;
        let sum1 = 0, sum2 = 0, sum1Sq = 0, sum2Sq = 0, pSum = 0;

        commonCategories.forEach(category => {
            const rating1 = categories1[category].avg;
            const rating2 = categories2[category].avg;
            
            sum1 += rating1;
            sum2 += rating2;
            sum1Sq += rating1 * rating1;
            sum2Sq += rating2 * rating2;
            pSum += rating1 * rating2;
        });

        const num = pSum - (sum1 * sum2 / n);
        const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));

        return den === 0 ? 0 : num / den;
    }

    // Get all users from the database
    async getAllUsers() {
        try {
            const response = await fetch('/.netlify/functions/get-all-users');
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    }

    // Content-based filtering: Find similar events
    calculateEventSimilarity(event1, event2) {
        let similarity = 0;
        let factors = 0;

        // Category similarity
        if (event1.category === event2.category) {
            similarity += 0.4;
        }
        factors += 0.4;

        // Indoor/Outdoor similarity
        if (event1.indoor_outdoor === event2.indoor_outdoor) {
            similarity += 0.2;
        }
        factors += 0.2;

        // City similarity
        if (event1.city === event2.city) {
            similarity += 0.2;
        }
        factors += 0.2;

        // Description similarity (simple keyword matching)
        const desc1 = (event1.description || '').toLowerCase();
        const desc2 = (event2.description || '').toLowerCase();
        const keywords1 = desc1.split(' ');
        const keywords2 = desc2.split(' ');
        const commonKeywords = keywords1.filter(word => keywords2.includes(word));
        const descSimilarity = commonKeywords.length / Math.max(keywords1.length, keywords2.length);
        similarity += descSimilarity * 0.2;
        factors += 0.2;

        return factors > 0 ? similarity / factors : 0;
    }

    // Generate personalized recommendations
    async generateRecommendations(userId, country = null, city = null, limit = 10) {
        try {
            // Check cache first
            const cacheKey = `${userId}_${country}_${city}`;
            if (this.recommendationCache.has(cacheKey)) {
                const cached = this.recommendationCache.get(cacheKey);
                if (Date.now() - cached.timestamp < 300000) { // 5 minutes cache
                    return cached.recommendations;
                }
            }

            const userPreferences = this.userPreferences.get(userId) || await this.initializeUserPreferences(userId);
            const allEvents = await this.getAllEvents(country, city);
            
            // Filter out events user has already rated
            const userRatings = await this.getUserRatings(userId);
            const ratedEventIds = new Set(userRatings.map(r => r.event.id));
            const unratedEvents = allEvents.filter(event => !ratedEventIds.has(event.id));

            // Generate recommendations using multiple approaches
            const collaborativeRecs = await this.getCollaborativeRecommendations(userId, unratedEvents, limit);
            const contentBasedRecs = this.getContentBasedRecommendations(userPreferences, unratedEvents, limit);
            const hybridRecs = this.combineRecommendations(collaborativeRecs, contentBasedRecs, limit);

            // Cache results
            this.recommendationCache.set(cacheKey, {
                recommendations: hybridRecs,
                timestamp: Date.now()
            });

            return hybridRecs;
        } catch (error) {
            console.error('Error generating recommendations:', error);
            return [];
        }
    }

    // Collaborative filtering recommendations
    async getCollaborativeRecommendations(userId, events, limit) {
        const similarUsers = await this.findSimilarUsers(userId, 5);
        if (similarUsers.length === 0) return [];

        const recommendations = [];
        const eventScores = new Map();

        // Get ratings from similar users
        for (const similarUser of similarUsers) {
            const userRatings = await this.getUserRatings(similarUser.userId);
            
            userRatings.forEach(rating => {
                if (rating.rating >= 4) { // Only consider high ratings
                    const eventId = rating.event.id;
                    if (!eventScores.has(eventId)) {
                        eventScores.set(eventId, { score: 0, count: 0 });
                    }
                    const current = eventScores.get(eventId);
                    current.score += rating.rating * similarUser.similarity;
                    current.count += 1;
                }
            });
        }

        // Calculate final scores and sort
        for (const [eventId, data] of eventScores) {
            const event = events.find(e => e.id === eventId);
            if (event) {
                recommendations.push({
                    event: event,
                    score: data.score / data.count,
                    reason: 'Users with similar tastes also liked this',
                    type: 'collaborative'
                });
            }
        }

        return recommendations
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    // Content-based filtering recommendations
    getContentBasedRecommendations(userPreferences, events, limit) {
        const recommendations = [];

        events.forEach(event => {
            let score = 0;
            let reasons = [];

            // Category preference score
            const categoryPref = userPreferences.categories[event.category];
            if (categoryPref && categoryPref.avg > 3.5) {
                score += categoryPref.avg * 0.4;
                reasons.push(`You rate ${event.category} events highly`);
            }

            // Indoor/Outdoor preference
            const indoorOutdoorPref = userPreferences.indoorOutdoor[event.indoor_outdoor];
            if (indoorOutdoorPref > 3.5) {
                score += indoorOutdoorPref * 0.2;
                reasons.push(`You prefer ${event.indoor_outdoor} activities`);
            }

            // City preference
            const cityPref = userPreferences.preferredCities[event.city];
            if (cityPref && cityPref.avg > 3.5) {
                score += cityPref.avg * 0.2;
                reasons.push(`You've enjoyed events in ${event.city}`);
            }

            // Overall rating pattern
            if (userPreferences.averageRating > 3.5) {
                score += userPreferences.averageRating * 0.2;
            }

            if (score > 0) {
                recommendations.push({
                    event: event,
                    score: score,
                    reason: reasons.join(', '),
                    type: 'content-based'
                });
            }
        });

        return recommendations
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    // Combine different recommendation approaches
    combineRecommendations(collaborativeRecs, contentBasedRecs, limit) {
        const combined = new Map();

        // Add collaborative recommendations with higher weight for diversity
        collaborativeRecs.forEach(rec => {
            const eventId = rec.event.id;
            if (!combined.has(eventId)) {
                combined.set(eventId, {
                    event: rec.event,
                    score: rec.score * 0.6, // Collaborative weight
                    reasons: [rec.reason],
                    types: [rec.type]
                });
            }
        });

        // Add content-based recommendations
        contentBasedRecs.forEach(rec => {
            const eventId = rec.event.id;
            if (combined.has(eventId)) {
                const existing = combined.get(eventId);
                existing.score += rec.score * 0.4; // Content-based weight
                existing.reasons.push(rec.reason);
                existing.types.push(rec.type);
            } else {
                combined.set(eventId, {
                    event: rec.event,
                    score: rec.score * 0.4,
                    reasons: [rec.reason],
                    types: [rec.type]
                });
            }
        });

        return Array.from(combined.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    // Get all events
    async getAllEvents(country = null, city = null) {
        try {
            const params = new URLSearchParams();
            if (country) params.append('country', country);
            if (city) params.append('city', city);

            const response = await fetch(`/.netlify/functions/get-events?${params}`);
            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching events:', error);
            return [];
        }
    }

    // Update user preferences when they rate an event
    async updateUserPreferences(userId, eventId, rating) {
        try {
            // Get the event details
            const event = await this.getEventById(eventId);
            if (!event) return;

            // Update local preferences
            const preferences = this.userPreferences.get(userId) || this.getDefaultPreferences();
            
            // Update category preferences
            if (!preferences.categories[event.category]) {
                preferences.categories[event.category] = { total: 0, count: 0, avg: 0 };
            }
            preferences.categories[event.category].total += rating;
            preferences.categories[event.category].count += 1;
            preferences.categories[event.category].avg = 
                preferences.categories[event.category].total / preferences.categories[event.category].count;

            // Update indoor/outdoor preferences
            preferences.indoorOutdoor[event.indoor_outdoor] = 
                (preferences.indoorOutdoor[event.indoor_outdoor] + rating) / 2;

            // Update city preferences
            if (!preferences.preferredCities[event.city]) {
                preferences.preferredCities[event.city] = { total: 0, count: 0, avg: 0 };
            }
            preferences.preferredCities[event.city].total += rating;
            preferences.preferredCities[event.city].count += 1;
            preferences.preferredCities[event.city].avg = 
                preferences.preferredCities[event.city].total / preferences.preferredCities[event.city].count;

            // Update overall average
            preferences.totalRatings += 1;
            preferences.averageRating = 
                (preferences.averageRating * (preferences.totalRatings - 1) + rating) / preferences.totalRatings;

            // Save updated preferences
            this.userPreferences.set(userId, preferences);

            // Clear recommendation cache for this user
            this.clearUserCache(userId);

            // Save to database
            await this.saveUserPreferences(userId, preferences);

        } catch (error) {
            console.error('Error updating user preferences:', error);
        }
    }

    // Get event by ID
    async getEventById(eventId) {
        try {
            const response = await fetch(`/.netlify/functions/get-event-by-id?eventId=${eventId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch event');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching event:', error);
            return null;
        }
    }

    // Save user preferences to database
    async saveUserPreferences(userId, preferences) {
        try {
            const response = await fetch('/.netlify/functions/save-user-preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    preferences: preferences
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save user preferences');
            }
        } catch (error) {
            console.error('Error saving user preferences:', error);
        }
    }

    // Clear recommendation cache for a user
    clearUserCache(userId) {
        for (const [key, value] of this.recommendationCache) {
            if (key.startsWith(userId)) {
                this.recommendationCache.delete(key);
            }
        }
    }

    // Get user's recommendation history
    async getUserRecommendationHistory(userId) {
        try {
            const response = await fetch(`/.netlify/functions/get-user-recommendation-history?userId=${userId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch recommendation history');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching recommendation history:', error);
            return [];
        }
    }
}

// Global recommendation engine instance
let recommendationEngine = new RecommendationEngine();
