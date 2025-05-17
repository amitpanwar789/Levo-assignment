import express from 'express';
import schemaRoutes from './routes/schemas.js';
import connectDB from './config.js';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

await connectDB();  

app.use(express.json());
app.use('/api/schemas', schemaRoutes);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});