import mongoose from 'mongoose';

const SurveySchema = new mongoose.Schema(
  {
    incidentId: { type: String, required: true, index: true },
    respondentId: { type: String, required: true, index: true },
    respondentType: { 
      type: String, 
      enum: ['reporter', 'responder', 'citizen'], 
      required: true 
    },
    responses: {
      overallSatisfaction: { type: Number, min: 1, max: 5 },
      responseTime: { type: Number, min: 1, max: 5 },
      resolutionQuality: { type: Number, min: 1, max: 5 },
      staffCourtesy: { type: Number, min: 1, max: 5 },
      wouldRecommend: { type: Boolean },
      additionalComments: { type: String },
      rating: { type: Number, min: 1, max: 5 }, // Overall rating
    },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

// Ensure a user can only submit one survey per incident
SurveySchema.index({ incidentId: 1, respondentId: 1 }, { unique: true });

SurveySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id?.toString();
    delete ret._id;
    return ret;
  },
});

export const Survey = mongoose.model('Survey', SurveySchema);