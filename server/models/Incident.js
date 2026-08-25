import mongoose from 'mongoose'

const incidentSchema = new mongoose.Schema(
  {
    incidentId: { type: String, required: true, unique: true, index: true },
    disasterType: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    confidence: { type: Number, default: 0 },
    sources: [{ type: String }],
    supportingReports: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending',
    },
    aiAnalysis: {
      detectedType: { type: String },
      extractedLocation: { type: String },
      severityAssessment: { type: String },
      confidenceScore: { type: Number },
    },
    evidence: [
      {
        source: { type: String },
        description: { type: String },
        url: { type: String },
      },
    ],
  },
  { timestamps: true }
)

export default mongoose.model('Incident', incidentSchema)
