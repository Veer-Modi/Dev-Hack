import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    action: { type: String, required: true },
    incidentId: { type: String },
    details: { type: String },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);

ActivityLogSchema.index({ incidentId: 1, timestamp: -1 });

ActivityLogSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id?.toString();
    delete ret._id;
    return ret;
  },
});

export const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);
