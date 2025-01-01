import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { PORT } from './config';
import authRouter from './routes/auth.routes';

const createApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  // Routes
  app.use('/api/auth', authRouter);

  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

export default createApp;