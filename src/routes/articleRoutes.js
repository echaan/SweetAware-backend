const articleController = require("../controllers/articleController");

const articleRoutes = {
  name: "article-routes",
  register: async (server) => {
    server.route([
      {
        method: "GET",
        path: "/api/articles",
        handler: articleController.getArticles,
        options: {
          auth: false, // No authentication required for public articles
          description: "Get diabetes-related articles",
          notes: "Fetches articles from external news API",
          tags: ["api", "articles"],
          validate: {
            // Query parameters validation will be handled in the controller
          },
        },
      },
    ]);
  },
};

module.exports = articleRoutes;
