const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  port: process.env.PORT || 3000,
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/sweetaware",
  jwtSecret: process.env.JWT_SECRET || "default_jwt_secret",
  jwtExpiration: "24h",
  NEWS_API_KEY: process.env.NEWS_API_KEY,
};
