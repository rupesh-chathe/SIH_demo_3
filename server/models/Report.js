import mongoose from 'mongoose'

const reportSchema = new mongoose.Schema(
  {
    reportId: { type: String, required: true, unique: true, index: true },
    source: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    disasterType: { type: String, required: true },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    imageUrl: { type: String },
    reporterName: { type: String },
    linkedIncidentId: { type: String },
  },
  { timestamps: true }
)

export default mongoose.model('Report', reportSchema)
