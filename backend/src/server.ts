import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { logger } from './middleware/logger.js'
import { errorHandler } from './middleware/errorHandler.js'
import { initEmailService } from './services/email.service.js'
import { initRedis } from './services/redis.service.js'
import { initializeDatabase } from './services/database.service.js'
import authRoutes from './routes/auth.routes.js'
import emailAuthRoutes from './routes/email-auth.routes.js'
import userRoutes from './routes/user.routes.js'
import shopkeeperRoutes from './routes/shopkeeper.routes.js'
import productRoutes from './routes/product.routes.js'
import orderRoutes from './routes/order.routes.js'
import shopsRoutes from './routes/shops.routes.js'
import productsRoutes from './routes/products.routes.js'
import ordersRoutes from './routes/orders.routes.js'
import cartRoutes from './routes/cart.routes.js'
import messagesRoutes from './routes/messages.routes.js'
import customersRoutes from './routes/customers.routes.js'

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3003',
    credentials: true,
  })
)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/auth', emailAuthRoutes)
app.use('/api/users', userRoutes)
app.use('/api/shopkeepers', shopkeeperRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/shops', shopsRoutes)
app.use('/api/products', productsRoutes)
app.use('/api/orders', ordersRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/messages', messagesRoutes)
app.use('/api/customers', customersRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  })
})

// Error handler
app.use(errorHandler)

// Initialize services and start server
const startServer = async () => {
  try {
    // Initialize email service
    await initEmailService()
    logger.info('Email service initialized')

    // Initialize Redis
    await initRedis()
    logger.info('Redis initialized')

    // Initialize database
    await initializeDatabase()
    logger.info('Database initialized')

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`)
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
      logger.info(`Supabase URL: ${process.env.SUPABASE_URL}`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

export default app
