import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import Player from './models/Player';
import Application from './models/Application';
import { auth, AuthRequest } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'development' 
    ? `http://localhost:${process.env.FRONTEND_PORT}` 
    : process.env.FRONTEND_URL
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leaderboard')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Authentication Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check credentials against environment variables
    if (
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD
    ) {
      // Generate JWT token
      const token = jwt.sign(
        { username },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '24h' }
      );

      res.json({ token });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Application Routes
app.post('/api/applications', async (req, res) => {
  try {
    const { name, email, phoneNumber, nickname, accountName, totalWin, proofUrl } = req.body;

    // Validate required fields
    if (!name || !email || !phoneNumber || !nickname || !accountName || !totalWin) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    // Create new application
    const application = new Application({
      name,
      email,
      phoneNumber,
      nickname,
      accountName,
      totalWin,
      proofUrl: proofUrl || '' // Make proofUrl optional with default empty string
    });

    await application.save();
    res.status(201).json(application);
  } catch (error: any) {
    console.error('Error submitting application:', error);
    res.status(400).json({ 
      message: 'Error submitting application', 
      error: error?.message || 'Unknown error' 
    });
  }
});

// Get all applications (admin only)
app.get('/api/applications', auth, async (req: AuthRequest, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications' });
  }
});

// Update application status (admin only)
app.patch('/api/applications/:id', auth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await Application.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // If application is approved, create a new player
    if (status === 'approved') {
      const existingPlayer = await Player.findOne({ name: application.nickname });
      
      if (existingPlayer) {
        // Update existing player's total win if it's higher
        if (application.totalWin > existingPlayer.totalWin) {
          existingPlayer.totalWin = application.totalWin;
          await existingPlayer.save();
        }
      } else {
        // Create new player
        const player = new Player({
          name: application.nickname,
          totalWin: application.totalWin,
          avatar: `https://api.dicebear.com/6.x/personas/svg?seed=${application.nickname}`
        });
        await player.save();
      }
    }

    res.json(application);
  } catch (error) {
    res.status(400).json({ message: 'Error updating application' });
  }
});

// Protected Routes (require authentication)
app.post('/api/players', auth, async (req: AuthRequest, res) => {
  try {
    const { name, totalWin } = req.body;
    const player = new Player({ name, totalWin });
    await player.save();
    res.status(201).json(player);
  } catch (error) {
    res.status(400).json({ message: 'Error creating player' });
  }
});

app.patch('/api/players/:id', auth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { totalWin } = req.body;
    const player = await Player.findByIdAndUpdate(
      id,
      { totalWin },
      { new: true }
    );
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    res.json(player);
  } catch (error) {
    res.status(400).json({ message: 'Error updating player' });
  }
});

app.delete('/api/players/:id', auth, async (req: AuthRequest, res) => {
  try {
    const player = await Player.findByIdAndDelete(req.params.id);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: 'Error deleting player' });
  }
});

// Public Routes (no authentication required)
app.get('/api/players', async (req, res) => {
  try {
    const players = await Player.find().sort({ totalWin: -1 });
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching players' });
  }
});

// Get weekly top players
app.get('/api/players/weekly', async (req, res) => {
  try {
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Start of week (Sunday)

    const players = await Player.find({
      createdAt: { $gte: startOfWeek }
    }).sort({ totalWin: -1 });

    res.json(players);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching weekly players' });
  }
});

// Get monthly top players
app.get('/api/players/monthly', async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setHours(0, 0, 0, 0);
    startOfMonth.setDate(1); // Start of current month

    const players = await Player.find({
      createdAt: { $gte: startOfMonth }
    }).sort({ totalWin: -1 });

    res.json(players);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching monthly players' });
  }
});

app.get('/api/players/top', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const players = await Player.find()
      .sort({ totalWin: -1 })
      .limit(limit);
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching top players' });
  }
});

app.get('/api/players/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    const players = await Player.find({
      name: { $regex: query, $options: 'i' }
    }).sort({ totalWin: -1 });
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: 'Error searching players' });
  }
});

// Test route to create sample players (remove in production)
app.post('/api/test/create-sample-players', async (req, res) => {
  try {
    // Clear existing players
    await Player.deleteMany({});

    // Create sample players
    const samplePlayers = [
      { name: 'Champion123', totalWin: 50000000 },
      { name: 'LuckyWinner', totalWin: 35000000 },
      { name: 'GoldHunter', totalWin: 25000000 },
      { name: 'FortuneMaster', totalWin: 20000000 },
      { name: 'LuckyDragon', totalWin: 15000000 }
    ];

    for (const playerData of samplePlayers) {
      const player = new Player({
        ...playerData,
        avatar: `https://api.dicebear.com/6.x/personas/svg?seed=${playerData.name}`
      });
      await player.save();
    }

    res.status(201).json({ message: 'Sample players created' });
  } catch (error) {
    console.error('Error creating sample players:', error);
    res.status(500).json({ message: 'Error creating sample players' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
