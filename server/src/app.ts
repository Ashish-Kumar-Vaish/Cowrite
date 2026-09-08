import express from "express";
import cors from "cors";
import routes from "./routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { env } from "./config/env.js";

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: env.FRONTEND_URL,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "5mb" }));
app.use(express.text({ type: "text/html", limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.use(errorHandler);

export default app;
