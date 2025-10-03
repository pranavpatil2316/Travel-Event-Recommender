const { connectToDatabase } = require('./db');

module.exports = async function handler(req, res) {
  const { client, db } = await connectToDatabase();

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const reviewsCollection = db.collection('reviews');

    switch (req.method) {
      case 'GET':
        const { eventId } = req.query;
        
        if (eventId) {
          // Get reviews for a specific event
          const reviews = await reviewsCollection
            .find({ eventId: eventId })
            .sort({ createdAt: -1 })
            .toArray();
          
          res.status(200).json({ success: true, reviews });
        } else {
          // Get all reviews
          const reviews = await reviewsCollection
            .find({})
            .sort({ createdAt: -1 })
            .toArray();
          
          res.status(200).json({ success: true, reviews });
        }
        break;

      case 'POST':
        const { eventId: newEventId, rating, review, userName } = req.body;

        if (!newEventId || !rating || !userName) {
          return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields: eventId, rating, userName' 
          });
        }

        const newReview = {
          eventId: newEventId,
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
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Reviews API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  } finally {
    // Don't close the connection in serverless environment
    // client.close();
  }
}
