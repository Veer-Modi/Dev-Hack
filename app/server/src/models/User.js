import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    role: { type: String, enum: ['citizen', 'responder', 'admin'], required: true },
    avatar: { type: String },
    isActive: { type: Boolean, default: true, index: true },
    passwordHash: { type: String },
    points: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [{ type: String }],
    stats: {
      totalReports: { type: Number, default: 0 },
      verifiedReports: { type: Number, default: 0 },
      resolvedReports: { type: Number, default: 0 },
      totalUpvotes: { type: Number, default: 0 },
      streak: { type: Number, default: 0 },
      lastReportDate: { type: Date },
    },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

UserSchema.index({ role: 1, isActive: 1 });

UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id?.toString();
    delete ret._id;
    delete ret.passwordHash;
    return ret;
  },
});

export const User = mongoose.model('User', UserSchema);
