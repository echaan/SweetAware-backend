const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  inputData: {
    // Definisi input untuk prediksi diabetes
    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    hypertension: {
      type: Boolean,
      required: false,
      default: false,
    },
    heartDisease: {
      type: Boolean,
      required: true,
    },
    smokingHistory: {
      type: String,
      enum: ["never", "former", "current"],
      required: true,
    },
    bmi: {
      type: Number,
      required: true,
    },
    hbA1cLevel: {
      type: Number,
      required: false,
    },
    bloodGlucoseLevel: {
      type: Number,
      required: false,
    },
  },
  result: {
    prediction: { type: String, required: true },
    riskScore: { type: Number },
    details: { type: mongoose.Schema.Types.Mixed },
    recommendations: { type: mongoose.Schema.Types.Mixed },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Prediction = mongoose.model("Prediction", predictionSchema);

module.exports = Prediction;
