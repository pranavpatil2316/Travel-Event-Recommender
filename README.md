# Travel Event Recommender Website

A modern, responsive web application that combines travel planning with event discovery. Users can select a destination, choose their travel season, and discover relevant events with detailed information, ratings, and reviews.

## 🚀 **Quick Start**

1. **Clone or download** all files to the same directory
2. **Open** `index.html` in a web browser
3. **Select** a country, optional city, season, and duration
4. **Click** "Get Recommendations" to see results
5. **Explore** events on the interactive map and read reviews

## ✨ **Features**

### 🌍 **Country-First Destination Selection**
- Select from 19 countries worldwide with comprehensive event data
- Dynamic city loading with predefined city lists for each country
- Optional city selection (leave empty to see all country events)
- Fallback to predefined cities for reliable functionality

### 🗓️ **Season-Based Travel Planning**
- Choose from Spring, Summer, Autumn, or Winter
- Automatic season detection based on current month
- Season-appropriate event recommendations

### ⏱️ **Duration-Based Recommendations**
- Weekend trips (2-3 days)
- Week-long vacations (7 days)
- Extended stays (2+ weeks)
- Duration-appropriate event suggestions

### ⭐ **5-Star Rating System**
- User-driven ratings and reviews
- Events sorted by average rating (highest first)
- Pre-populated sample reviews for realistic experience
- Interactive star rating input for new reviews

### 📱 **Modern UI/UX**
- Responsive design with TailwindCSS
- Interactive maps with LeafletJS
- Smooth animations and hover effects
- Mobile-friendly interface

### 🗺️ **Interactive Maps**
- Event locations displayed on OpenStreetMap
- Clickable markers with event details
- Automatic map centering based on events

### 📊 **Comprehensive Event Data**
- Multiple event categories (Art & Culture, History & Heritage, Entertainment, etc.)
- Detailed event descriptions and information
- Pre-loaded event data for 19 countries with 1000+ events
- Real coordinates and location data for accurate mapping
- Event ratings and review counts for better recommendations
- Indoor/outdoor classification for weather considerations

## 🛠️ **Technology Stack**

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: TailwindCSS (via CDN)
- **Maps**: LeafletJS with OpenStreetMap tiles
- **Storage**: IndexedDB for client-side data persistence
- **Data**: JSON files with comprehensive event data for 19 countries
- **Deployment**: Netlify-ready with CLI support
- **Package Management**: npm with Supabase integration ready

## 📁 **File Structure**

```
travel-event-recommender-website/
├── index.html              # Main HTML file with embedded JavaScript
├── script.js               # JavaScript functionality and event handling
├── styles.css              # Custom CSS styles and animations
├── package.json            # Project metadata and dependencies
├── README.md               # This file
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

### **Database Issues**
**Symptoms**: Ratings/reviews not saving or loading
**Solutions**:
1. **Clear IndexedDB**: Browser settings → Clear browsing data
2. **Check Console**: Look for database error messages
3. **Try Incognito Mode**: Test in private browsing mode
4. **Disable Extensions**: Some extensions may interfere

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
1. Clone or download all files to a directory
2. Open `index.html` in a web browser
3. No server required - runs entirely client-side

### **Web Hosting**
1. Upload all files to web server
2. Ensure all files are in root directory
3. Access via web browser

### **GitHub Pages**
1. Upload to GitHub repository
2. Enable GitHub Pages
3. Access via GitHub Pages URL

## 📊 **Performance Features**

- **Local data storage**: All event data stored in JSON files for fast access
- **Lazy loading**: Events loaded on demand based on user selection
- **Optimized maps**: Efficient map tile loading with LeafletJS
- **Responsive design**: Fast loading on all devices with TailwindCSS
- **IndexedDB**: Fast local storage for ratings/reviews persistence
- **Client-side processing**: No server required for core functionality

## 🔮 **Future Enhancements**

- [ ] Real event API integration (Eventbrite, Meetup, etc.)
- [ ] User authentication system with Supabase
- [ ] Social sharing features
- [ ] Advanced filtering options (price, date, category)
- [ ] Calendar integration (Google Calendar, iCal)
- [ ] Enhanced offline mode support
- [ ] Multi-language support
- [ ] Dark mode theme toggle
- [ ] Progressive Web App (PWA) features
- [ ] User favorites and wishlist
- [ ] Event booking integration
- [ ] Weather-based recommendations

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
5. User interactions (ratings, reviews) stored in IndexedDB

### **Key Components**
- **Form Handler**: Manages user input and validation
- **Event Loader**: Fetches and processes event data
- **Map Manager**: Handles LeafletJS map interactions
- **Rating System**: Manages user reviews and ratings
- **Storage Manager**: Handles IndexedDB operations

## 📄 **License**

This project is open source and available under the MIT License.

---

**Note**: This application uses client-side storage (IndexedDB) for ratings and reviews. Data is stored locally in your browser and will persist between sessions.
