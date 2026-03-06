const tf = require("@tensorflow/tfjs-node");
const path = require("path");
const { estimateMissingValues } = require("./dataEstimator");

let model = null;

/**
 * Initialize the TensorFlow.js model for diabetes prediction
 */
async function initModel() {
  try {
    const modelPath = path.resolve(__dirname, "../../model/tfjs_model/model.json");
    model = await tf.loadLayersModel(`file://${modelPath}`);
    console.log("Model loaded from JSON!");
    return true;
  } catch (error) {
    console.error("Error loading the diabetes prediction model:", error);
    throw error; // bisa throw atau return false sesuai kebutuhan
  }
}

/**
 * Preprocess input data for the model
 * @param {Object} inputData - Raw input data from user
 * @returns {tf.Tensor} - Preprocessed tensor ready for prediction
 */
function preprocessInput(inputData) {
  const features = [
    inputData.gender === "Male" ? 1 : 0,
    Math.min(inputData.age / 100, 1),
    inputData.hypertension ? 1 : 0,
    inputData.heartDisease ? 1 : 0,
    inputData.smokingHistory === "never"
      ? 0
      : inputData.smokingHistory === "former"
      ? 0.5
      : 1,
    Math.min(inputData.bmi / 50, 1),
    Math.min(inputData.hbA1cLevel / 15, 1),
    Math.min(inputData.bloodGlucoseLevel / 300, 1),
  ];

  return tf.tensor2d([features]);
}

/**
 * Make a diabetes prediction using the loaded model
 * @param {Object} inputData - Raw input data from user
 * @returns {Object} - Prediction result with riskScore and risk assessment
 */
async function predict(inputData) {
  if (!model) {
    await initModel();
  }

  const completeData = estimateMissingValues(inputData);
  const inputTensor = preprocessInput(completeData);
  let probabilityValue;

  try {
    const predictionTensor = model.predict(inputTensor);
    probabilityValue = predictionTensor.dataSync()[0];
    tf.dispose([inputTensor, predictionTensor]);
  } catch (predictionError) {
    console.error("Model prediction error:", predictionError);
    // Rule-based fallback
    let riskFactors = 0;
    if (inputData.bloodGlucoseLevel > 125) riskFactors += 0.3;
    if (inputData.hbA1cLevel > 6) riskFactors += 0.3;
    if (inputData.bmi > 25) riskFactors += 0.15;
    if (inputData.age > 45) riskFactors += 0.15;
    if (inputData.hypertension || inputData.heartDisease) riskFactors += 0.1;
    probabilityValue = Math.min(riskFactors, 0.95);
    tf.dispose([inputTensor]);
  }

  // Determine risk level
  let riskLevel = probabilityValue > 0.7
    ? "High Risk"
    : probabilityValue > 0.3
    ? "Moderate Risk"
    : "Low Risk";

  const details = {
    factors: {
      bloodGlucoseLevel: completeData.bloodGlucoseLevel > 140 ? "High" : "Normal",
      hbA1cLevel: completeData.hbA1cLevel > 6.5 ? "Elevated" : "Normal",
      bmi: completeData.bmi > 25 ? "Overweight" : "Normal",
      hypertension: completeData.hypertension ? "Present" : "Absent",
      heartDisease: completeData.heartDisease ? "Present" : "Absent",
    },
    estimatedFields: [],
  };

  if (inputData.bloodGlucoseLevel === undefined) details.estimatedFields.push("bloodGlucoseLevel");
  if (inputData.hbA1cLevel === undefined) details.estimatedFields.push("hbA1cLevel");
  if (inputData.hypertension === undefined) details.estimatedFields.push("hypertension");

  let accuracy = 1.0;
  if (details.estimatedFields.includes("bloodGlucoseLevel")) accuracy -= 0.15;
  if (details.estimatedFields.includes("hbA1cLevel")) accuracy -= 0.15;
  if (details.estimatedFields.includes("hypertension")) accuracy -= 0.05;
  accuracy = Math.max(0, parseFloat(accuracy.toFixed(2)));

  return {
    prediction: riskLevel,
    riskScore: parseFloat(probabilityValue.toFixed(2)),
    details,
    accuracy,
    isEstimated: details.estimatedFields.length > 0,
    estimatedFields: details.estimatedFields,
  };
}

module.exports = {
  initModel,
  predict,
};