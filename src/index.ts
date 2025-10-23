import express from 'express';
import { connectDB } from './config/db';
import productsRoute from './routes/products.route';
import ordersRoute from './routes/orders.route';
import menusRoute from './routes/menus.route';
import usersRoute from './routes/users.route';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { setupSwagger } from './swagger';

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs,
  validate: { xForwardedForHeader: false }
}));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static('uploads'));

connectDB()

// Define your routes
app.get('/', (req, res) => {
  res.json({ message: 'Hello from Express on Vercel!' });
});

app.use('/api/products', productsRoute);
app.use('/api/orders', ordersRoute);
app.use('/api/menus', menusRoute);
app.use('/api/users', usersRoute);

setupSwagger(app);

if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000

  // Démarrage local
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`)
  })
}

export default app;