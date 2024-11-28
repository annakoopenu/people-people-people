let userNames = [];
let categories = [];
let selectedCategory = 'all';
let selectedName = null;

// Authentication UI
function switchTab(tab) {
    // Update tab styling
    const tabs = document.querySelectorAll('.auth-tab');
    tabs.forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    // Show selected form
    const forms = document.querySelectorAll('.auth-form');
    forms.forEach(f => f.classList.remove('active'));
    document.getElementById(`${tab}-form`).classList.add('active');
    
    // Clear error messages
    document.getElementById('login-error').style.display = 'none';
    document.getElementById('register-error').style.display = 'none';
}

async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });
        
        const data = await response.json();
        if (response.ok) {
            document.getElementById('auth-container').style.display = 'none';
            document.getElementById('logout-btn').style.display = 'block';
            document.getElementById('name-form').style.display = 'flex';
            document.getElementById('categories-container').style.display = 'block';
            await loadCategories();
            await loadUserNames();
            
            // Clear form
            document.getElementById('login-form').reset();
            errorDiv.style.display = 'none';
        } else {
            errorDiv.textContent = data.error || 'Login failed';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorDiv.textContent = 'Login failed. Please try again.';
        errorDiv.style.display = 'block';
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const errorDiv = document.getElementById('register-error');
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        if (response.ok) {
            // Switch to login tab
            switchTab('login');
            document.getElementById('register-form').reset();
            errorDiv.style.display = 'none';
            
            // Show success message
            const loginError = document.getElementById('login-error');
            loginError.style.color = '#4CAF50';
            loginError.textContent = 'Registration successful! Please login.';
            loginError.style.display = 'block';
        } else {
            errorDiv.textContent = data.error || 'Registration failed';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Registration error:', error);
        errorDiv.textContent = 'Registration failed. Please try again.';
        errorDiv.style.display = 'block';
    }
}

async function logout() {
    try {
        await fetch('/api/logout');
        document.getElementById('auth-container').style.display = 'block';
        document.getElementById('logout-btn').style.display = 'none';
        document.getElementById('name-form').style.display = 'none';
        document.getElementById('categories-container').style.display = 'none';
        userNames = [];
        updateWordCloud();
        
        // Reset forms and errors
        document.getElementById('login-form').reset();
        document.getElementById('register-form').reset();
        document.getElementById('login-error').style.display = 'none';
        document.getElementById('register-error').style.display = 'none';
        
        // Switch to login tab
        switchTab('login');
    } catch (error) {
        console.error('Logout error:', error);
        alert('Logout failed. Please try again.');
    }
}

// Category management
async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        if (response.ok) {
            categories = await response.json();
            
            // Update category buttons
            const container = document.getElementById('categories-container');
            container.innerHTML = ''; // Clear existing buttons
            
            // Add "All" button first
            const allButton = document.createElement('button');
            allButton.className = 'category-btn active';
            allButton.textContent = 'All';
            allButton.dataset.category = 'all';
            allButton.onclick = () => filterByCategory('all');
            container.appendChild(allButton);
            
            // Add category buttons
            categories.forEach(category => {
                const button = document.createElement('button');
                button.className = 'category-btn';
                button.textContent = category;
                button.dataset.category = category;
                button.onclick = () => filterByCategory(category);
                container.appendChild(button);
            });
            
            // Update category select dropdown
            const select = document.getElementById('new-name-category');
            select.innerHTML = '<option value="">Select Category</option>';
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

function filterByCategory(category) {
    selectedCategory = category.toLowerCase();
    
    // Update active button
    const buttons = document.getElementsByClassName('category-btn');
    Array.from(buttons).forEach(button => {
        button.classList.toggle('active', button.dataset.category.toLowerCase() === selectedCategory);
    });
    
    updateWordCloud();
}

// Name management functions
async function loadUserNames() {
    try {
        const response = await fetch('/api/names', {
            credentials: 'include'
        });
        if (response.ok) {
            userNames = await response.json();
            updateWordCloud();
        } else {
            console.error('Failed to load names:', await response.text());
        }
    } catch (error) {
        console.error('Load names error:', error);
        alert('Failed to load names. Please try again.');
    }
}

async function addName() {
    const nameInput = document.getElementById('new-name');
    const categorySelect = document.getElementById('new-name-category');
    const name = nameInput.value.trim();
    const category = categorySelect.value;
    
    if (!name || !category) {
        alert('Please enter both a name and select a category');
        return;
    }
    
    try {
        const response = await fetch('/api/names', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, category }),
            credentials: 'include'
        });
        
        if (response.ok) {
            nameInput.value = '';
            categorySelect.value = '';
            loadUserNames();
        } else {
            const data = await response.json();
            alert(data.error);
        }
    } catch (error) {
        console.error('Add name error:', error);
        alert('Failed to add name. Please try again.');
    }
}

async function removeName(name) {
    try {
        const response = await fetch(`/api/names/${encodeURIComponent(name)}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (response.ok) {
            loadUserNames();
        } else {
            const data = await response.json();
            alert(data.error);
        }
    } catch (error) {
        console.error('Remove name error:', error);
        alert('Failed to remove name. Please try again.');
    }
}

// Color mapping for categories
const categoryColors = {
    'Scientists': '#4CAF50',     // Green
    'Leaders': '#2196F3',        // Blue
    'Artists': '#F44336',        // Red
    'Entertainers': '#9C27B0',   // Purple
    'Thinkers': '#FF9800'        // Orange
};

// Info bubble configuration
const infoBubbles = [
    {
        name: 'Wikipedia',
        icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTIgMEM1LjM3MyAwIDAgNS4zNzMgMCAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMlMxOC42MjcgMCAxMiAwem0xLjI1IDE3Ljc1aC0yLjVWNy41aDIuNXYxMC4yNXptMC0xMi4yNWgtMi41di0yLjVoMi41djIuNXoiLz48L3N2Zz4=',
        getUrl: name => `https://en.wikipedia.org/wiki/${encodeURIComponent(name)}`
    },
    {
        name: 'YouTube',
        icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMjEuNTgyIDYuMTg2YTIuNTA2IDIuNTA2IDAgMCAwLTEuNzY4LTEuNzY4QzE4LjI1NCA0IDEyIDQgMTIgNHMtNi4yNTQgMC03LjgxNC40MThjLS44NjQuMjMtMS41MzguOTA0LTEuNzY4IDEuNzY4QzIgNy43NDYgMiAxMiAyIDEyczAgNC4yNTQuNDE4IDUuODE0Yy4yMy44NjQuOTA0IDEuNTM4IDEuNzY4IDEuNzY4QzUuNzQ2IDIwIDEyIDIwIDEyIDIwczYuMjU0IDAgNy44MTQtLjQxOGEyLjUwNiAyLjUwNiAwIDAgMCAxLjc2OC0xLjc2OEMyMiAxNi4yNTQgMjIgMTIgMjIgMTJzMC00LjI1NC0uNDE4LTUuODE0ek0xMCAxNS40NjRWOC41MzZsNi41IDMuNDY0LTYuNSAzLjQ2NHoiLz48L3N2Zz4=',
        getUrl: name => `https://www.youtube.com/results?search_query=${encodeURIComponent(name)}`
    },
    {
        name: 'Google Images',
        icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTMuNSAxLjkxbDMuNzcgMy43N2MtLjIuMi0uMzMuNDgtLjMzLjc3djYuODhjMCAuNjEuNSAxLjExIDEuMTEgMS4xMWguODl2NS42N2MwIC42MS0uNSAxLjExLTEuMTEgMS4xMUg2LjExYy0uNjEgMC0xLjExLS41LTEuMTEtMS4xMVY0LjExYzAtLjYxLjUtMS4xMSAxLjExLTEuMTFoNi42MWMuMjkgMCAuNTctLjEzLjc3LS4zM3pNMTQgN2gydjJoLTJWN3ptMCA0aDJ2MmgtMnYtMnptLTQtNGgydjJINlY3em0wIDRoMnYySDZ2LTJ6Ii8+PC9zdmc+',
        getUrl: name => `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(name)}`
    },
    {
        name: 'News',
        icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMjAgNGgtMTZjLTEuMSAwLTIgLjktMiAydjEyYzAgMS4xLjkgMiAyIDJoMTZjMS4xIDAgMi0uOSAyLTJ2LTEyYzAtMS4xLS45LTItMi0yem0tMTYgMTRoMTZ2LTEyaC0xNnYxMnptMTQtMTBoLTEydjJoMTJ2LTJ6bTAtNGgtMTJ2MmgxMnYtMnptLTEyIDhoMTJ2MmgtMTJ2LTJ6Ii8+PC9zdmc+',
        getUrl: name => `https://news.google.com/search?q=${encodeURIComponent(name)}`
    }
];

// Overlay management
function createNameTag(name, category, x, y, size) {
    const nameTag = document.createElement('a');
    nameTag.href = '#';
    nameTag.className = 'name-tag';
    nameTag.textContent = name;
    nameTag.style.left = x + 'px';
    nameTag.style.top = y + 'px';
    nameTag.style.fontSize = size + 'px';
    nameTag.style.color = categoryColors[category] || '#000000';
    
    // Simplified click handler - show bubbles immediately on click
    nameTag.addEventListener('click', (e) => {
        e.preventDefault();
        showInfoBubbles(name);
    });
    
    return nameTag;
}

async function fetchFamousQuote(name) {
    try {
        // Using Wikiquote API to get a quote
        const response = await fetch(`https://en.wikiquote.org/api/rest_v1/page/random/quote/${encodeURIComponent(name)}`);
        if (!response.ok) {
            // Fallback quotes for different categories
            const fallbackQuotes = {
                'Scientists': [
                    "The important thing is not to stop questioning.",
                    "In the middle of difficulty lies opportunity.",
                    "The good thing about science is that it's true whether or not you believe in it.",
                ],
                'Artists': [
                    "Art enables us to find ourselves and lose ourselves at the same time.",
                    "Every artist was first an amateur.",
                    "Creativity takes courage.",
                ],
                'Leaders': [
                    "Leadership is not about being in charge. It is about taking care of those in your charge.",
                    "A leader is one who knows the way, goes the way, and shows the way.",
                    "The supreme quality of leadership is integrity.",
                ],
                'Entertainers': [
                    "All the world's a stage, and all the men and women merely players.",
                    "Life is a play that does not allow testing. So, sing, cry, dance, laugh, and live intensely.",
                    "Entertainment is about taking people away from the regular order of things.",
                ],
                'Thinkers': [
                    "I think, therefore I am.",
                    "The unexamined life is not worth living.",
                    "Knowledge speaks, but wisdom listens.",
                ]
            };

            // Get the person's category from userNames array
            const person = userNames.find(p => p.name === name);
            const category = person ? person.category : null;
            
            if (category && fallbackQuotes[category]) {
                const quotes = fallbackQuotes[category];
                return quotes[Math.floor(Math.random() * quotes.length)];
            }
            
            return "Life is what happens while you're busy making other plans."; // Default fallback
        }
        
        const data = await response.json();
        return data.quote;
    } catch (error) {
        console.error('Error fetching quote:', error);
        return null;
    }
}

async function showInfoBubbles(name) {
    const overlay = document.getElementById('overlay');
    const bubbles = document.getElementById('info-bubbles');
    
    // Clear existing content
    bubbles.innerHTML = '';
    
    // Create and add title
    const title = document.createElement('h2');
    title.className = 'bubble-title';
    title.textContent = name;
    bubbles.appendChild(title);
    
    // Create and add profile image container
    const imageContainer = document.createElement('div');
    imageContainer.className = 'profile-image-container';
    
    const loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'profile-image-loading';
    imageContainer.appendChild(loadingSpinner);
    
    const profileImage = document.createElement('img');
    profileImage.className = 'profile-image';
    imageContainer.appendChild(profileImage);
    bubbles.appendChild(imageContainer);
    
    // Create grid for bubbles
    const bubblesGrid = document.createElement('div');
    bubblesGrid.className = 'bubbles-grid';
    bubbles.appendChild(bubblesGrid);
    
    // Create info bubbles
    const sources = [
        { text: 'Wikipedia', url: `https://www.wikipedia.org/wiki/${encodeURIComponent(name)}` },
        { text: 'YouTube', url: `https://www.youtube.com/results?search_query=${encodeURIComponent(name)}` },
        { text: 'Google Images', url: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(name)}` },
        { text: 'News', url: `https://news.google.com/search?q=${encodeURIComponent(name)}` }
    ];
    
    sources.forEach(source => {
        const bubble = document.createElement('a');
        bubble.href = source.url;
        bubble.className = 'info-bubble';
        bubble.textContent = source.text;
        bubble.target = '_blank';
        bubblesGrid.appendChild(bubble);
    });

    // Create quote container
    const quoteContainer = document.createElement('div');
    quoteContainer.className = 'quote-container';
    
    const loadingText = document.createElement('div');
    loadingText.className = 'loading-quote';
    loadingText.textContent = 'Loading famous quote...';
    quoteContainer.appendChild(loadingText);
    
    bubbles.appendChild(quoteContainer);
    
    // Show overlay with animation
    overlay.style.display = 'flex';
    requestAnimationFrame(() => {
        overlay.classList.add('visible');
    });
    
    // Add click handler to close overlay
    const handleOverlayClick = (e) => {
        if (e.target === overlay) {
            closeOverlay();
            overlay.removeEventListener('click', handleOverlayClick);
        }
    };
    
    overlay.addEventListener('click', handleOverlayClick);
    
    // Fetch and display profile image
    try {
        const imageUrl = await fetchProfileImage(name);
        if (imageUrl) {
            profileImage.src = imageUrl;
            profileImage.onload = () => {
                loadingSpinner.style.display = 'none';
                profileImage.classList.add('loaded');
            };
        } else {
            imageContainer.style.display = 'none';
        }
    } catch (error) {
        console.error('Error fetching profile image:', error);
        imageContainer.style.display = 'none';
    }

    // Fetch and display quote
    try {
        const quote = await fetchFamousQuote(name);
        if (quote) {
            const quoteText = document.createElement('p');
            quoteText.className = 'quote-text';
            quoteText.textContent = quote;
            quoteContainer.innerHTML = '';
            quoteContainer.appendChild(quoteText);
        } else {
            quoteContainer.style.display = 'none';
        }
    } catch (error) {
        console.error('Error displaying quote:', error);
        quoteContainer.style.display = 'none';
    }
}

async function fetchProfileImage(name) {
    try {
        // Using Wikipedia API to get the profile image
        const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`);
        const data = await response.json();
        
        // Return the thumbnail image URL if available
        if (data.thumbnail && data.thumbnail.source) {
            return data.thumbnail.source;
        }
        
        // If no Wikipedia image, try a fallback image service or return null
        return null;
    } catch (error) {
        console.error('Error fetching Wikipedia data:', error);
        return null;
    }
}

function closeOverlay() {
    const overlay = document.getElementById('overlay');
    overlay.classList.remove('visible');
    
    // Reset all name tags to their original state
    document.querySelectorAll('.name-tag').forEach(tag => {
        // Remove any inline styles that might interfere with hover
        tag.style.removeProperty('transform');
        tag.style.removeProperty('z-index');
    });
    
    setTimeout(() => {
        overlay.style.display = 'none';
        // Clear selected name when closing overlay
        selectedName = null;
    }, 300);
}

// Word cloud functions
function getColorForCategory(category) {
    return categoryColors[category] || '#757575'; // Default to gray if category not found
}

function getRandomSize() {
    return Math.floor(Math.random() * (48 - 16) + 16);
}

function getRandomPosition(containerWidth, containerHeight, elementWidth, elementHeight) {
    const x = Math.random() * (containerWidth - elementWidth);
    const y = Math.random() * (containerHeight - elementHeight);
    return { x, y };
}

function isOverlapping(rect1, rect2) {
    const padding = 10;
    return !(rect1.right + padding < rect2.left - padding || 
             rect1.left - padding > rect2.right + padding || 
             rect1.bottom + padding < rect2.top - padding || 
             rect1.top - padding > rect2.bottom + padding);
}

function updateWordCloud() {
    const container = document.getElementById('cloud-container');
    container.innerHTML = '';
    const containerRect = container.getBoundingClientRect();
    const placedElements = [];

    // Filter names by selected category (case-insensitive)
    const filteredNames = selectedCategory === 'all' 
        ? userNames 
        : userNames.filter(nameObj => nameObj.category.toLowerCase() === selectedCategory);

    filteredNames.forEach(nameObj => {
        const nameTag = createNameTag(nameObj.name, nameObj.category, 0, 0, getRandomSize());
        container.appendChild(nameTag);
        const elementRect = nameTag.getBoundingClientRect();
        
        // Try to find non-overlapping position
        let attempts = 0;
        let position;
        let overlapping = true;
        
        while (attempts < 100 && overlapping) {
            position = getRandomPosition(
                containerRect.width - elementRect.width,
                containerRect.height - elementRect.height,
                elementRect.width,
                elementRect.height
            );
            
            nameTag.style.left = `${position.x}px`;
            nameTag.style.top = `${position.y}px`;
            
            const currentRect = {
                left: position.x,
                right: position.x + elementRect.width,
                top: position.y,
                bottom: position.y + elementRect.height
            };
            
            overlapping = placedElements.some(rect => isOverlapping(currentRect, rect));
            attempts++;
        }
        
        if (!overlapping) {
            placedElements.push({
                left: position.x,
                right: position.x + elementRect.width,
                top: position.y,
                bottom: position.y + elementRect.height
            });
        }
    });
}

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateWordCloud, 250);
});

// Initialize page
window.addEventListener('load', () => {
    document.getElementById('auth-container').style.display = 'block';
    document.getElementById('logout-btn').style.display = 'none';
    document.getElementById('name-form').style.display = 'none';
    document.getElementById('categories-container').style.display = 'none';
});
