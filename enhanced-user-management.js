// Enhanced User Management System
// Provides better user identification without requiring login

class EnhancedUserManager {
    constructor() {
        this.currentUser = null;
        this.userPreferences = new Map();
    }

    // Generate a more persistent user ID using browser fingerprinting
    generatePersistentUserId() {
        // Combine multiple browser characteristics for better persistence
        const fingerprint = this.getBrowserFingerprint();
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        
        return `user_${fingerprint}_${timestamp}_${random}`;
    }

    // Get browser fingerprint for better user identification
    getBrowserFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Browser fingerprint', 2, 2);
        
        const fingerprint = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            canvas.toDataURL()
        ].join('|');
        
        // Create a hash of the fingerprint
        return this.simpleHash(fingerprint).toString(36);
    }

    // Simple hash function
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    // Get or create current user
    async getCurrentUser() {
        if (this.currentUser) {
            return this.currentUser;
        }

        // Try to get existing user ID from localStorage
        let userId = localStorage.getItem('travelAppUserId');
        let userData = null;

        if (userId) {
            // Try to get user data from database
            try {
                userData = await this.getUserData(userId);
                if (userData) {
                    this.currentUser = userData;
                    return userData;
                }
            } catch (error) {
                console.log('User data not found, creating new user');
            }
        }

        // Create new user
        userId = this.generatePersistentUserId();
        userData = {
            id: userId,
            session_id: userId,
            created_at: new Date().toISOString(),
            device_info: this.getDeviceInfo(),
            preferences: this.getDefaultPreferences()
        };

        // Save to localStorage
        localStorage.setItem('travelAppUserId', userId);
        localStorage.setItem('travelAppUserData', JSON.stringify(userData));

        // Save to database
        try {
            await this.saveUserData(userData);
        } catch (error) {
            console.log('Could not save to database, using local storage only');
        }

        this.currentUser = userData;
        return userData;
    }

    // Get device information
    getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            screenResolution: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timestamp: new Date().toISOString()
        };
    }

    // Get default user preferences
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

    // Get user data from database
    async getUserData(userId) {
        try {
            const response = await fetch(`/.netlify/functions/get-user-data?userId=${userId}`);
            if (!response.ok) {
                throw new Error('User not found');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    }

    // Save user data to database
    async saveUserData(userData) {
        try {
            const response = await fetch('/.netlify/functions/save-user-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error('Failed to save user data');
            }
        } catch (error) {
            console.error('Error saving user data:', error);
            throw error;
        }
    }

    // Update user preferences
    async updateUserPreferences(userId, preferences) {
        try {
            const response = await fetch('/.netlify/functions/update-user-preferences', {
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
                throw new Error('Failed to update preferences');
            }
        } catch (error) {
            console.error('Error updating preferences:', error);
        }
    }

    // Get user's rating history
    async getUserRatings(userId) {
        try {
            const response = await fetch(`/.netlify/functions/get-user-ratings?userId=${userId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch ratings');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching user ratings:', error);
            return [];
        }
    }

    // Clear user data (for testing or reset)
    clearUserData() {
        localStorage.removeItem('travelAppUserId');
        localStorage.removeItem('travelAppUserData');
        this.currentUser = null;
    }

    // Get user statistics
    async getUserStats(userId) {
        try {
            const ratings = await this.getUserRatings(userId);
            const userData = await this.getUserData(userId);
            
            return {
                totalRatings: ratings.length,
                averageRating: ratings.length > 0 ? 
                    ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0,
                favoriteCategory: this.getFavoriteCategory(ratings),
                userSince: userData ? userData.created_at : null,
                deviceInfo: userData ? userData.device_info : null
            };
        } catch (error) {
            console.error('Error getting user stats:', error);
            return null;
        }
    }

    // Get user's favorite category
    getFavoriteCategory(ratings) {
        if (ratings.length === 0) return null;
        
        const categoryRatings = {};
        ratings.forEach(rating => {
            const category = rating.event.category;
            if (!categoryRatings[category]) {
                categoryRatings[category] = { total: 0, count: 0 };
            }
            categoryRatings[category].total += rating.rating;
            categoryRatings[category].count += 1;
        });

        let favoriteCategory = null;
        let highestAvg = 0;

        Object.keys(categoryRatings).forEach(category => {
            const avg = categoryRatings[category].total / categoryRatings[category].count;
            if (avg > highestAvg) {
                highestAvg = avg;
                favoriteCategory = category;
            }
        });

        return favoriteCategory;
    }

    // Check if user is new (less than 3 ratings)
    async isNewUser(userId) {
        const ratings = await this.getUserRatings(userId);
        return ratings.length < 3;
    }

    // Get user's recommendation readiness
    async getRecommendationReadiness(userId) {
        const ratings = await this.getUserRatings(userId);
        const ratingCount = ratings.length;
        
        if (ratingCount === 0) {
            return {
                ready: false,
                message: "Rate at least 3 events to get personalized recommendations",
                progress: 0
            };
        } else if (ratingCount < 3) {
            return {
                ready: false,
                message: `Rate ${3 - ratingCount} more events to get personalized recommendations`,
                progress: (ratingCount / 3) * 100
            };
        } else {
            return {
                ready: true,
                message: "You're ready for personalized recommendations!",
                progress: 100
            };
        }
    }
}

// Global user manager instance
let enhancedUserManager = new EnhancedUserManager();

// Initialize enhanced user management
async function initEnhancedUserManagement() {
    try {
        const user = await enhancedUserManager.getCurrentUser();
        console.log('Enhanced user management initialized:', user);
        return user;
    } catch (error) {
        console.error('Error initializing enhanced user management:', error);
        return null;
    }
}

// Get current user (enhanced version)
async function getCurrentUser() {
    return await enhancedUserManager.getCurrentUser();
}
