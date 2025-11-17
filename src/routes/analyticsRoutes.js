const analyticsController = require("../controllers/analyticsController");

const analyticsRoutes = {
  name: "analytics-routes",
  register: async function (server) {
    server.route([
      {
        method: "GET",
        path: "/api/analytics/prediction-trend/{userId}",
        handler: analyticsController.getPredictionTrend,
        options: {
          auth: "jwt",
          description: "Get prediction trends for visualization",
          notes: "Returns prediction data formatted for charts",
          tags: ["api", "analytics"],
        },
      },
    ]);
  },
};

module.exports = analyticsRoutes;
