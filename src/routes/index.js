const authRoutes = require("./authRoutes");
const predictionRoutes = require("./predictionRoutes");
const articleRoutes = require("./articleRoutes");

const routes = {
  name: "api-routes",
  register: async (server) => {
    await server.register([authRoutes, predictionRoutes, articleRoutes]);
  },
};

module.exports = routes;
