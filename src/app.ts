import express from "express";
import healthRouter from "./routes/health";
import authRouter from "./routes/auth";
import todosRouter from "./routes/todos";

const app = express();

app.use(express.json());

app.use("/api", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/todos", todosRouter);

export default app;
