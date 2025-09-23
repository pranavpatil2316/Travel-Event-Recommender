# Travel + Event Hybrid Recommender Website

A modern, responsive web application that combines travel planning with event discovery. Users can select a destination, choose their travel season, and discover relevant events with detailed information, ratings, and reviews.

## 🚀 **Quick Start**

1. **Download** all files to the same directory
2. **Open** `index.html` in a web browser
3. **Select** a country and season
4. **Click** "Show All Events" to see results

## ✨ **Features**

### 🌍 **Country-First Destination Selection**
- Select from 15+ countries worldwide
- Dynamic city loading using REST Countries API
- Optional city selection (leave empty to see all country events)
- Fallback to predefined cities if API fails

### 🗓️ **Season-Based Travel Planning**
- Choose from Spring, Summer, Autumn, or Winter
- Automatic season detection based on current month
- Season-appropriate event recommendations

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
- Multiple event categories (Art & Culture, History & Heritage, etc.)
- Detailed event descriptions and information
- Live event integration (simulated API)
- Fallback event generation for any city

## 🛠️ **Technology Stack**

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: TailwindCSS (via CDN)
- **Maps**: LeafletJS with OpenStreetMap tiles
- **Storage**: IndexedDB for client-side data persistence
- **APIs**: REST Countries API, Nominatim (OpenStreetMap)

## 📁 **File Structure**

```
travel-event-recommender-website/
├── index.html              # Main HTML file
├── script.js               # Main JavaScript logic
├── database.js             # IndexedDB management
├── sample_events.json      # Sample event data
├── sample_reviews.js       # Sample reviews and ratings
├── package.json            # Project metadata
├── README.md               # This file
├── DEPLOYMENT.md           # Deployment instructions
├── test_simple.html        # Simple form test
├── test_minimal.html       # Minimal functionality test
└── script_minimal.js       # Minimal script for testing
```

## 🚨 **Troubleshooting**

### **Page Refreshes When Clicking "Show All Events"**
**Symptoms**: Page reloads instead of showing results
**Solutions**:
1. **Check Browser Console**: Press F12 → Console tab, look for errors
2. **Verify Files**: Ensure all files are in the same directory
3. **Test Minimal Version**: Try `test_minimal.html` to isolate issues
4. **Clear Browser Cache**: Hard refresh (Ctrl+F5) or clear cache
5. **Check JavaScript**: Ensure JavaScript is enabled in browser

### **City Dropdown Not Working**
**Symptoms**: Cities don't load when selecting a country
**Solutions**:
1. **Check Internet Connection**: API calls require internet
2. **Try Different Country**: Some countries may have API issues
3. **Wait for Loading**: Cities load with a 500ms delay
4. **Check Console**: Look for API error messages

### **Events Not Displaying**
**Symptoms**: No events show after form submission
**Solutions**:
1. **Check Console**: Look for JavaScript errors
2. **Verify JSON File**: Ensure `sample_events.json` exists
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

### **Test Files**
- `test_simple.html`: Basic form functionality test
- `test_minimal.html`: Minimal version without complex features
- `script_minimal.js`: Simplified JavaScript for debugging

### **Debugging Steps**
1. **Open Browser Console** (F12 → Console)
2. **Check for Errors**: Red error messages indicate problems
3. **Test Minimal Version**: Use `test_minimal.html` to isolate issues
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

## 🌐 **API Dependencies**

### **Required APIs**
- **REST Countries API**: For country and city data
- **Nominatim (OpenStreetMap)**: For geocoding
- **TailwindCSS CDN**: For styling
- **LeafletJS CDN**: For maps

### **Offline Mode**
- Basic functionality works without internet
- City loading and maps require internet connection
- Sample events work offline

## 🚀 **Deployment**

### **Local Development**
1. Download all files
2. Open `index.html` in browser
3. No server required

### **Web Hosting**
1. Upload all files to web server
2. Ensure all files are in root directory
3. Access via web browser

### **GitHub Pages**
1. Upload to GitHub repository
2. Enable GitHub Pages
3. Access via GitHub Pages URL

## 📊 **Performance Features**

- **API caching**: Reduces redundant API calls
- **Lazy loading**: Events loaded on demand
- **Optimized images**: Efficient map tile loading
- **Responsive design**: Fast loading on all devices
- **IndexedDB**: Fast local storage for ratings/reviews

## 🔮 **Future Enhancements**

- [ ] Real event API integration
- [ ] User authentication system
- [ ] Social sharing features
- [ ] Advanced filtering options
- [ ] Calendar integration
- [ ] Offline mode support
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Progressive Web App (PWA) features

## 📞 **Support**

### **Getting Help**
1. **Check Console**: Always check browser console first
2. **Test Minimal**: Try `test_minimal.html` for basic functionality
3. **Clear Cache**: Clear browser cache and try again
4. **Check Files**: Ensure all files are present and accessible

### **Common Issues**
- **Page refreshes**: Check console for JavaScript errors
- **Cities not loading**: Check internet connection and API status
- **Events not showing**: Verify `sample_events.json` exists
- **Ratings not saving**: Check IndexedDB support in browser

## 📄 **License**

This project is open source and available under the MIT License.

---

**Note**: This application uses client-side storage (IndexedDB) for ratings and reviews. Data is stored locally in your browser and will persist between sessions.