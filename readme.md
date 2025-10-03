# Travel Event Recommender Website

A modern, responsive full-stack web application that combines travel planning with event discovery. Users can select a destination, choose their travel season, and discover relevant events with detailed information, ratings, and reviews. Features a complete backend API with MongoDB Atlas, persistent data storage, and AI-powered personalized recommendations!

## 🚀 **Quick Start**

### Option 1: Frontend Only (No Backend)
1. **Clone or download** all files to the same directory
2. **Open** `index.html` in a web browser (no server required)
3. **Select** a country, optional city, season, and duration
4. **Click** "Get Recommendations" to see results
5. **Explore** events on the interactive map and read reviews

### Option 2: Full Stack with Backend (Recommended)
1. **Set up MongoDB Atlas** and get connection string
2. **Install dependencies**: `npm install`
3. **Configure environment variables** in `.env.local`
4. **Start development server**: `npm start`
5. **Deploy to Vercel**: `vercel --prod`

## 🆕 **New Backend Features**

### 🔄 **Persistent Data Storage**
- **Reviews & Ratings**: Stored in MongoDB Atlas, persist across sessions
- **User Likes**: Track which events users like for personalized recommendations
- **User Preferences**: Learn from user behavior to improve suggestions

### 🎯 **AI-Powered Personalized Recommendations**
- **Smart Suggestions**: Get event recommendations based on your likes and preferences
- **User Tracking**: Unique user ID tracks preferences across sessions and devices
- **Advanced Algorithm**: Considers categories, countries, cities, ratings, and user behavior
- **Country-Specific**: Recommendations tailored to your selected destination
- **Real-Time Updates**: Recommendations refresh automatically when you like new events

### 💾 **Backend API**
- **RESTful Endpoints**: `/api/reviews`, `/api/likes`, `/api/recommendations`
- **MongoDB Integration**: Scalable database storage
- **Vercel Deployment**: Serverless functions for global performance

## ✨ **Features**

### 🌍 **Global Destination Selection**
- **19 Countries Supported**: Argentina, Australia, Brazil, Canada, China, Egypt, France, Germany, India, Italy, Japan, Mexico, Russia, South Africa, Spain, Thailand, Turkey, UK, USA
- **Dynamic City Loading**: Predefined city lists for each country
- **Optional City Selection**: Leave empty to see all country events
- **Comprehensive Event Data**: 1000+ events across all destinations

### 🗓️ **Season-Based Travel Planning**
- Choose from Spring, Summer, Autumn, or Winter
- Automatic season detection based on current month
- Season-appropriate event recommendations

### ⏱️ **Duration-Based Recommendations**
- Weekend trips (2-3 days)
- Week-long vacations (7 days)
- Extended stays (2+ weeks)
- Duration-appropriate event suggestions

### ⭐ **Advanced Rating & Review System**
- **5-Star Rating System**: User-driven ratings and reviews
- **Persistent Storage**: Reviews saved to MongoDB Atlas
- **Real-Time Updates**: Ratings update immediately after submission
- **User Attribution**: Reviews linked to user profiles
- **Interactive Interface**: Star rating input with review text
- **Event Sorting**: Events sorted by average rating (highest first)

### 📱 **Modern UI/UX**
- **Responsive Design**: TailwindCSS for mobile-first design
- **Interactive Maps**: LeafletJS with OpenStreetMap tiles
- **Smooth Animations**: Hover effects and transitions
- **Mobile-Friendly**: Optimized for all device sizes
- **Clean Interface**: Production-ready, professional design

### 🗺️ **Interactive Maps**
- Event locations displayed on OpenStreetMap
- Clickable markers with event details
- Automatic map centering based on events

### 📊 **Comprehensive Event Data**
- **Multiple Categories**: Art & Culture, History & Heritage, Entertainment, Food & Drink, etc.
- **Detailed Information**: Rich descriptions, timing, and location data
- **Global Coverage**: 1000+ events across 19 countries
- **Accurate Mapping**: Real coordinates for precise location display
- **Rating System**: Event ratings and review counts for better recommendations
- **Weather Considerations**: Indoor/outdoor classification
- **Recommendation Data**: Enhanced event data for AI-powered suggestions

## 🛠️ **Technology Stack**

### Frontend
- **HTML5, CSS3, JavaScript (ES6+)**
- **TailwindCSS** (via CDN) for responsive design
- **LeafletJS** with OpenStreetMap tiles for interactive maps
- **Local Storage** for user session management

### Backend
- **Node.js** with Express.js for local development
- **Vercel Serverless Functions** for production deployment
- **MongoDB Atlas** for persistent data storage
- **RESTful API** with CORS support
- **Environment-based configuration**

### Data & Storage
- **JSON files** with comprehensive event data for 19 countries
- **MongoDB collections** for reviews, likes, and user preferences
- **Client-side caching** for improved performance

### Deployment
- **Vercel** for serverless deployment
- **MongoDB Atlas** for managed database
- **CDN** for global content delivery

## 📁 **File Structure**

```
travel-event-recommender-website/
├── index.html              # Main HTML file
├── script.js               # Frontend JavaScript with API integration
├── styles.css              # Custom CSS styles and animations
├── server.js               # Local development server
├── package.json            # Project dependencies and scripts
├── vercel.json             # Vercel deployment configuration
├── env.local               # Environment variables (MongoDB connection)
├── README.md               # This file
├── api/                    # Backend API endpoints (Vercel serverless functions)
│   ├── db.js               # MongoDB connection
│   ├── reviews.js          # Reviews API endpoint
│   ├── likes.js            # Likes API endpoint
│   └── recommendations.js  # Recommendations API endpoint
└── events/                 # Event data directory
    ├── events-argentina.json
    ├── events-australia.json
    ├── events-brazil.json
    ├── events-canada.json
    ├── events-china.json
    ├── events-egypt.json
    ├── events-france.json
    ├── events-germany.json
    ├── events-india.json
    ├── events-italy.json
    ├── events-japan.json
    ├── events-mexico.json
    ├── events-russia.json
    ├── events-southafrica.json
    ├── events-spain.json
    ├── events-thailand.json
    ├── events-turkey.json
    ├── events-uk.json
    └── events-usa.json
```

## 🚨 **Troubleshooting**

### **Page Refreshes When Clicking "Get Recommendations"**
**Symptoms**: Page reloads instead of showing results
**Solutions**:
1. **Check Browser Console**: Press F12 → Console tab, look for errors
2. **Verify Files**: Ensure all files are in the same directory
3. **Clear Browser Cache**: Hard refresh (Ctrl+F5) or clear cache
4. **Check JavaScript**: Ensure JavaScript is enabled in browser
5. **Verify Event Files**: Ensure all JSON files exist in the `events/` directory

### **City Dropdown Not Working**
**Symptoms**: Cities don't load when selecting a country
**Solutions**:
1. **Check Console**: Look for JavaScript errors in browser console
2. **Try Different Country**: Some countries may have predefined city lists
3. **Wait for Loading**: Cities load with a slight delay
4. **Verify Script**: Ensure `script.js` is properly loaded

### **Events Not Displaying**
**Symptoms**: No events show after form submission
**Solutions**:
1. **Check Console**: Look for JavaScript errors
2. **Verify Event Files**: Ensure event JSON files exist in the `events/` directory
3. **Try Different Country**: Some countries may have no events
4. **Check Form**: Ensure all required fields are filled

### **Backend/Database Issues**
**Symptoms**: Ratings/reviews not saving or loading, recommendations not working
**Solutions**:
1. **Check Server Status**: Ensure `npm start` is running
2. **Verify MongoDB Connection**: Check `.env.local` file has correct connection string
3. **Check Console**: Look for API error messages in browser console
4. **Test API Endpoints**: Verify `/api/reviews`, `/api/likes`, `/api/recommendations` are accessible
5. **Clear Browser Cache**: Clear localStorage and try again

## 🔧 **Development & Testing**

### **Debugging Steps**
1. **Open Browser Console** (F12 → Console)
2. **Check for Errors**: Red error messages indicate problems
3. **Verify Event Files**: Ensure all JSON files exist in the `events/` directory
4. **Verify Network**: Check Network tab for failed requests
5. **Clear Storage**: Clear IndexedDB and localStorage if needed

### **Common Console Messages**
- ✅ `"DOM loaded, initializing application..."` - Good start
- ✅ `"Form element found:"` - Form initialization working
- ✅ `"Form submit event triggered"` - Form submission working
- ❌ `"Form element not found!"` - HTML structure issue
- ❌ `"Error initializing application:"` - Database or script issue

## 📱 **Browser Compatibility**

- **Chrome**: Full support ✅
- **Firefox**: Full support ✅
- **Safari**: Full support ✅
- **Edge**: Full support ✅
- **Mobile browsers**: Responsive design works on all devices ✅

## 🌐 **Dependencies**

### **CDN Resources**
- **TailwindCSS CDN**: For styling and responsive design
- **LeafletJS CDN**: For interactive maps
- **OpenStreetMap**: For map tiles and geocoding

### **Offline Mode**
- Basic functionality works without internet
- Maps require internet connection for tiles
- All event data is stored locally in JSON files

## 🚀 **Deployment**

### **Local Development**
1. **Clone or download** all files to a directory
2. **Install dependencies**: `npm install`
3. **Configure MongoDB**: Set up `.env.local` with your MongoDB Atlas connection string
4. **Start server**: `npm start`
5. **Open browser**: Navigate to `http://localhost:3000`

### **Vercel Deployment (Recommended)**
1. **Install Vercel CLI**: `npm install -g vercel`
2. **Login to Vercel**: `vercel login`
3. **Deploy**: `vercel --prod`
4. **Configure Environment Variables**: Add MongoDB connection string in Vercel dashboard
5. **Access**: Your app will be available at `https://your-app.vercel.app`

### **Other Hosting Platforms**
- **Netlify**: Upload files and configure environment variables
- **Heroku**: Use Node.js buildpack and configure MongoDB
- **Railway**: Deploy with automatic MongoDB integration

## 📊 **Performance Features**

- **Hybrid Data Storage**: JSON files for fast event loading + MongoDB for persistent data
- **Lazy Loading**: Events loaded on demand based on user selection
- **Optimized Maps**: Efficient map tile loading with LeafletJS
- **Responsive Design**: Fast loading on all devices with TailwindCSS
- **MongoDB Atlas**: Cloud database for reviews, likes, and recommendations
- **Serverless Functions**: Vercel serverless functions for global performance
- **Caching**: Client-side caching for improved performance

## 🔮 **Future Enhancements**

### Backend Improvements
- [x] **MongoDB Atlas Integration** - Persistent data storage
- [x] **RESTful API** - Reviews, likes, and recommendations endpoints
- [x] **AI-Powered Recommendations** - Smart event suggestions
- [ ] User authentication system (JWT, OAuth)
- [ ] Advanced recommendation algorithms (collaborative filtering, ML)
- [ ] Real-time notifications and updates
- [ ] Social features (follow users, see friends' likes)
- [ ] Event booking integration
- [ ] Payment processing for premium features

### Frontend Enhancements
- [ ] Real event API integration (Eventbrite, Meetup, etc.)
- [ ] Advanced filtering options (price, date, category)
- [ ] Calendar integration (Google Calendar, iCal)
- [ ] Enhanced offline mode support
- [ ] Multi-language support
- [ ] Dark mode theme toggle
- [ ] Progressive Web App (PWA) features
- [ ] Weather-based recommendations
- [ ] Social sharing features
- [ ] Advanced search and filtering
- [ ] User profiles and preferences
- [ ] Event comparison tools

## 📞 **Support**

### **Getting Help**
1. **Check Console**: Always check browser console first (F12 → Console)
2. **Verify Files**: Ensure all event JSON files are present in the `events/` directory
3. **Clear Cache**: Clear browser cache and try again (Ctrl+F5)
4. **Check Internet**: Ensure internet connection for map tiles
5. **Test Different Browser**: Try Chrome, Firefox, or Edge

### **Common Issues**
- **Page refreshes**: Check console for JavaScript errors
- **Cities not loading**: Check JavaScript console for errors
- **Events not showing**: Verify event JSON files exist in `events/` directory
- **Ratings not saving**: Check IndexedDB support in browser
- **Map not loading**: Check internet connection for map tiles

## 🏗️ **Project Architecture**

### **Frontend Structure**
- **HTML**: Semantic markup with accessibility features
- **CSS**: Custom styles with TailwindCSS for responsive design
- **JavaScript**: ES6+ with modern features and async/await
- **Data**: JSON files with structured event information

### **Data Flow**
1. User selects country, city, season, and duration
2. Application loads relevant event data from JSON files
3. Events are filtered and sorted by rating
4. Results displayed with interactive map
5. User interactions (ratings, reviews, likes) stored in MongoDB Atlas
6. AI-powered recommendations generated based on user preferences
7. Real-time updates when user likes events or submits reviews

### **Key Components**
- **Form Handler**: Manages user input and validation
- **Event Loader**: Fetches and processes event data
- **Map Manager**: Handles LeafletJS map interactions
- **Rating System**: Manages user reviews and ratings
- **API Manager**: Handles MongoDB Atlas operations
- **Recommendation Engine**: AI-powered event suggestions
- **Like System**: Tracks user preferences for personalization

## 📄 **License**

This project is open source and available under the MIT License.

---

**Note**: This is a production-ready full-stack application with MongoDB Atlas integration, AI-powered recommendations, and persistent data storage. The backend provides enhanced features like personalized recommendations, user tracking, and real-time updates across devices and sessions.