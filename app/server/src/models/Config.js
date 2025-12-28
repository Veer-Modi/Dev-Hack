import mongoose from 'mongoose';

const ConfigSchema = new mongoose.Schema(
  {
    // Incident configuration
    slaMinutes: {
      critical: { type: Number, default: 15 },
      high: { type: Number, default: 30 },
      medium: { type: Number, default: 60 },
      low: { type: Number, default: 120 },
    },
    verificationRules: {
      minConfirmations: { type: Number, default: 2 },
    },
    // Notification settings
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
    // System preferences
    preferences: {
      quietHours: { start: { type: String, default: '22:00' }, end: { type: String, default: '06:00' } },
      timezone: { type: String, default: 'UTC' },
      dataRetentionDays: { type: Number, default: 90 },
    },
  },
  { timestamps: true, versionKey: false }
);

ConfigSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id?.toString();
    delete ret._id;
    return ret;
  },
});

export const Config = mongoose.model('Config', ConfigSchema);
