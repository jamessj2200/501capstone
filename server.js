require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// User Signup
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const result = await pool.query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
            [username, email, hashedPassword]
        );
        res.json({ message: "User registered!", user: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// User Signin
app.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length > 0) {
            const validPassword = await bcrypt.compare(password, user.rows[0].password);
            if (validPassword) {
                res.json({ message: `Welcome back, ${user.rows[0].username}!`, user: user.rows[0] });
            } else {
                res.status(400).json({ error: "Invalid password" });
            }
        } else {
            res.status(400).json({ error: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add Event
app.post('/event', async (req, res) => {
    const { user_id, sport_name, event_date, event_time } = req.body;
    try {
        await pool.query(
            "INSERT INTO events (user_id, sport_name, event_date, event_time) VALUES ($1, $2, $3, $4)",
            [user_id, sport_name, event_date, event_time]
        );
        res.json({ message: "Event scheduled!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch Events
app.get('/events/:user_id', async (req, res) => {
    const { user_id } = req.params;
    try {
        const result = await pool.query("SELECT * FROM events WHERE user_id = $1", [user_id]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
document.getElementById('signup-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://localhost:3000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();
    alert(data.message);
    this.reset();
});
document.getElementById('signin-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;

    const response = await fetch('http://localhost:3000/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        document.getElementById('auth').style.display = 'none';
        document.getElementById('scheduler').style.display = 'block';
    } else {
        alert(data.error);
    }
    this.reset();
});
document.getElementById('event-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const sportName = document.getElementById('sport-name').value;
    const eventDate = document.getElementById('event-date').value;
    const eventTime = document.getElementById('event-time').value;
    const user = JSON.parse(localStorage.getItem('user'));

    const response = await fetch('http://localhost:3000/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, sport_name: sportName, event_date: eventDate, event_time: eventTime }),
    });

    const data = await response.json();
    alert(data.message);
    this.reset();
});
async function loadEvents() {
    const user = JSON.parse(localStorage.getItem('user'));
    const response = await fetch(`http://localhost:3000/events/${user.id}`);
    const events = await response.json();

    const eventList = document.getElementById('event-list');
    eventList.innerHTML = '';
    events.forEach(event => {
        const li = document.createElement('li');
        li.textContent = `${event.sport_name} - ${event.event_date} at ${event.event_time}`;
        eventList.appendChild(li);
    });
}

if (localStorage.getItem('user')) {
    document.getElementById('auth').style.display = 'none';
    document.getElementById('scheduler').style.display = 'block';
    loadEvents();
}
