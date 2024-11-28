# Personal Word Cloud - Interactive Famous Names Visualization

A dynamic web application that creates personalized word clouds of famous historical figures, complete with interactive features and detailed information for each personality.

## 🌟 Features

### 1. Interactive Word Cloud
- Dynamic visualization of famous names
- Category-based color coding
- Smooth animations and transitions
- Responsive design that works on all screen sizes

### 2. User Management
- Personal user accounts
- Secure authentication system
- Customizable name collections
- 50 initial random names upon registration

### 3. Name Categories
Each name is categorized into one of five groups:
- 🔬 Scientists (Green)
- 🎨 Artists (Red)
- 👑 Leaders (Blue)
- 🎭 Entertainers (Purple)
- 💭 Thinkers (Orange)

### 4. Interactive Information
Click on any name to view:
- Profile picture (via Wikipedia)
- Famous quotes
- Quick links to:
  - Wikipedia articles
  - YouTube videos
  - Google Images
  - Recent news

## 🚀 Getting Started

### Prerequisites
- Python 3.x
- Modern web browser
- Internet connection (for external APIs)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/personal-word-cloud.git
cd personal-word-cloud
```

2. Create and activate a virtual environment (optional but recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the server:
```bash
python app.py
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

## 🎯 Usage

### 1. User Registration
- Click "Register" on the main page
- Choose a username and password
- Get 50 random names automatically

### 2. Managing Names
- Click names to view detailed information
- Hover over names to see them enlarged
- Use category filters to focus on specific groups
- Add or remove names from your collection

### 3. Viewing Information
- Click any name to see:
  - Profile picture
  - Famous quotes
  - External resource links
- Click outside the info panel to return to the cloud

## 🛠 Technical Details

### Frontend
- Pure HTML5, CSS3, and Vanilla JavaScript
- No external dependencies
- Modern CSS features (Grid, Flexbox, Variables)
- Responsive design principles

### Backend
- Python with built-in `http.server`
- In-memory data storage
- RESTful API endpoints
- Cookie-based session management

### APIs Used
- Wikipedia REST API (profile images)
- WikiQuote API (famous quotes)

### Security Features
- Basic authentication system
- Session management
- Input validation
- XSS protection

## 📝 API Endpoints

### Authentication
- POST `/api/register` - User registration
- POST `/api/login` - User authentication
- POST `/api/logout` - End session

### Name Management
- GET `/api/names` - Retrieve user's names
- POST `/api/names` - Add new name
- DELETE `/api/names` - Remove name

### Categories
- GET `/api/categories` - List available categories

## 🎨 Styling

### Fonts
- Names: Caveat (handwriting style)
- UI Elements: Montserrat
- Titles: Playfair Display

### Colors
- Primary: #4CAF50 (Green)
- Background: #f5f5f5
- Card Background: #ffffff
- Error: #f44336
- Category-specific colors for each group

## 🔒 Known Limitations

- In-memory storage (data lost on server restart)
- Basic authentication (no password hashing)
- Limited error handling
- No rate limiting
- No HTTPS implementation

## 🚧 Future Improvements

1. Database Integration
   - Persistent data storage
   - User preferences
   - Name relationships

2. Enhanced Security
   - Password hashing
   - HTTPS support
   - Rate limiting
   - Brute force protection

3. Additional Features
   - Advanced search
   - Name relationships
   - Custom categories
   - More information sources
   - User preferences

4. Performance Optimizations
   - Caching
   - Image optimization
   - Lazy loading
   - Better error handling

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

Your Name - your.email@example.com
Project Link: https://github.com/yourusername/personal-word-cloud
