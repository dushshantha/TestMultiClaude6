import express from "express";
import healthRouter from "./routes/health";
import authRouter from "./routes/auth";

const app = express();

app.use(express.json());

app.use("/api", healthRouter);
app.use("/api/auth", authRouter);

export default app;
