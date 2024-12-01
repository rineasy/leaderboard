import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  totalWin: {  
    type: Number,
    required: true,
  },
  avatar: {
    type: String,
    default: (doc: any) => `https://api.dicebear.com/6.x/personas/svg?seed=${doc.name}`,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Player', playerSchema);
