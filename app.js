import createError from "http-errors";
import express from "express";
import path from "path";
import logger from "morgan";
import checksRouter from "./routes/checks.js";
import retractionsRouter from "./routes/retractions.js";

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.static(path.join(import.meta.dirname, "public")));
app.use("/api/checks", checksRouter);
app.use("/api/retractions", retractionsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
// eslint-disable-next-line no-unused-vars
app.use(function (err, req, res, next) {
  const status = err.status || 500;
  if (status === 500) console.error(err); // log real bugs on the server
  res.status(status).json({ error: err.message });
});

export default app;


