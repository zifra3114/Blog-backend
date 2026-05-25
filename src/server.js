import dotenv from "dotenv";
dotenv.config();

// IMPORTANT: use dynamic import so env.js runs AFTER dotenv has loaded .env
const env = (await import("./config/env.js")).default;
const connectDB = (await import("./config/db.js")).default;
const logger = (await import("./config/logger.js")).default;
const corsOptions = (await import("./config/cors.js")).default;
const { default: app } = await import("./app.js");

const PORT = env.PORT || 5000;

const startServer = async () => {
  try {
    // connect DB
    await connectDB();
    logger.info("MongoDB connected successfully");

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
    });

    // 🚨 SOCKET CHECK: Vercel serverless crash se bachne ke liye logic
    if (process.env.NODE_ENV !== "production") {
      const { initSocket } = await import("./config/socket.js");
      initSocket(server, corsOptions);
      logger.info("Socket initialized on Localhost");
    } else {
      logger.info("Socket skipped for Vercel Serverless environment");
    }

    // safety handlers (Sirf local par kill karega, Vercel standard ko distrub nahi karega)
    process.on("unhandledRejection", (err) => {
      logger.error("Unhandled Rejection:", err);
      if (process.env.NODE_ENV !== "production") {
        server.close(() => process.exit(1));
      }
    });

    process.on("uncaughtException", (err) => {
      logger.error("Uncaught Exception:", err);
      if (process.env.NODE_ENV !== "production") {
        process.exit(1);
      }
    });

  } catch (error) {
    logger.error("Server failed to start:", error);
  }
};

startServer();

// 🚨 VERCEL REQUIREMENT: Express app object ko export karna lazmi hai
export default app;