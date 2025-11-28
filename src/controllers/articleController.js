const axios = require("axios");
const config = require("../config");
const Joi = require("@hapi/joi");

// Validation schema
const articlesValidation = Joi.object({
  topic: Joi.string().default("diabetes"),
  limit: Joi.number().integer().min(1).max(50).default(10),
});

// Simple in-memory cache with TTL (Time To Live)
const cache = {
  articles: null,
  timestamp: null,
  ttl: 15 * 60 * 1000, // Cache for 15 minutes
};

/**
 * Fetches articles from external news API
 * @param {Object} request - Hapi request object
 * @param {Object} h - Hapi response toolkit
 */
const getArticles = async (request, h) => {
  try {
    // Validate query parameters
    const { error, value } = articlesValidation.validate(request.query);
    if (error) {
      return h
        .response({
          status: "error",
          message: error.details[0].message,
        })
        .code(400);
    }

    // Extract values with defaults
    const { topic = "diabetes", limit = 10 } = value;

    // Log request for debugging
    console.log(
      `Article request - Topic: ${
        topic || "diabetes (default)"
      }, Limit: ${limit}`
    );

    // Return cached data if available and still valid
    if (
      cache.articles &&
      cache.timestamp &&
      Date.now() - cache.timestamp < cache.ttl
    ) {
      const filteredArticles = filterArticles(cache.articles, topic, limit);
      return h.response(filteredArticles);
    }

    // Get API key from config or environment variable
    const API_KEY = process.env.NEWS_API_KEY || config.NEWS_API_KEY;
    if (!API_KEY || API_KEY === "sample_news_api_key") {
      console.log("Using mock data for articles (no valid API key)");

      // Mock data for testing
      const mockArticles = [
        {
          title: "Cara Mengontrol Gula Darah Secara Alami",
          summary:
            "Berikut adalah beberapa tips alami untuk menjaga kadar gula darah tetap stabil...",
          url: "https://news.example.com/artikel-diabetes-1",
          source: "Healthline",
          publishedAt: "2025-05-28T12:00:00Z",
          imageUrl: "https://example.com/images/diabetes-care.jpg",
        },
        {
          title: "10 Makanan yang Baik untuk Penderita Diabetes",
          summary:
            "Diet sehat merupakan kunci pengelolaan diabetes. Artikel ini membahas makanan yang dapat membantu mengontrol gula darah...",
          url: "https://news.example.com/artikel-diabetes-2",
          source: "Medical News Today",
          publishedAt: "2025-05-25T09:30:00Z",
          imageUrl: "https://example.com/images/diabetes-food.jpg",
        },
        {
          title: "Penelitian Terbaru Tentang Pengobatan Diabetes",
          summary:
            "Para peneliti menemukan pendekatan baru untuk mengelola diabetes tipe 2 yang menjanjikan...",
          url: "https://news.example.com/artikel-diabetes-3",
          source: "Journal of Endocrinology",
          publishedAt: "2025-05-20T14:45:00Z",
          imageUrl: "https://example.com/images/diabetes-research.jpg",
        },
        {
          title: "Olahraga yang Direkomendasikan untuk Penderita Diabetes",
          summary:
            "Aktivitas fisik yang tepat dapat membantu mengelola kadar gula darah. Berikut adalah rekomendasi olahraga untuk penderita diabetes...",
          url: "https://news.example.com/artikel-diabetes-4",
          source: "Sports Medicine Today",
          publishedAt: "2025-05-18T10:15:00Z",
          imageUrl: "https://example.com/images/diabetes-exercise.jpg",
        },
        {
          title: "Hubungan Stres dan Diabetes",
          summary:
            "Stres dapat memperburuk kondisi diabetes. Pelajari cara mengelola stres untuk kesehatan yang lebih baik...",
          url: "https://news.example.com/artikel-diabetes-5",
          source: "Psychology Today",
          publishedAt: "2025-05-15T16:30:00Z",
          imageUrl: "https://example.com/images/stress-diabetes.jpg",
        },
      ];

      // Filter based on topic and limit
      const filteredArticles = filterArticles(mockArticles, topic, limit);

      // Store in cache for future requests
      cache.articles = mockArticles;
      cache.timestamp = Date.now();

      return h.response(filteredArticles);
    } // Construct API URL with better search terms based on topic
    let searchQuery = topic;

    // If topic is not specified or is 'diabetes', add more relevant terms
    if (!topic || topic === "diabetes") {
      searchQuery = 'diabetes OR "gula darah" OR "kencing manis" OR diabetik';
      console.log("Menampilkan artikel diabetes (default)");
    } else {
      // For other topics, add health-related context
      searchQuery = `${topic} AND (kesehatan OR penyakit OR pengobatan OR pencegahan)`;
    }

    const apiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
      searchQuery
    )}&language=id&sortBy=publishedAt&apiKey=${API_KEY}`;
    console.log(`Fetching articles with query: ${searchQuery}`);

    // Fetch articles
    const response = await axios.get(apiUrl);

    if (response.data && response.data.articles) {
      // Format articles to match the expected output
      const formattedArticles = response.data.articles.map((article) => ({
        title: article.title,
        summary: article.description || article.content,
        url: article.url,
        source: article.source?.name || "Unknown",
        publishedAt: article.publishedAt,
        imageUrl: article.urlToImage,
      }));

      // Store in cache
      cache.articles = formattedArticles;
      cache.timestamp = Date.now();

      // Filter based on topic and limit
      const filteredArticles = filterArticles(formattedArticles, topic, limit);

      return h.response(filteredArticles);
    } else {
      console.error("Unexpected API response format:", response.data);
      return h
        .response({
          status: "error",
          message: "Gagal mengambil artikel. Format respons tidak valid.",
        })
        .code(500);
    }
  } catch (error) {
    console.error("Error fetching articles:", error.message);

    // Handle API rate limits or invalid key issues
    if (error.response) {
      const status = error.response.status;

      if (status === 429) {
        return h
          .response({
            status: "error",
            message: "Batas penggunaan API tercapai. Silakan coba lagi nanti.",
          })
          .code(429);
      } else if (status === 401) {
        return h
          .response({
            status: "error",
            message: "Kunci API tidak valid. Silakan periksa konfigurasi.",
          })
          .code(401);
      } else if (status === 403) {
        return h
          .response({
            status: "error",
            message: "Akses ke API ditolak. Silakan periksa konfigurasi.",
          })
          .code(403);
      }
    }

    // General fallback error
    return h
      .response({
        status: "error",
        message: "Gagal mengambil artikel.",
      })
      .code(500);
  }
};

/**
 * Helper function to check if text contains diabetes-related terms
 * @param {String} text - Text to check
 * @returns {Boolean} - True if text contains diabetes-related terms
 */
function containsDiabetesTerms(text) {
  if (!text) return false;

  const diabetesTerms = [
    "diabetes",
    "diabetik",
    "gula darah",
    "kencing manis",
    "insulin",
    "glukosa",
    "hiperglikemia",
    "a1c",
    "hba1c",
  ];

  const lowerText = text.toLowerCase();
  return diabetesTerms.some((term) => lowerText.includes(term));
}

/**
 * Helper function to filter articles by topic and limit
 * @param {Array} articles - List of articles
 * @param {String} topic - Topic to filter by
 * @param {Number} limit - Number of articles to return
 */
function filterArticles(articles, topic, limit) {
  // Filter by topic if different from default
  let filtered = articles;

  // Jika topic tidak disebutkan atau kosong, gunakan default diabetes
  topic = topic || "diabetes";

  if (topic.toLowerCase() !== "diabetes") {
    const topicTerms = topic.toLowerCase().split(/\s+/);

    // Check if any topic term is in the title or summary
    filtered = articles.filter((article) => {
      const titleLower = article.title.toLowerCase();
      const summaryLower = (article.summary || "").toLowerCase();

      return topicTerms.some(
        (term) => titleLower.includes(term) || summaryLower.includes(term)
      );
    });
  } else {
    // Untuk diabetes (default), prioritaskan artikel yang lebih relevan
    // Sort berdasarkan relevansi ke diabetes
    filtered = [...articles].sort((a, b) => {
      const aTitleScore = containsDiabetesTerms(a.title) ? 2 : 0;
      const aSummaryScore = containsDiabetesTerms(a.summary || "") ? 1 : 0;
      const bTitleScore = containsDiabetesTerms(b.title) ? 2 : 0;
      const bSummaryScore = containsDiabetesTerms(b.summary || "") ? 1 : 0;

      return bTitleScore + bSummaryScore - (aTitleScore + aSummaryScore);
    });
  }

  // If no articles match the filter, return the original list
  if (filtered.length === 0) {
    console.log(
      `No articles found for topic "${topic}". Returning all articles.`
    );
    filtered = articles;
  }

  // Apply limit
  return filtered.slice(0, parseInt(limit, 10));
}

module.exports = {
  getArticles,
};
