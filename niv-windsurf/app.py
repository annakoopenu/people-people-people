import http.server
import socketserver
import json
import random
import urllib.parse
from http import cookies
import uuid
from typing import Dict, List, Set

# In-memory storage
users: Dict[str, dict] = {}  # username -> {password, names, session_id}
sessions: Dict[str, str] = {}  # session_id -> username

# Categories and sample names per category
CATEGORIES = {
    'Scientists': [
        'Albert Einstein', 'Marie Curie', 'Isaac Newton', 'Charles Darwin',
        'Nikola Tesla', 'Stephen Hawking', 'Galileo Galilei', 'Richard Feynman',
        'Ada Lovelace', 'Alan Turing'
    ],
    'Leaders': [
        'Nelson Mandela', 'Mahatma Gandhi', 'Martin Luther King Jr.', 'Winston Churchill',
        'Abraham Lincoln', 'George Washington', 'Queen Elizabeth I', 'Julius Caesar',
        'Catherine the Great', 'Alexander the Great'
    ],
    'Artists': [
        'Leonardo da Vinci', 'Vincent van Gogh', 'Pablo Picasso', 'Michelangelo',
        'Frida Kahlo', 'Claude Monet', 'Georgia O\'Keeffe', 'Andy Warhol',
        'Salvador Dalí', 'Rembrandt'
    ],
    'Entertainers': [
        'Charlie Chaplin', 'Marilyn Monroe', 'Elvis Presley', 'Michael Jackson',
        'Audrey Hepburn', 'Walt Disney', 'Bob Marley', 'David Bowie',
        'Frank Sinatra', 'John Lennon'
    ],
    'Thinkers': [
        'Socrates', 'Plato', 'Aristotle', 'Friedrich Nietzsche',
        'Jean-Paul Sartre', 'Confucius', 'Immanuel Kant', 'Virginia Woolf',
        'William Shakespeare', 'Mark Twain'
    ]
}

def get_random_names(count: int = 50) -> List[dict]:
    """Generate a list of random names from all categories."""
    names = []
    categories = list(CATEGORIES.keys())
    
    # Ensure at least one name from each category
    for category in categories:
        names.append({
            'name': random.choice(CATEGORIES[category]),
            'category': category
        })
    
    # Fill the rest randomly
    remaining = count - len(categories)
    for _ in range(remaining):
        category = random.choice(categories)
        name = random.choice(CATEGORIES[category])
        name_obj = {'name': name, 'category': category}
        if name_obj not in names:  # Avoid duplicates
            names.append(name_obj)
    
    return names

class RequestHandler(http.server.SimpleHTTPRequestHandler):
    def send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', 'http://localhost:3000')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Access-Control-Allow-Credentials', 'true')
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()
    
    def get_session_id(self) -> str:
        cookie = cookies.SimpleCookie(self.headers.get('Cookie'))
        return cookie.get('session_id').value if cookie.get('session_id') else None
    
    def get_current_user(self) -> str:
        session_id = self.get_session_id()
        return sessions.get(session_id) if session_id else None
    
    def handle_register(self):
        content_length = int(self.headers['Content-Length'])
        post_data = json.loads(self.rfile.read(content_length))
        username = post_data.get('username')
        password = post_data.get('password')
        
        if not username or not password:
            self.send_error(400, 'Missing username or password')
            return
        
        if username in users:
            self.send_error(400, 'Username already exists')
            return
        
        users[username] = {
            'password': password,
            'names': get_random_names(),
            'session_id': None
        }
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps({'message': 'Registration successful'}).encode())
    
    def handle_login(self):
        content_length = int(self.headers['Content-Length'])
        post_data = json.loads(self.rfile.read(content_length))
        username = post_data.get('username')
        password = post_data.get('password')
        
        if not username or not password:
            self.send_error(400, 'Missing username or password')
            return
        
        user = users.get(username)
        if not user or user['password'] != password:
            self.send_error(401, 'Invalid credentials')
            return
        
        session_id = str(uuid.uuid4())
        users[username]['session_id'] = session_id
        sessions[session_id] = username
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Set-Cookie', f'session_id={session_id}; Path=/')
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps({'message': 'Login successful'}).encode())
    
    def handle_logout(self):
        session_id = self.get_session_id()
        if session_id:
            username = sessions.get(session_id)
            if username:
                del sessions[session_id]
                users[username]['session_id'] = None
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Set-Cookie', 'session_id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT')
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps({'message': 'Logout successful'}).encode())
    
    def handle_names(self, method):
        username = self.get_current_user()
        if not username:
            self.send_error(401, 'Not authenticated')
            return
        
        if method == 'GET':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(users[username]['names']).encode())
        
        elif method == 'POST':
            content_length = int(self.headers['Content-Length'])
            post_data = json.loads(self.rfile.read(content_length))
            name = post_data.get('name')
            category = post_data.get('category')
            
            if not name or not category:
                self.send_error(400, 'Missing name or category')
                return
            
            if category not in CATEGORIES:
                self.send_error(400, 'Invalid category')
                return
            
            name_obj = {'name': name, 'category': category}
            if name_obj not in users[username]['names']:
                users[username]['names'].append(name_obj)
                
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({'message': 'Name added successfully'}).encode())
        
        elif method == 'DELETE':
            # Extract name from path
            path = self.path.split('/')
            if len(path) < 3:
                self.send_error(400, 'Name not specified')
                return
            
            name = urllib.parse.unquote(path[2])
            users[username]['names'] = [n for n in users[username]['names'] if n['name'] != name]
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({'message': 'Name removed successfully'}).encode())
    
    def handle_categories(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(list(CATEGORIES.keys())).encode())
    
    def do_GET(self):
        if self.path == '/api/names':
            self.handle_names('GET')
        elif self.path == '/api/categories':
            self.handle_categories()
        else:
            super().do_GET()
    
    def do_POST(self):
        if self.path == '/api/register':
            self.handle_register()
        elif self.path == '/api/login':
            self.handle_login()
        elif self.path == '/api/names':
            self.handle_names('POST')
        else:
            self.send_error(404, 'Not Found')
    
    def do_DELETE(self):
        if self.path.startswith('/api/names/'):
            self.handle_names('DELETE')
        else:
            self.send_error(404, 'Not Found')

if __name__ == '__main__':
    PORT = 3000
    Handler = RequestHandler
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Server running at http://localhost:{PORT}")
        httpd.serve_forever()
