require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'travel_events';

if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not defined. Please check your .env file.');
  process.exit(1);
}

let db;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Connect to MongoDB
async function connectToDatabase() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(MONGODB_DB);
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

// API Routes

// Reviews API
app.get('/api/reviews', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ success: false, error: 'Database not connected' });
    }
    const { eventId } = req.query;
    const reviewsCollection = db.collection('reviews');
    
    if (eventId) {
      const reviews = await reviewsCollection
        .find({ eventId: eventId })
        .sort({ createdAt: -1 })
        .toArray();
      res.json({ success: true, reviews });
    } else {
      const reviews = await reviewsCollection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      res.json({ success: true, reviews });
    }
  } catch (error) {
    console.error('Reviews GET error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ success: false, error: 'Database not connected' });
    }
    const { eventId, rating, review, userName } = req.body;
    const reviewsCollection = db.collection('reviews');

    if (!eventId || !rating || !userName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: eventId, rating, userName' 
      });
    }

    const newReview = {
      eventId: eventId,
      rating: parseInt(rating),
      review: review || '',
      userName: userName || 'Anonymous',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await reviewsCollection.insertOne(newReview);
    
    res.status(201).json({ 
      success: true, 
      review: { ...newReview, _id: result.insertedId } 
    });
  } catch (error) {
    console.error('Reviews POST error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Likes API
app.get('/api/likes', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ success: false, error: 'Database not connected' });
    }
    const { userId, eventId } = req.query;
    const likesCollection = db.collection('likes');
    
    if (userId && eventId) {
      const like = await likesCollection.findOne({ userId, eventId });
      res.json({ success: true, liked: !!like });
    } else if (userId) {
      const likes = await likesCollection
        .find({ userId })
        .sort({ createdAt: -1 })
        .toArray();
      res.json({ success: true, likes });
    } else {
      const likes = await likesCollection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      res.json({ success: true, likes });
    }
  } catch (error) {
    console.error('Likes GET error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/likes', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ success: false, error: 'Database not connected' });
    }
    const { userId, eventId } = req.body;
    const likesCollection = db.collection('likes');

    if (!userId || !eventId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: userId, eventId' 
      });
    }

    const existingLike = await likesCollection.findOne({ userId, eventId });
    
    if (existingLike) {
      return res.status(200).json({ 
        success: true, 
        message: 'Event already liked',
        liked: true
      });
    }

    const newLike = {
      userId,
      eventId,
      createdAt: new Date()
    };

    const result = await likesCollection.insertOne(newLike);
    
    res.status(201).json({ 
      success: true, 
      like: { ...newLike, _id: result.insertedId },
      liked: true
    });
  } catch (error) {
    console.error('Likes POST error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.delete('/api/likes', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ success: false, error: 'Database not connected' });
    }
    const { userId, eventId } = req.query;
    const likesCollection = db.collection('likes');

    if (!userId || !eventId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: userId, eventId' 
      });
    }

    const deleteResult = await likesCollection.deleteOne({ 
      userId: userId, 
      eventId: eventId 
    });

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Like not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Like removed',
      liked: false
    });
  } catch (error) {
    console.error('Likes DELETE error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Recommendations API
app.get('/api/recommendations', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ success: false, error: 'Database not connected' });
    }
    const { userId, country, limit = 10 } = req.query;
    const likesCollection = db.collection('likes');
    const reviewsCollection = db.collection('reviews');

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required field: userId' 
      });
    }

    const userLikes = await likesCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    if (userLikes.length === 0) {
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
              parseInt(limit),
              country
            );
    
    res.status(200).json({ 
      success: true, 
      recommendations,
      userPreferences,
      totalLikes: userLikes.length
    });

  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Start server
async function startServer() {
  await connectToDatabase();
  
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('MongoDB connected:', !!db);
  });
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

  // Analyze liked events - count preferences
  likes.forEach(like => {
    // For now, we'll use sample data to demonstrate the concept
    // In a real app, you'd fetch event details from the events collection
    const sampleEvent = {
      category: 'Food & Drink', // Most common category from user's likes
      country: 'Japan', // Example country
      city: 'Tokyo',
      indoor_outdoor: 'indoor',
      rating: 4.5
    };

    // Count category preferences
    preferences.categories[sampleEvent.category] = (preferences.categories[sampleEvent.category] || 0) + 1;
    
    // Count country preferences
    preferences.countries[sampleEvent.country] = (preferences.countries[sampleEvent.country] || 0) + 1;
    
    // Count city preferences
    preferences.cities[sampleEvent.city] = (preferences.cities[sampleEvent.city] || 0) + 1;
    
    // Count indoor/outdoor preferences
    preferences.indoorOutdoor[sampleEvent.indoor_outdoor]++;
  });

  // Calculate average rating from reviews
  if (reviews.length > 0) {
    preferences.avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  }

  return preferences;
}

// Get all events (placeholder - in real app, this would query events collection)
async function getAllEvents() {
  // Return comprehensive sample events for recommendations
  return [
    // Japan Events
    {
      id: "rec_jp_001",
      title: "Tokyo Sushi Masterclass",
      description: "Learn to make authentic sushi with a master chef in Tokyo.",
      category: "Food & Drink",
      start_time: "2024-03-15T10:00:00Z",
      end_time: "2024-03-15T14:00:00Z",
      lat: 35.6762,
      lon: 139.6503,
      city: "Tokyo",
      country: "Japan",
      indoor_outdoor: "indoor",
      rating: 4.9,
      ratingCount: 890,
      source: "Recommendation"
    },
    {
      id: "rec_jp_002",
      title: "Osaka Street Food Tour",
      description: "Explore Osaka's famous street food scene with a local guide.",
      category: "Food & Drink",
      start_time: "2024-03-16T18:00:00Z",
      end_time: "2024-03-16T21:00:00Z",
      lat: 34.6937,
      lon: 135.5023,
      city: "Osaka",
      country: "Japan",
      indoor_outdoor: "outdoor",
      rating: 4.8,
      ratingCount: 650,
      source: "Recommendation"
    },
    {
      id: "rec_jp_003",
      title: "Kyoto Tea Ceremony Experience",
      description: "Traditional Japanese tea ceremony in a historic Kyoto temple.",
      category: "Food & Drink",
      start_time: "2024-03-17T14:00:00Z",
      end_time: "2024-03-17T16:00:00Z",
      lat: 35.0116,
      lon: 135.7681,
      city: "Kyoto",
      country: "Japan",
      indoor_outdoor: "indoor",
      rating: 4.7,
      ratingCount: 420,
      source: "Recommendation"
    },
    
    // Italy Events
    {
      id: "rec_it_001",
      title: "Rome Pasta Making Workshop",
      description: "Learn to make authentic Italian pasta from scratch.",
      category: "Food & Drink",
      start_time: "2024-03-18T11:00:00Z",
      end_time: "2024-03-18T14:00:00Z",
      lat: 41.9028,
      lon: 12.4964,
      city: "Rome",
      country: "Italy",
      indoor_outdoor: "indoor",
      rating: 4.8,
      ratingCount: 750,
      source: "Recommendation"
    },
    {
      id: "rec_it_002",
      title: "Florence Wine Tasting Tour",
      description: "Sample world-class Tuscan wines in historic cellars.",
      category: "Food & Drink",
      start_time: "2024-03-19T16:00:00Z",
      end_time: "2024-03-19T19:00:00Z",
      lat: 43.7696,
      lon: 11.2558,
      city: "Florence",
      country: "Italy",
      indoor_outdoor: "indoor",
      rating: 4.9,
      ratingCount: 920,
      source: "Recommendation"
    },
    {
      id: "rec_it_003",
      title: "Naples Pizza Making Class",
      description: "Master the art of Neapolitan pizza in its birthplace.",
      category: "Food & Drink",
      start_time: "2024-03-20T10:00:00Z",
      end_time: "2024-03-20T13:00:00Z",
      lat: 40.8518,
      lon: 14.2681,
      city: "Naples",
      country: "Italy",
      indoor_outdoor: "indoor",
      rating: 4.7,
      ratingCount: 680,
      source: "Recommendation"
    },
    
    // France Events
    {
      id: "rec_fr_001",
      title: "Paris Cooking Class",
      description: "Learn French culinary techniques from a professional chef.",
      category: "Food & Drink",
      start_time: "2024-03-21T09:00:00Z",
      end_time: "2024-03-21T12:00:00Z",
      lat: 48.8566,
      lon: 2.3522,
      city: "Paris",
      country: "France",
      indoor_outdoor: "indoor",
      rating: 4.8,
      ratingCount: 1100,
      source: "Recommendation"
    },
    {
      id: "rec_fr_002",
      title: "Lyon Food Market Tour",
      description: "Explore Lyon's famous food markets and taste local specialties.",
      category: "Food & Drink",
      start_time: "2024-03-22T08:00:00Z",
      end_time: "2024-03-22T11:00:00Z",
      lat: 45.7640,
      lon: 4.8357,
      city: "Lyon",
      country: "France",
      indoor_outdoor: "outdoor",
      rating: 4.6,
      ratingCount: 540,
      source: "Recommendation"
    },
    
    // Spain Events
    {
      id: "rec_es_001",
      title: "Barcelona Tapas Crawl",
      description: "Discover the best tapas bars in Barcelona's Gothic Quarter.",
      category: "Food & Drink",
      start_time: "2024-03-23T19:00:00Z",
      end_time: "2024-03-23T22:00:00Z",
      lat: 41.3851,
      lon: 2.1734,
      city: "Barcelona",
      country: "Spain",
      indoor_outdoor: "indoor",
      rating: 4.7,
      ratingCount: 820,
      source: "Recommendation"
    },
    {
      id: "rec_es_002",
      title: "Madrid Paella Workshop",
      description: "Learn to cook authentic Spanish paella with local ingredients.",
      category: "Food & Drink",
      start_time: "2024-03-24T12:00:00Z",
      end_time: "2024-03-24T15:00:00Z",
      lat: 40.4168,
      lon: -3.7038,
      city: "Madrid",
      country: "Spain",
      indoor_outdoor: "indoor",
      rating: 4.8,
      ratingCount: 650,
      source: "Recommendation"
    },
    
    // United States Events
    {
      id: "rec_us_001",
      title: "New York Food Tour",
      description: "Taste diverse cuisines from around the world in NYC.",
      category: "Food & Drink",
      start_time: "2024-03-25T11:00:00Z",
      end_time: "2024-03-25T15:00:00Z",
      lat: 40.7589,
      lon: -73.9851,
      city: "New York",
      country: "United States",
      indoor_outdoor: "outdoor",
      rating: 4.6,
      ratingCount: 1200,
      source: "Recommendation"
    },
    {
      id: "rec_us_002",
      title: "San Francisco Wine Tasting",
      description: "Sample California wines in the heart of San Francisco.",
      category: "Food & Drink",
      start_time: "2024-03-26T16:00:00Z",
      end_time: "2024-03-26T19:00:00Z",
      lat: 37.7749,
      lon: -122.4194,
      city: "San Francisco",
      country: "United States",
      indoor_outdoor: "indoor",
      rating: 4.7,
      ratingCount: 780,
      source: "Recommendation"
    },
    
    // United Kingdom Events
    {
      id: "rec_uk_001",
      title: "London Pub Food Tour",
      description: "Experience traditional British pub food and local beers.",
      category: "Food & Drink",
      start_time: "2024-03-27T18:00:00Z",
      end_time: "2024-03-27T21:00:00Z",
      lat: 51.5074,
      lon: -0.1278,
      city: "London",
      country: "United Kingdom",
      indoor_outdoor: "indoor",
      rating: 4.5,
      ratingCount: 950,
      source: "Recommendation"
    },
    
    // Australia Events
    {
      id: "rec_au_001",
      title: "Sydney Seafood Experience",
      description: "Fresh seafood tasting at Sydney's famous fish market.",
      category: "Food & Drink",
      start_time: "2024-03-28T10:00:00Z",
      end_time: "2024-03-28T13:00:00Z",
      lat: -33.8688,
      lon: 151.2093,
      city: "Sydney",
      country: "Australia",
      indoor_outdoor: "indoor",
      rating: 4.8,
      ratingCount: 680,
      source: "Recommendation"
    },
    
    // India Events
    {
      id: "rec_in_001",
      title: "Delhi Street Food Tour",
      description: "Explore authentic Indian street food in the heart of Delhi.",
      category: "Food & Drink",
      start_time: "2024-03-29T18:00:00Z",
      end_time: "2024-03-29T21:00:00Z",
      lat: 28.6139,
      lon: 77.2090,
      city: "Delhi",
      country: "India",
      indoor_outdoor: "outdoor",
      rating: 4.9,
      ratingCount: 1200,
      source: "Recommendation"
    },
    {
      id: "rec_in_002",
      title: "Mumbai Spice Market Experience",
      description: "Discover the vibrant spice markets and taste authentic Indian flavors.",
      category: "Food & Drink",
      start_time: "2024-03-30T10:00:00Z",
      end_time: "2024-03-30T13:00:00Z",
      lat: 19.0760,
      lon: 72.8777,
      city: "Mumbai",
      country: "India",
      indoor_outdoor: "outdoor",
      rating: 4.8,
      ratingCount: 950,
      source: "Recommendation"
    },
    {
      id: "rec_in_003",
      title: "Bangalore Coffee Plantation Tour",
      description: "Learn about Indian coffee culture and taste premium South Indian coffee.",
      category: "Food & Drink",
      start_time: "2024-03-31T09:00:00Z",
      end_time: "2024-03-31T12:00:00Z",
      lat: 12.9716,
      lon: 77.5946,
      city: "Bangalore",
      country: "India",
      indoor_outdoor: "indoor",
      rating: 4.7,
      ratingCount: 680,
      source: "Recommendation"
    },
    {
      id: "rec_in_004",
      title: "Hyderabad Biryani Workshop",
      description: "Master the art of making authentic Hyderabadi biryani.",
      category: "Food & Drink",
      start_time: "2024-04-01T11:00:00Z",
      end_time: "2024-04-01T14:00:00Z",
      lat: 17.3850,
      lon: 78.4867,
      city: "Hyderabad",
      country: "India",
      indoor_outdoor: "indoor",
      rating: 4.9,
      ratingCount: 1100,
      source: "Recommendation"
    },
    {
      id: "rec_in_005",
      title: "Kolkata Sweet Shop Tour",
      description: "Experience traditional Bengali sweets and local delicacies.",
      category: "Food & Drink",
      start_time: "2024-04-02T15:00:00Z",
      end_time: "2024-04-02T18:00:00Z",
      lat: 22.5726,
      lon: 88.3639,
      city: "Kolkata",
      country: "India",
      indoor_outdoor: "indoor",
      rating: 4.6,
      ratingCount: 750,
      source: "Recommendation"
    },
    
    // Germany Events
    {
      id: "rec_de_001",
      title: "Berlin Beer Garden Experience",
      description: "Traditional German beer and food in authentic beer gardens.",
      category: "Food & Drink",
      start_time: "2024-03-31T16:00:00Z",
      end_time: "2024-03-31T20:00:00Z",
      lat: 52.5200,
      lon: 13.4050,
      city: "Berlin",
      country: "Germany",
      indoor_outdoor: "outdoor",
      rating: 4.6,
      ratingCount: 580,
      source: "Recommendation"
    },
    {
      id: "rec_de_002",
      title: "Munich Sausage Tasting",
      description: "Sample authentic Bavarian sausages and local specialties.",
      category: "Food & Drink",
      start_time: "2024-04-01T12:00:00Z",
      end_time: "2024-04-01T15:00:00Z",
      lat: 48.1351,
      lon: 11.5820,
      city: "Munich",
      country: "Germany",
      indoor_outdoor: "indoor",
      rating: 4.7,
      ratingCount: 720,
      source: "Recommendation"
    },
    
    // Brazil Events
    {
      id: "rec_br_001",
      title: "Rio de Janeiro Food Tour",
      description: "Explore Brazilian cuisine from street food to fine dining.",
      category: "Food & Drink",
      start_time: "2024-04-02T11:00:00Z",
      end_time: "2024-04-02T15:00:00Z",
      lat: -22.9068,
      lon: -43.1729,
      city: "Rio de Janeiro",
      country: "Brazil",
      indoor_outdoor: "outdoor",
      rating: 4.8,
      ratingCount: 890,
      source: "Recommendation"
    },
    {
      id: "rec_br_002",
      title: "São Paulo Coffee Experience",
      description: "Learn about Brazilian coffee culture and taste premium blends.",
      category: "Food & Drink",
      start_time: "2024-04-03T09:00:00Z",
      end_time: "2024-04-03T12:00:00Z",
      lat: -23.5505,
      lon: -46.6333,
      city: "São Paulo",
      country: "Brazil",
      indoor_outdoor: "indoor",
      rating: 4.5,
      ratingCount: 650,
      source: "Recommendation"
    },
    
    // Canada Events
    {
      id: "rec_ca_001",
      title: "Toronto Maple Syrup Tasting",
      description: "Experience authentic Canadian maple syrup and local treats.",
      category: "Food & Drink",
      start_time: "2024-04-04T10:00:00Z",
      end_time: "2024-04-04T13:00:00Z",
      lat: 43.6532,
      lon: -79.3832,
      city: "Toronto",
      country: "Canada",
      indoor_outdoor: "indoor",
      rating: 4.6,
      ratingCount: 540,
      source: "Recommendation"
    },
    {
      id: "rec_ca_002",
      title: "Vancouver Seafood Market Tour",
      description: "Fresh Pacific seafood and local culinary traditions.",
      category: "Food & Drink",
      start_time: "2024-04-05T14:00:00Z",
      end_time: "2024-04-05T17:00:00Z",
      lat: 49.2827,
      lon: -123.1207,
      city: "Vancouver",
      country: "Canada",
      indoor_outdoor: "indoor",
      rating: 4.7,
      ratingCount: 680,
      source: "Recommendation"
    },
    
    // Mexico Events
    {
      id: "rec_mx_001",
      title: "Mexico City Taco Tour",
      description: "Authentic Mexican tacos and street food experience.",
      category: "Food & Drink",
      start_time: "2024-04-06T18:00:00Z",
      end_time: "2024-04-06T21:00:00Z",
      lat: 19.4326,
      lon: -99.1332,
      city: "Mexico City",
      country: "Mexico",
      indoor_outdoor: "outdoor",
      rating: 4.8,
      ratingCount: 920,
      source: "Recommendation"
    },
    {
      id: "rec_mx_002",
      title: "Cancun Tequila Tasting",
      description: "Learn about tequila production and taste premium varieties.",
      category: "Food & Drink",
      start_time: "2024-04-07T16:00:00Z",
      end_time: "2024-04-07T19:00:00Z",
      lat: 21.1619,
      lon: -86.8515,
      city: "Cancun",
      country: "Mexico",
      indoor_outdoor: "indoor",
      rating: 4.7,
      ratingCount: 750,
      source: "Recommendation"
    },
    
    // South Africa Events
    {
      id: "rec_za_001",
      title: "Cape Town Wine Tasting",
      description: "Sample world-class South African wines in the Cape Winelands.",
      category: "Food & Drink",
      start_time: "2024-04-08T14:00:00Z",
      end_time: "2024-04-08T17:00:00Z",
      lat: -33.9249,
      lon: 18.4241,
      city: "Cape Town",
      country: "South Africa",
      indoor_outdoor: "indoor",
      rating: 4.8,
      ratingCount: 850,
      source: "Recommendation"
    },
    {
      id: "rec_za_002",
      title: "Johannesburg Braai Experience",
      description: "Traditional South African barbecue and local cuisine.",
      category: "Food & Drink",
      start_time: "2024-04-09T12:00:00Z",
      end_time: "2024-04-09T16:00:00Z",
      lat: -26.2041,
      lon: 28.0473,
      city: "Johannesburg",
      country: "South Africa",
      indoor_outdoor: "outdoor",
      rating: 4.6,
      ratingCount: 620,
      source: "Recommendation"
    },
    
    // Thailand Events
    {
      id: "rec_th_001",
      title: "Bangkok Street Food Tour",
      description: "Explore Thailand's famous street food scene with local guides.",
      category: "Food & Drink",
      start_time: "2024-04-10T18:00:00Z",
      end_time: "2024-04-10T21:00:00Z",
      lat: 13.7563,
      lon: 100.5018,
      city: "Bangkok",
      country: "Thailand",
      indoor_outdoor: "outdoor",
      rating: 4.9,
      ratingCount: 1100,
      source: "Recommendation"
    },
    {
      id: "rec_th_002",
      title: "Chiang Mai Cooking Class",
      description: "Learn to cook authentic Thai dishes with local ingredients.",
      category: "Food & Drink",
      start_time: "2024-04-11T10:00:00Z",
      end_time: "2024-04-11T14:00:00Z",
      lat: 18.7883,
      lon: 98.9853,
      city: "Chiang Mai",
      country: "Thailand",
      indoor_outdoor: "indoor",
      rating: 4.8,
      ratingCount: 780,
      source: "Recommendation"
    },
    
    // Egypt Events
    {
      id: "rec_eg_001",
      title: "Cairo Traditional Cuisine",
      description: "Experience authentic Egyptian food and cultural dining.",
      category: "Food & Drink",
      start_time: "2024-04-12T19:00:00Z",
      end_time: "2024-04-12T22:00:00Z",
      lat: 30.0444,
      lon: 31.2357,
      city: "Cairo",
      country: "Egypt",
      indoor_outdoor: "indoor",
      rating: 4.5,
      ratingCount: 590,
      source: "Recommendation"
    },
    {
      id: "rec_eg_002",
      title: "Luxor Tea House Experience",
      description: "Traditional Egyptian tea and local sweets in historic setting.",
      category: "Food & Drink",
      start_time: "2024-04-13T15:00:00Z",
      end_time: "2024-04-13T17:00:00Z",
      lat: 25.6872,
      lon: 32.6396,
      city: "Luxor",
      country: "Egypt",
      indoor_outdoor: "indoor",
      rating: 4.4,
      ratingCount: 420,
      source: "Recommendation"
    },
    
    // Turkey Events
    {
      id: "rec_tr_001",
      title: "Istanbul Turkish Delight Tour",
      description: "Sample authentic Turkish delights and traditional sweets.",
      category: "Food & Drink",
      start_time: "2024-04-14T11:00:00Z",
      end_time: "2024-04-14T14:00:00Z",
      lat: 41.0082,
      lon: 28.9784,
      city: "Istanbul",
      country: "Turkey",
      indoor_outdoor: "indoor",
      rating: 4.7,
      ratingCount: 680,
      source: "Recommendation"
    },
    {
      id: "rec_tr_002",
      title: "Cappadocia Wine Tasting",
      description: "Turkish wines and local cuisine in unique cave setting.",
      category: "Food & Drink",
      start_time: "2024-04-15T16:00:00Z",
      end_time: "2024-04-15T19:00:00Z",
      lat: 38.6431,
      lon: 34.8306,
      city: "Cappadocia",
      country: "Turkey",
      indoor_outdoor: "indoor",
      rating: 4.6,
      ratingCount: 550,
      source: "Recommendation"
    },
    
    // Russia Events
    {
      id: "rec_ru_001",
      title: "Moscow Vodka Tasting",
      description: "Traditional Russian vodka and local food pairings.",
      category: "Food & Drink",
      start_time: "2024-04-16T18:00:00Z",
      end_time: "2024-04-16T21:00:00Z",
      lat: 55.7558,
      lon: 37.6176,
      city: "Moscow",
      country: "Russia",
      indoor_outdoor: "indoor",
      rating: 4.5,
      ratingCount: 480,
      source: "Recommendation"
    },
    {
      id: "rec_ru_002",
      title: "St. Petersburg Tea Ceremony",
      description: "Russian tea culture and traditional pastries.",
      category: "Food & Drink",
      start_time: "2024-04-17T15:00:00Z",
      end_time: "2024-04-17T17:00:00Z",
      lat: 59.9311,
      lon: 30.3609,
      city: "St. Petersburg",
      country: "Russia",
      indoor_outdoor: "indoor",
      rating: 4.4,
      ratingCount: 390,
      source: "Recommendation"
    },
    
    // China Events
    {
      id: "rec_cn_001",
      title: "Beijing Dumpling Workshop",
      description: "Learn to make authentic Chinese dumplings from scratch.",
      category: "Food & Drink",
      start_time: "2024-04-18T10:00:00Z",
      end_time: "2024-04-18T13:00:00Z",
      lat: 39.9042,
      lon: 116.4074,
      city: "Beijing",
      country: "China",
      indoor_outdoor: "indoor",
      rating: 4.8,
      ratingCount: 920,
      source: "Recommendation"
    },
    {
      id: "rec_cn_002",
      title: "Shanghai Tea Ceremony",
      description: "Traditional Chinese tea ceremony and local snacks.",
      category: "Food & Drink",
      start_time: "2024-04-19T14:00:00Z",
      end_time: "2024-04-19T16:00:00Z",
      lat: 31.2304,
      lon: 121.4737,
      city: "Shanghai",
      country: "China",
      indoor_outdoor: "indoor",
      rating: 4.7,
      ratingCount: 750,
      source: "Recommendation"
    },
    
    // Argentina Events
    {
      id: "rec_ar_001",
      title: "Buenos Aires Asado Experience",
      description: "Traditional Argentine barbecue and wine pairing.",
      category: "Food & Drink",
      start_time: "2024-04-20T19:00:00Z",
      end_time: "2024-04-20T23:00:00Z",
      lat: -34.6118,
      lon: -58.3960,
      city: "Buenos Aires",
      country: "Argentina",
      indoor_outdoor: "outdoor",
      rating: 4.8,
      ratingCount: 850,
      source: "Recommendation"
    },
    {
      id: "rec_ar_002",
      title: "Mendoza Wine Tasting",
      description: "Premium Argentine wines in the heart of wine country.",
      category: "Food & Drink",
      start_time: "2024-04-21T15:00:00Z",
      end_time: "2024-04-21T18:00:00Z",
      lat: -32.8908,
      lon: -68.8272,
      city: "Mendoza",
      country: "Argentina",
      indoor_outdoor: "indoor",
      rating: 4.9,
      ratingCount: 980,
      source: "Recommendation"
    },
    
    // Non-Food Events for variety
    {
      id: "rec_other_001",
      title: "Paris City Walking Tour",
      description: "Explore the beautiful streets of Paris with a guided walking tour.",
      category: "Sightseeing",
      start_time: "2024-03-29T10:00:00Z",
      end_time: "2024-03-29T14:00:00Z",
      lat: 48.8566,
      lon: 2.3522,
      city: "Paris",
      country: "France",
      indoor_outdoor: "outdoor",
      rating: 4.8,
      ratingCount: 1250,
      source: "Recommendation"
    },
    {
      id: "rec_other_002",
      title: "London Museum Tour",
      description: "Visit world-class museums and cultural sites in London.",
      category: "History & Heritage",
      start_time: "2024-03-30T09:00:00Z",
      end_time: "2024-03-30T17:00:00Z",
      lat: 51.5074,
      lon: -0.1278,
      city: "London",
      country: "United Kingdom",
      indoor_outdoor: "indoor",
      rating: 4.7,
      ratingCount: 2100,
      source: "Recommendation"
    }
  ];
}

// Generate recommendations based on user preferences
function generateRecommendations(events, preferences, likedEventIds, limit, selectedCountry = null) {
  // Filter out already liked events
  const availableEvents = events.filter(event =>
    !likedEventIds.includes(event.id.toString())
  );

  // If a country is selected, prioritize events from that country
  let candidateEvents = availableEvents;
  if (selectedCountry) {
    candidateEvents = availableEvents.filter(event =>
      event.country.toLowerCase() === selectedCountry.toLowerCase()
    );
    
    // If no events found for selected country, fall back to all events
    if (candidateEvents.length === 0) {
      candidateEvents = availableEvents;
    }
  }

  // Enhanced recommendation algorithm:
  // 1. Strong boost for Food & Drink category (since user likes food events)
  // 2. Boost for selected country
  // 3. Boost for preferred categories
  // 4. Boost for preferred countries
  // 5. Boost for preferred cities
  // 6. Base score from rating
  // 7. Add some randomness for variety

  const scoredEvents = candidateEvents.map(event => {
    let score = event.rating || 0;

    // Strong boost for Food & Drink category (user's preference)
    if (event.category === 'Food & Drink') {
      score += 2.0; // Strong preference for food events
    }

    // Boost for selected country
    if (selectedCountry && event.country.toLowerCase() === selectedCountry.toLowerCase()) {
      score += 1.5; // Strong boost for selected country
    }

    // Boost score for preferred categories
    if (preferences.categories[event.category]) {
      score += 0.8;
    }

    // Boost score for preferred countries
    if (preferences.countries[event.country]) {
      score += 0.5;
    }

    // Boost score for preferred cities
    if (preferences.cities[event.city]) {
      score += 0.3;
    }

    // Boost for indoor events (user seems to prefer indoor food events)
    if (event.indoor_outdoor === 'indoor') {
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

startServer().catch(console.error);
