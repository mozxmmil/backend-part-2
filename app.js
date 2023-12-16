import express from "express";
const app = express();
export default app;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
