import { NextFunction } from 'express';
import mongoose, { Schema } from 'mongoose';
import Reply from '@customTypes/Reply';

const ReplySchema: Schema = new Schema({
  text: { type: String, minlength: 1, maxlength: 500 },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tweet: {
    type: Schema.Types.ObjectId,
    ref: 'Tweet',
    required: true,
  },
  retweets: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  replies: { type: Number, default: 0 },
  date: {
    type: Date,
    default: Date.now,
  },
});

ReplySchema.pre('find', function(next: NextFunction): void {
  this.populate([{ path: 'user', select: 'username handle' }]);
  next();
});
export default mongoose.model<Reply>('Reply', ReplySchema);
