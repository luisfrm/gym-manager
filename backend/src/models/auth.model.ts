import mongoose from 'mongoose';

const authSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    tpye: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'employee'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
})

export default mongoose.model('Auth', authSchema);