import dotenv from 'dotenv';
import mongoose, { ConnectOptions } from 'mongoose';

process.on('uncaughtException', (err: any) => {
  console.log('UNCAUGHT EXCEPTION!');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './.env' });

import app from './app';

const DB = `${process.env.DB_DATABASE}`;

mongoose
  .connect(DB)
  .then(() => {
    console.log('DB connection was successful!');
  })
  .catch((err) => {
    console.log(`DB_ERROR: ${err}`);
  });

const SERVER_PORT = process.env.APP_PORT || 3000;

const server = app.listen(SERVER_PORT, () => {
  console.log(`App is running on PORT: ${SERVER_PORT}`);
});

process.on('unhandledRejection', (err: any) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED. Shutting down');
  server.close(() => {
    console.log('Process terminated!');
  });
});
