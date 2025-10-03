const { connectToDatabase } = require('./db');

module.exports = async function handler(req, res) {
  const { client, db } = await connectToDatabase();

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    const { userId, country, limit = 10 } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required field: userId' 
      });
    }

    const likesCollection = db.collection('likes');
    const reviewsCollection = db.collection('reviews');

    // Get user's liked events
    const userLikes = await likesCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    if (userLikes.length === 0) {
      // No likes yet, return empty recommendations
      return res.status(200).json({ 
        success: true, 
        recommendations: [],
        message: 'No likes found. Start liking events to get personalized recommendations!'
      });
    }

    // Get user's review patterns
    const userReviews = await reviewsCollection
      .find({ userName: userId })
      .sort({ createdAt: -1 })
      .toArray();

    // Analyze user preferences
    const likedEventIds = userLikes.map(like => like.eventId);
    const userPreferences = analyzeUserPreferences(userLikes, userReviews);

    // Get all events (in a real app, this would be from a proper events collection)
    // For now, we'll use the events from the frontend JSON files
    const allEvents = await getAllEvents();

    // Filter events by country if specified
    let candidateEvents = allEvents;
    if (country) {
      candidateEvents = allEvents.filter(event => 
        event.country.toLowerCase() === country.toLowerCase()
      );
    }

    // Generate recommendations based on user preferences
    const recommendations = generateRecommendations(
      candidateEvents, 
      userPreferences, 
      likedEventIds,
      parseInt(limit)
    );

    res.status(200).json({ 
      success: true, 
      recommendations,
      userPreferences,
      totalLikes: userLikes.length
    });

  } catch (error) {
    console.error('Recommendations API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  } finally {
    // Don't close the connection in serverless environment
    // client.close();
  }
}

// Analyze user preferences from likes and reviews
function analyzeUserPreferences(likes, reviews) {
  const preferences = {
    categories: {},
    countries: {},
    cities: {},
    indoorOutdoor: { indoor: 0, outdoor: 0 },
    avgRating: 0,
    totalReviews: reviews.length
  };

  // Analyze liked events (we'll need to fetch event details)
  // For now, return basic preferences
  return preferences;
}

// Get all events (placeholder - in real app, this would query events collection)
async function getAllEvents() {
  // This is a simplified version. In a real app, you'd have an events collection
  // For now, return empty array - the frontend will handle event loading
  return [];
}

// Generate recommendations based on user preferences
function generateRecommendations(events, preferences, likedEventIds, limit) {
  // Filter out already liked events
  const availableEvents = events.filter(event => 
    !likedEventIds.includes(event.id.toString())
  );

  // Simple recommendation algorithm:
  // 1. Sort by rating (highest first)
  // 2. Prefer events in countries/cities user has liked
  // 3. Prefer events in categories user has liked
  // 4. Apply some randomness for variety

  const scoredEvents = availableEvents.map(event => {
    let score = event.rating || 0;
    
    // Boost score for preferred categories
    if (preferences.categories[event.category]) {
      score += 0.5;
    }
    
    // Boost score for preferred countries
    if (preferences.countries[event.country]) {
      score += 0.3;
    }
    
    // Boost score for preferred cities
    if (preferences.cities[event.city]) {
      score += 0.2;
    }
    
    // Add some randomness for variety
    score += Math.random() * 0.1;
    
    return { ...event, recommendationScore: score };
  });

  // Sort by recommendation score and return top results
  return scoredEvents
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit)
    .map(event => {
      const { recommendationScore, ...eventData } = event;
      return eventData;
    });
}
