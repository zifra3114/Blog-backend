import dotenv from "dotenv";
dotenv.config();

// IMPORTANT: use dynamic import so env.js runs AFTER dotenv has loaded .env
const env = (await import("./config/env.js")).default;
const connectDB = (await import("./config/db.js")).default;
const logger = (await import("./config/logger.js")).default;
const corsOptions = (await import("./config/cors.js")).default;
const { initSocket } = await import("./config/socket.js");
const { default: app } = await import("./app.js");

const PORT = env.PORT || 5000;

const startServer = async () => {
  try {
    // connect DB
    await connectDB();
    logger.info("MongoDB connected successfully");

    // start server
    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
      logger.info(`API running on http://localhost:${PORT}`);
    });

    // socket
    initSocket(server, corsOptions);
    logger.info("Socket initialized");

    // safety handlers
    process.on("unhandledRejection", (err) => {
      logger.error("Unhandled Rejection:", err);
      server.close(() => process.exit(1));
    });

    process.on("uncaughtException", (err) => {
      logger.error("Uncaught Exception:", err);
      process.exit(1);
    });

  } catch (error) {
    logger.error("Server failed to start:", error);
    process.exit(1);
  }
};

startServer();