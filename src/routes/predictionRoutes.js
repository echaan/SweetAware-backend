const predictionController = require("../controllers/predictionController");

const predictionRoutes = {
  name: "prediction-routes",
  register: async (server) => {
    server.route([
      {
        method: "POST",
        path: "/api/predictions",
        handler: predictionController.createPrediction,
        options: {
          auth: "jwt",
          description: "Create a new prediction",
          tags: ["api", "predictions"],
        },
      },
      {
        method: "GET",
        path: "/api/predictions",
        handler: predictionController.getPredictionHistory,
        options: {
          auth: "jwt",
          description: "Get prediction history for the user",
          tags: ["api", "predictions"],
        },
      },
      {
        method: "GET",
        path: "/api/predictions/{id}",
        handler: predictionController.getPredictionById,
        options: {
          auth: "jwt",
          description: "Get a specific prediction",
          tags: ["api", "predictions"],
        },
      },
      {
        method: "DELETE",
        path: "/api/predictions/{id}",
        handler: predictionController.deletePrediction,
        options: {
          auth: "jwt",
          description: "Delete a specific prediction",
          tags: ["api", "predictions"],
        },
      },
    ]);
  },
};

module.exports = predictionRoutes;
