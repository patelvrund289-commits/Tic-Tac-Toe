const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');
const gameHandler = require('./socket/gameHandler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Data storage file path
const DATA_FILE = path.join(__dirname, '../data/users.json');

// Ensure data directory exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ users: [], gamesPlayed: 0 }, null, 2));
}

// Helper function to read users data
function readUsersData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading users data:', error);
        return { users: [], gamesPlayed: 0 };
    }
}

// Helper function to write users data
function writeUsersData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing users data:', error);
    }
}

// Game of Thrones character names for new users
const gotNames = [
    'Jon Snow', 'Daenerys Targaryen', 'Tyrion Lannister', 'Arya Stark', 'Sansa Stark',
    'Cersei Lannister', 'Jaime Lannister', 'Bran Stark', 'Samwell Tarly', 'Theon Greyjoy',
    'Eddard Stark', 'Catelyn Stark', 'Robb Stark', 'Joffrey Baratheon', 'Stannis Baratheon',
    'Renly Baratheon', 'Brienne of Tarth', 'Sandor Clegane', 'Petyr Baelish', 'Varys',
    'Davos Seaworth', 'Melisandre', 'Bronn', 'Podrick Payne', 'Gendry', 'Beric Dondarrion',
    'Thoros of Myr', 'Gregor Clegane', 'Ilyn Payne', 'Margaery Tyrell', 'Olenna Tyrell',
    'Loras Tyrell', 'Tommen Baratheon', 'Myrcella Baratheon', 'Ellaria Sand', 'Obara Sand',
    'Nymeria Sand', 'Tyene Sand', 'Trystane Martell', 'Doran Martell', 'Asha Greyjoy',
    'Euron Greyjoy', 'Balon Greyjoy', 'Yara Greyjoy', 'Ramsay Bolton', 'Roose Bolton',
    'Rickon Stark', 'Osha', 'Meera Reed', 'Jojen Reed', 'Hodor', 'Summer', 'Shaggydog',
    'Ghost', 'Nymeria', 'Lady', 'Grey Wind'
];

// API Routes

// Create new user
app.post('/api/create-user', (req, res) => {
    try {
        const data = readUsersData();

        // Generate unique username
        let username;
        let attempts = 0;
        do {
            username = gotNames[Math.floor(Math.random() * gotNames.length)];
            attempts++;
            if (attempts > 100) {
                // Fallback if we can't find a unique name
                username = `Player_${Date.now()}`;
                break;
            }
        } while (data.users.some(user => user.username === username));

        // Generate 4-digit PIN
        const pin = Math.floor(1000 + Math.random() * 9000).toString();

        const newUser = {
            id: Date.now().toString(),
            username,
            pin,
            createdAt: new Date().toISOString(),
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            draws: 0
        };

        data.users.push(newUser);
        writeUsersData(data);

        res.json({
            success: true,
            user: newUser,
            username: newUser.username,
            pin: newUser.pin
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Login user
app.post('/api/login', (req, res) => {
    try {
        const { username, pin } = req.body;
        const data = readUsersData();

        const user = data.users.find(u => u.username === username && u.pin === pin);

        if (user) {
            res.json({
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    gamesPlayed: user.gamesPlayed,
                    wins: user.wins,
                    losses: user.losses,
                    draws: user.draws
                }
            });
        } else {
            res.status(401).json({ error: 'Invalid username or PIN' });
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get user stats (for admin panel)
app.get('/api/admin/stats', (req, res) => {
    try {
        const data = readUsersData();
        const stats = {
            totalUsers: data.users.length,
            totalGames: data.gamesPlayed,
            activeUsers: data.users.filter(u => u.gamesPlayed > 0).length,
            users: data.users.map(u => ({
                id: u.id,
                username: u.username,
                gamesPlayed: u.gamesPlayed,
                wins: u.wins,
                losses: u.losses,
                draws: u.draws,
                createdAt: u.createdAt
            }))
        };
        res.json(stats);
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

// Admin login
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;

    // Simple admin credentials (in production, use proper authentication)
    if (username === 'admin' && password === '1379') {
        res.json({ success: true, message: 'Admin logged in successfully' });
    } else {
        res.status(401).json({ error: 'Invalid admin credentials' });
    }
});

// Update user stats after game
app.post('/api/update-stats', (req, res) => {
    try {
        const { userId, result } = req.body; // result: 'win', 'loss', 'draw'
        const data = readUsersData();

        const user = data.users.find(u => u.id === userId);
        if (user) {
            user.gamesPlayed++;
            if (result === 'win') user.wins++;
            else if (result === 'loss') user.losses++;
            else if (result === 'draw') user.draws++;

            data.gamesPlayed++;
            writeUsersData(data);

            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating stats:', error);
        res.status(500).json({ error: 'Failed to update stats' });
    }
});

// Initialize Socket.IO game handler
gameHandler(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
