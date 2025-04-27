import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import uploadRoutes from './router/upload';
import userRoutes from './router/user';
import postRoutes from './router/post';

const app = express();

const apiRouter = express.Router();

apiRouter.use('/user', userRoutes);
apiRouter.use('/upload', uploadRoutes);
apiRouter.use('/post', postRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/api', apiRouter);

app.listen(3000, () => {
  console.log('Server is live');
});