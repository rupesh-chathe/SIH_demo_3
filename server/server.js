import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB } from './config/db.js'
import { seedDatabase } from './controllers/seedController.js'
import incidentRoutes from './routes/incidents.js'
import reportRoutes from './routes/reports.js'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/incidents', incidentRoutes)
app.use('/api/reports', reportRoutes)

async function start() {
  await connectDB()
  await seedDatabase()
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start()
