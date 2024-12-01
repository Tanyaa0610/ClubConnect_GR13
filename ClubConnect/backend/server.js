const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/clubconnect', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));

// User schema
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);

// Routes
// Register a new user
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword });
        await user.save();
        res.status(201).send('User registered!');
    } catch (error) {
        res.status(400).send('Error registering user');
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send('User not found');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Invalid credentials');
        }

        const token = jwt.sign({ id: user._id }, 'secretkey', { expiresIn: '1h' });
        res.status(200).json({ token, message: 'Login successful' });
    } catch (error) {
        res.status(500).send('Error logging in');
    }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
// Add this to server.js
// Route to fetch events
app.get('/events', async (req, res) => {
    try {
        const events = await mongoose.connection.collection('events').find({}).toArray();
        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events:', error); // Log the error
        res.status(500).send('Error fetching events');
    }
});

const clubSchema = new mongoose.Schema({
    header: {
        title: String,
        clubLogoSrc: String,
    },
    clubProfile: {
        clubIconSrc: String,
        description: String,
    },
    events: {
        eventWeekText: String,
        eventDetails: {
            title: String,
            time: String,
            location: String,
            invitation: String,
        },
    },
    ClubName: String,
});

// Create model for clubs
const Club = mongoose.model('Club', clubSchema);

// Define API route to get SATA club data
app.get('/club/sata', async (req, res) => {
    try {
        const clubData = await Club.find({ ClubName: 'SATA' });
        res.json(clubData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching club data', error });
    }
});

