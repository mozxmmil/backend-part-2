import express from "express";
const app = express();
import cors from "cors";
export default app;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
