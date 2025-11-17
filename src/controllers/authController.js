const Joi = require("@hapi/joi");
const mongoose = require("mongoose");
const User = require("../models/User");
const { generateToken } = require("../utils/auth");

// Validation schemas
const userValidation = {
  register: Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  updateProfile: Joi.object({
    username: Joi.string().min(3).max(30),
    email: Joi.string().email(),
    currentPassword: Joi.string().min(6),
    newPassword: Joi.string().min(6),
  }).or("username", "email", "newPassword"),
};

// Register a new user
const register = async (request, h) => {
  try {
    const { error } = userValidation.register.validate(request.payload);
    if (error) {
      return h
        .response({
          status: "error",
          message: error.details[0].message,
        })
        .code(400);
    }

    const { username, email, password } = request.payload;

    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      // Mock response for development without database
      console.log("Using mock data - database not connected");
      return h
        .response({
          status: "success",
          message: "User registered successfully (MOCK - No DB)",
          data: {
            id: "60d21b4667d0d8992e610c85", // Mock ID
            username,
            email,
          },
        })
        .code(201);
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return h
        .response({
          status: "error",
          message: "User with this email or username already exists",
        })
        .code(409);
    }

    // Create a new user
    const user = new User({
      username,
      email,
      password,
    });

    await user.save();

    return h
      .response({
        status: "success",
        message: "User registered successfully",
        data: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      })
      .code(201);
  } catch (error) {
    return h
      .response({
        status: "error",
        message: error.message,
      })
      .code(500);
  }
};

// Login user
const login = async (request, h) => {
  try {
    const { error } = userValidation.login.validate(request.payload);
    if (error) {
      return h
        .response({
          status: "error",
          message: error.details[0].message,
        })
        .code(400);
    }

    const { email, password } = request.payload;

    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      // Mock response for development without database
      console.log("Using mock data - database not connected");

      // Generate token for mock user
      const mockUser = {
        _id: "60d21b4667d0d8992e610c85",
        username: email.split("@")[0],
        email,
      };

      const token = generateToken(mockUser);

      return h
        .response({
          status: "success",
          message: "Login successful (MOCK - No DB)",
          data: {
            token,
            user: {
              id: mockUser._id,
              username: mockUser.username,
              email: mockUser.email,
            },
          },
        })
        .code(200);
    }

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return h
        .response({
          status: "error",
          message: "Invalid email or password",
        })
        .code(401);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return h
        .response({
          status: "error",
          message: "Invalid email or password",
        })
        .code(401);
    }

    // Generate token
    const token = generateToken(user);

    return h
      .response({
        status: "success",
        message: "Login successful",
        data: {
          token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
          },
        },
      })
      .code(200);
  } catch (error) {
    return h
      .response({
        status: "error",
        message: error.message,
      })
      .code(500);
  }
};

// Get current user profile
const getProfile = async (request, h) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      // Mock response for development without database
      console.log("Using mock data - database not connected");
      return h
        .response({
          status: "success",
          data: {
            user: {
              id: request.auth.credentials.id,
              username: request.auth.credentials.username,
              email: request.auth.credentials.email,
              createdAt: new Date(),
            },
          },
        })
        .code(200);
    }

    const user = await User.findById(request.auth.credentials.id).select(
      "-password"
    );

    if (!user) {
      return h
        .response({
          status: "error",
          message: "User not found",
        })
        .code(404);
    }

    return h
      .response({
        status: "success",
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
          },
        },
      })
      .code(200);
  } catch (error) {
    return h
      .response({
        status: "error",
        message: error.message,
      })
      .code(500);
  }
};

// Update user profile
const updateProfile = async (request, h) => {
  try {
    const { error } = userValidation.updateProfile.validate(request.payload);
    if (error) {
      return h
        .response({
          status: "error",
          message: error.details[0].message,
        })
        .code(400);
    }

    const userId = request.auth.credentials.id;
    const { username, email, currentPassword, newPassword } = request.payload;

    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      // Mock response for development without database
      console.log("Using mock data - database not connected");

      const updatedFields = {};
      if (username) updatedFields.username = username;
      if (email) updatedFields.email = email;

      return h
        .response({
          status: "success",
          message: "Profile updated successfully (MOCK - No DB)",
          data: {
            user: {
              id: userId,
              username: username || request.auth.credentials.username,
              email: email || request.auth.credentials.email,
              createdAt: new Date(),
            },
          },
        })
        .code(200);
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return h
        .response({
          status: "error",
          message: "User not found",
        })
        .code(404);
    }

    // Jika akan mengganti password, verifikasi password saat ini
    if (newPassword) {
      if (!currentPassword) {
        return h
          .response({
            status: "error",
            message: "Current password is required to set a new password",
          })
          .code(400);
      }

      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        return h
          .response({
            status: "error",
            message: "Current password is incorrect",
          })
          .code(401);
      }

      user.password = newPassword;
    }

    // Check if username is unique if changing username
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return h
          .response({
            status: "error",
            message: "Username already taken",
          })
          .code(409);
      }
      user.username = username;
    }

    // Check if email is unique if changing email
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return h
          .response({
            status: "error",
            message: "Email already in use",
          })
          .code(409);
      }
      user.email = email;
    }

    // Save the updated user
    await user.save();

    return h
      .response({
        status: "success",
        message: "Profile updated successfully",
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
          },
        },
      })
      .code(200);
  } catch (error) {
    console.error("Error updating profile:", error);
    return h
      .response({
        status: "error",
        message: error.message || "An error occurred while updating profile",
      })
      .code(500);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
};
