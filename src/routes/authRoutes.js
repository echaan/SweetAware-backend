const authController = require("../controllers/authController");

const authRoutes = {
  name: "auth-routes",
  register: async (server) => {
    server.route([
      {
        method: "POST",
        path: "/api/auth/register",
        handler: authController.register,
        options: {
          auth: false,
          description: "Register a new user",
          tags: ["api", "auth"],
        },
      },
      {
        method: "POST",
        path: "/api/auth/login",
        handler: authController.login,
        options: {
          auth: false,
          description: "Login a user",
          tags: ["api", "auth"],
        },
      },
      {
        method: "GET",
        path: "/api/auth/profile",
        handler: authController.getProfile,
        options: {
          auth: "jwt",
          description: "Get user profile",
          tags: ["api", "auth"],
        },
      },
      {
        method: "PUT",
        path: "/api/auth/profile",
        handler: authController.updateProfile,
        options: {
          auth: "jwt",
          description: "Update user profile",
          tags: ["api", "auth"],
        },
      },
    ]);
  },
};

module.exports = authRoutes;
