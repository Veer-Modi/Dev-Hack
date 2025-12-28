import mongoose from 'mongoose';

const IncidentSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    severity: { type: String, enum: ['critical', 'high', 'medium', 'low'], required: true },
    status: {
      type: String,
      enum: ['unverified', 'partially-verified', 'verified', 'in-progress', 'resolved'],
      default: 'unverified',
      index: true,
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, required: true },
    },
    reportedBy: { type: String, required: true },
    assignedTo: { type: String },
    mediaUrls: [{ type: String }],
    upvotes: { type: Number, default: 0, index: true },
  },
  { timestamps: { createdAt: 'reportedAt', updatedAt: 'updatedAt' } }
);

IncidentSchema.index({ severity: 1, status: 1, updatedAt: -1 });
IncidentSchema.index({ 'location.lat': 1, 'location.lng': 1 });

// Ensure frontend receives `id` instead of `_id`, remove __v
IncidentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id?.toString();
    delete ret._id;
    return ret;
  },
});

export const Incident = mongoose.model('Incident', IncidentSchema);
