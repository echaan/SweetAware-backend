const Hapi = require("@hapi/hapi");
const hapiAuthJwt = require("hapi-auth-jwt2");
const config = require("./config");
const connectDB = require("./config/database");
const routes = require("./routes");
const { verifyToken } = require("./utils/auth");
const DiabetesPredictionService = require("./utils/predictionService");

const init = async () => {
  // Create the Hapi server
  const server = Hapi.server({
    port: config.port,
    host: "0.0.0.0",
    routes: {
      cors: {
        origin: ["*"],
        headers: ["Accept", "Content-Type", "Authorization"],
        additionalExposedHeaders: ["WWW-Authenticate"],
      },
    },
  });

  // Connect to MongoDB
  await connectDB();

  // Register authentication plugin
  await server.register(hapiAuthJwt);

  // Configure JWT authentication strategy
  server.auth.strategy("jwt", "jwt", {
    key: config.jwtSecret,
    validate: async (decoded, request) => {
      try {
        return { isValid: true, credentials: decoded };
      } catch (error) {
        return { isValid: false };
      }
    },
    verifyOptions: { algorithms: ["HS256"] },
  });

  // Set default authentication
  server.auth.default("jwt");

  // Register routes
  await server.register(routes);

  // Add root path route
  server.route({
    method: "GET",
    path: "/",
    handler: (request, h) => {
      return {
        status: "success",
        message: "SweetAware API is running",
        version: "1.0.0",
      };
    },
    options: { auth: false },
  });

  // Initialize ML model
  try {
    if (typeof DiabetesPredictionService.initialize === "function") {
      await DiabetesPredictionService.initialize();
    } else {
      const predictionModel = require("./utils/predictionModel");
      await predictionModel.initModel();
    }
    console.log("Machine Learning model initialized");
  } catch (error) {
    console.error("Failed to initialize ML model:", error);
  }

  // ===============================
  // LOGGING SETUP
  // ===============================
  // Log every request
  server.events.on("response", (request) => {
    const { method, path } = request;
    const statusCode = request.response ? request.response.statusCode : "N/A";
    console.log(
      `[${new Date().toISOString()}] ${method.toUpperCase()} ${path} --> ${statusCode}`
    );
  });

  // Start the server
  await server.start();
  console.log(`Server running on ${server.info.uri}`);

  return server;
};

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});

// Export init function
module.exports = { init };

// Run server if this file is executed directly
if (require.main === module) {
  init().catch((err) => {
    console.error("Error starting server:", err);
    process.exit(1);
  });
}
