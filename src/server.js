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
        origin: ["*"], // Allow all origins in development
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
      // Simple validation - just checking if token can be decoded
      // In a real app, you might want to check if the user still exists in the database
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

  // Add a route for the root path
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
  }); // Initialize the ML model
  try {
    // Check if the initialize method exists in DiabetesPredictionService
    if (typeof DiabetesPredictionService.initialize === "function") {
      await DiabetesPredictionService.initialize();
    } else {
      // If not, use the predictionModel directly
      const predictionModel = require("./utils/predictionModel");
      await predictionModel.initModel();
    }
    console.log("Machine Learning model initialized");
  } catch (error) {
    console.error("Failed to initialize ML model:", error);
  }

  // Start the server
  await server.start();
  console.log(`Server running on ${server.info.uri}`);

  return server;
};

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});

// Export the init function
module.exports = { init };

// If this file is run directly, start the server
if (require.main === module) {
  init().catch((err) => {
    console.error("Error starting server:", err);
    process.exit(1);
  });
}
