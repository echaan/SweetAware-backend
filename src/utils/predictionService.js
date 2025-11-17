// File for handling ML model operations
const predictionModel = require("./predictionModel");

/**
 * Service for handling diabetes prediction operations
 */
class DiabetesPredictionService {
  /**
   * Initializes the machine learning model
   */
  static async initialize() {
    return await predictionModel.initModel();
  }

  /**
   * Makes a prediction based on user input data
   * @param {Object} inputData - User input data for prediction
   * @returns {Object} - Prediction result with risk assessment
   */
  static async makePrediction(inputData) {
    try {
      return await predictionModel.predict(inputData);
    } catch (error) {
      console.error("Error making prediction:", error);
      throw error;
    }
  }

  /**
   * Provides recommendations based on prediction results
   * @param {Object} predictionResult - Result of the prediction
   * @returns {Object} - Recommendations for the user
   */ static getRecommendations(predictionResult) {
    const { prediction, details } = predictionResult;
    const recommendations = {
      lifestyle: [],
      monitoring: [],
      consultation: [],
      healthyFoods: [], // Kategori baru untuk makanan sehat
    };

    // General recommendations for all
    recommendations.lifestyle.push(
      "Maintain a balanced diet rich in vegetables and fruits"
    );
    recommendations.lifestyle.push(
      "Regular physical activity (at least 150 minutes per week)"
    );
    recommendations.monitoring.push("Regular blood glucose monitoring");

    // Risk-specific recommendations
    if (prediction === "High Risk") {
      recommendations.monitoring.push(
        "Check blood glucose levels at least twice daily"
      );
      recommendations.consultation.push(
        "Schedule an appointment with an endocrinologist"
      );
      recommendations.lifestyle.push("Consider a low-carbohydrate diet");

      // Makanan sehat untuk risiko tinggi
      recommendations.healthyFoods.push({
        category: "Protein Tanpa Lemak",
        options: [
          "Ikan salmon",
          "Tempe",
          "Tahu",
          "Dada ayam tanpa kulit",
          "Telur (putih telur)",
          "Ikan makarel",
          "Ikan tuna",
          "Kacang edamame",
          "Dada kalkun tanpa kulit",
        ],
      });
      recommendations.healthyFoods.push({
        category: "Karbohidrat Kompleks (Indeks Glikemik Rendah)",
        options: [
          "Beras merah",
          "Quinoa",
          "Oatmeal",
          "Roti gandum utuh",
          "Pasta gandum utuh",
          "Barley",
          "Ubi jalar",
          "Kentang manis",
          "Kacang merah",
          "Kacang hitam",
          "Kacang kedelai",
        ],
      });
      recommendations.healthyFoods.push({
        category: "Sayuran Non-Starchy",
        options: [
          "Bayam",
          "Brokoli",
          "Kale",
          "Kangkung",
          "Selada",
          "Timun",
          "Asparagus",
          "Sawi",
          "Lobak",
          "Paprika",
          "Terong",
          "Jamur",
          "Kubis",
          "Tomat",
          "Daun singkong",
        ],
      });
      recommendations.healthyFoods.push({
        category: "Sumber Lemak Sehat",
        options: [
          "Alpukat",
          "Minyak zaitun",
          "Kacang almond",
          "Ikan berlemak",
          "Kacang kenari",
          "Kacang brasil",
          "Biji chia",
          "Biji rami",
          "Minyak kelapa (porsi terbatas)",
          "Kacang macadamia",
        ],
      });
      recommendations.healthyFoods.push({
        category: "Buah Rendah Glikemik",
        options: [
          "Apel",
          "Pir",
          "Jeruk",
          "Buah beri",
          "Plum",
          "Persik",
          "Jambu biji",
          "Kiwi",
          "Jeruk bali",
          "Buah naga merah",
        ],
      });
      recommendations.healthyFoods.push({
        category: "Bumbu dan Rempah",
        options: [
          "Kayu manis",
          "Kunyit",
          "Jahe",
          "Bawang putih",
          "Bawang merah",
          "Ketumbar",
          "Jintan",
          "Pala",
          "Oregano",
          "Thyme",
          "Kemangi",
          "Daun kari",
        ],
      });
    } else if (prediction === "Moderate Risk") {
      recommendations.monitoring.push("Check blood glucose levels weekly");
      recommendations.consultation.push(
        "Follow up with your primary care physician"
      );

      // Makanan sehat untuk risiko sedang
      recommendations.healthyFoods.push({
        category: "Protein Seimbang",
        options: [
          "Ikan",
          "Ayam tanpa kulit",
          "Daging tanpa lemak",
          "Tahu",
          "Tempe",
          "Kacang-kacangan",
          "Telur utuh (terbatas)",
          "Yogurt Yunani",
          "Cottage cheese rendah lemak",
          "Kacang lentil",
        ],
      });
      recommendations.healthyFoods.push({
        category: "Karbohidrat Sehat",
        options: [
          "Beras merah",
          "Gandum utuh",
          "Ubi jalar",
          "Kentang dengan kulit",
          "Jagung manis",
          "Mie shirataki",
          "Roti gandum",
          "Havermut",
          "Mie soba (buckwheat)",
          "Kacang polong",
          "Sukun",
        ],
      });
      recommendations.healthyFoods.push({
        category: "Sayuran Segar",
        options: [
          "Sayuran hijau",
          "Tomat",
          "Mentimun",
          "Wortel",
          "Brokoli",
          "Kembang kol",
          "Labu siam",
          "Terong",
          "Okra/bendi",
          "Tauge",
          "Kacang panjang",
          "Buncis",
        ],
      });
      recommendations.healthyFoods.push({
        category: "Buah-buahan (Porsi Terkontrol)",
        options: [
          "Apel",
          "Jeruk",
          "Pir",
          "Buah beri",
          "Jambu biji",
          "Pepaya",
          "Melon",
          "Semangka (porsi kecil)",
          "Anggur (10-15 butir)",
          "Pisang hijau/belum terlalu matang",
        ],
      });
      recommendations.healthyFoods.push({
        category: "Minuman Sehat",
        options: [
          "Air putih",
          "Teh hijau tanpa gula",
          "Air infus dengan mentimun/lemon",
          "Teh herbal",
          "Kopi hitam tanpa gula (terbatas)",
          "Air kelapa muda (tanpa gula tambahan)",
        ],
      });
      recommendations.healthyFoods.push({
        category: "Camilan Sehat",
        options: [
          "Kacang tanpa garam",
          "Edamame rebus",
          "Yogurt tanpa gula",
          "Buah segar",
          "Keju cottage rendah lemak",
          "Telur rebus",
          "Irisan sayuran mentah dengan hummus",
          "Alpukat (1/4 buah)",
        ],
      });
    } else {
      recommendations.monitoring.push("Check blood glucose levels monthly");

      // Makanan sehat untuk risiko rendah
      recommendations.healthyFoods.push({
        category: "Pola Makan Seimbang",
        options: [
          "Berbagai jenis ikan",
          "Daging tanpa lemak",
          "Produk susu rendah lemak",
          "Berbagai jenis biji-bijian",
          "Telur",
          "Makanan laut",
          "Ayam dan unggas",
          "Produk kedelai",
        ],
      });
      recommendations.healthyFoods.push({
        category: "Buah dan Sayur",
        options: [
          "5 porsi sayur dan buah setiap hari",
          "Buah-buahan segar",
          "Sayuran beraneka warna",
          "Sayuran hijau",
          "Buah berries",
          "Buah jeruk",
          "Sayuran akar",
          "Sayuran kol/kubis",
        ],
      });
      recommendations.healthyFoods.push({
        category: "Sumber Serat",
        options: [
          "Gandum utuh",
          "Beras merah",
          "Kacang-kacangan",
          "Biji-bijian",
          "Oatmeal",
          "Roti gandum utuh",
          "Quinoa",
          "Barley",
          "Pasta gandum utuh",
          "Chia seeds",
        ],
      });
      recommendations.healthyFoods.push({
        category: "Makanan Tradisional Sehat",
        options: [
          "Pepes ikan",
          "Sayur asem",
          "Sayur lodeh dengan santan encer",
          "Tempe mendoan (dipanggang)",
          "Tahu bacem",
          "Gado-gado (saus kacang sedang)",
          "Capcay sayuran",
          "Sup bening bayam",
          "Tumis kangkung",
        ],
      });
      recommendations.healthyFoods.push({
        category: "Kombinasi Menu Sehat",
        options: [
          "Sarapan: Bubur havermut dengan buah dan kacang",
          "Makan siang: Nasi merah dengan ikan dan sayur-mayur",
          "Makan malam: Sup sayuran dengan protein tanpa lemak",
          "Camilan: Yogurt dengan buah segar atau kacang",
          "Sarapan alternatif: Roti gandum utuh dengan telur dan sayuran",
        ],
      });
    }

    // Factor-specific recommendations
    const factors = details.factors;
    if (factors.bmi === "Overweight") {
      recommendations.lifestyle.push(
        "Work towards achieving a healthy weight through diet and exercise"
      );

      // Tambahan rekomendasi makanan untuk faktor BMI tinggi
      recommendations.healthyFoods.push({
        category: "Makanan Rendah Kalori Tinggi Serat",
        options: [
          "Sup sayuran tanpa krim",
          "Salad dengan dressing rendah lemak",
          "Buah-buahan segar utuh (bukan jus)",
          "Sayuran kukus tanpa saus",
          "Oatmeal plain",
          "Agar-agar tanpa gula",
          "Teh herbal tanpa gula",
        ],
      });
    }

    if (factors.bloodGlucoseLevel === "High") {
      recommendations.lifestyle.push(
        "Reduce intake of simple carbohydrates and sugary foods"
      );
      recommendations.monitoring.push(
        "Monitor blood glucose levels more frequently"
      );

      // Tambahan rekomendasi makanan untuk gula darah tinggi
      recommendations.healthyFoods.push({
        category: "Makanan Penstabil Gula Darah",
        options: [
          "Kacang almond mentah",
          "Telur rebus",
          "Alpukat",
          "Yogurt Greek plain",
          "Ikan salmon",
          "Apel dengan kulit",
          "Kacang tanah tanpa garam",
          "Mentimun segar",
          "Kayu manis (sebagai bumbu)",
          "Daun salam",
        ],
      });
    }

    if (factors.hbA1cLevel === "Elevated") {
      recommendations.consultation.push(
        "Discuss HbA1c management with your healthcare provider"
      );

      // Tambahan rekomendasi makanan untuk HbA1c tinggi
      recommendations.healthyFoods.push({
        category: "Makanan untuk Kontrol Gula Darah Jangka Panjang",
        options: [
          "Cuka sari apel (1-2 sdm dalam air sebelum makan)",
          "Bawang putih",
          "Jahe",
          "Teh hijau tanpa gula",
          "Ikan berlemak (salmon, makarel)",
          "Kerang",
          "Biji chia",
          "Biji rami",
          "Kayu manis",
          "Kunyit",
          "Bayam",
          "Brokoli",
        ],
      });
    }

    // Rekomendasi Pola Makan Umum
    recommendations.healthyFoods.push({
      category: "Prinsip Makan untuk Kesehatan Metabolik",
      options: [
        "Makan porsi kecil tapi sering (3 kali makan utama dan 2-3 camilan sehat)",
        "Kombinasikan protein dengan karbohidrat di setiap makanan",
        "Konsumsi makanan tinggi serat setiap hari (minimal 25-30 gram)",
        "Batasi makanan olahan dan tinggi gula",
        "Hindari minuman manis dan beralkohol",
        "Perhatikan ukuran porsi terutama untuk karbohidrat",
        "Hindari makanan yang digoreng, pilih dipanggang, dikukus, atau direbus",
      ],
    });

    // Rekomendasi Food Pairing untuk Gula Darah Stabil
    recommendations.healthyFoods.push({
      category: "Food Pairing untuk Gula Darah Stabil",
      options: [
        "Kombinasikan karbohidrat dengan protein (nasi dengan ikan)",
        "Konsumsi lemak sehat dengan karbohidrat (alpukat dengan roti gandum)",
        "Makan sayuran terlebih dahulu sebelum karbohidrat",
        "Tambahkan cuka atau lemon pada makanan berkarbohidrat",
        "Konsumsi buah dengan yogurt atau kacang daripada sendiri",
      ],
    });

    return recommendations;
  }
}

module.exports = DiabetesPredictionService;
