import express from 'express';
import { connectDB } from './config/db.ts';
import productsRoute from './routes/product.route.ts';
import ordersRoute from './routes/order.route.ts';
import menusRoute from './routes/menu.route.ts';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static('uploads'));

connectDB()

app.use('/api/products', productsRoute);
app.use('/api/orders', ordersRoute);
app.use('/api/menus', menusRoute);


// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server is running at http://localhost:${process.env.PORT}`);
});

export default app;