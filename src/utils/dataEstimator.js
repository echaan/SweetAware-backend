/**
 * Mengisi nilai yang hilang pada input data dengan estimasi berbasis statistik dan faktor risiko
 * @param {Object} inputData - Data input dari user, mungkin tidak lengkap
 * @returns {Object} - Data lengkap dengan nilai yang diestimasi untuk field yang hilang
 */
function estimateMissingValues(inputData) {
  // Clone input data agar tidak mengubah aslinya
  const estimatedData = { ...inputData };

  // Variabel yang opsional
  if (estimatedData.hypertension === undefined) {
    // Estimasi hypertension berdasarkan umur dan BMI
    if (estimatedData.age > 60 || estimatedData.bmi > 30) {
      estimatedData.hypertension = true;
    } else {
      estimatedData.hypertension = false;
    }
  }

  // Estimasi HbA1c jika tidak ada
  if (estimatedData.hbA1cLevel === undefined) {
    // Estimasi berdasarkan umur, BMI, dan penyakit jantung
    let baseHbA1c = 5.0; // Nilai normal

    // Faktor umur
    if (estimatedData.age > 60) baseHbA1c += 0.5;
    else if (estimatedData.age > 45) baseHbA1c += 0.3;

    // Faktor BMI
    if (estimatedData.bmi > 30) baseHbA1c += 0.7;
    else if (estimatedData.bmi > 25) baseHbA1c += 0.4;

    // Faktor penyakit dan riwayat
    if (estimatedData.heartDisease) baseHbA1c += 0.5;
    if (estimatedData.hypertension) baseHbA1c += 0.4;
    if (estimatedData.smokingHistory === "current") baseHbA1c += 0.3;

    estimatedData.hbA1cLevel = baseHbA1c;
    console.log(`Estimated HbA1c level: ${baseHbA1c}`);
  }

  // Estimasi kadar glukosa jika tidak ada
  if (estimatedData.bloodGlucoseLevel === undefined) {
    // Estimasi berdasarkan HbA1c (yang mungkin sudah diestimasi)
    // Formula: fasting glucose ~= (28.7 × HbA1c) - 46.7 (variasi dari studi medis)
    let estimatedGlucose = 28.7 * estimatedData.hbA1cLevel - 46.7;

    // Batasi nilai ke rentang yang masuk akal
    estimatedGlucose = Math.max(70, Math.min(250, estimatedGlucose));

    estimatedData.bloodGlucoseLevel = estimatedGlucose;
    console.log(`Estimated blood glucose level: ${estimatedGlucose}`);
  }

  return estimatedData;
}

module.exports = {
  estimateMissingValues,
};
