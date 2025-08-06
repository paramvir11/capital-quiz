import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "flags",
  password: "Iphone5s", // Change to your actual password
  port: 5432,
});

const app = express();
const port = 3000;

let quiz = [];
let currentQuestion = {};
let totalCorrect = 0;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Routes

// GET home page
app.get("/", async (req, res) => {
  totalCorrect = 0;
  await nextQuestion();
  console.log("First Question:", currentQuestion);
  res.render("index.ejs", { question: currentQuestion });
});

// POST submitted answer
app.post("/submit", async (req, res) => {
  const answer = req.body.answer?.trim();
  let isCorrect = false;

  if (currentQuestion?.capital && answer) {
    console.log("User answer:", answer);
    console.log("Correct answer:", currentQuestion.capital);

    if (currentQuestion.capital.toLowerCase() === answer.toLowerCase()) {
      totalCorrect++;
      isCorrect = true;
    }
  }

  await nextQuestion();
  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });
});

// Utility: Get next random question
async function nextQuestion() {
  if (quiz.length === 0) {
    currentQuestion = { country: "N/A", capital: "N/A" };
    return;
  }
  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];
  currentQuestion = randomCountry;
}

// Start app only after DB is ready
async function startServer() {
  try {
    await db.connect();
    const result = await db.query("SELECT * FROM flags");
    quiz = result.rows;

    if (quiz.length === 0) {
      console.warn("⚠️ Warning: No quiz data found in DB.");
    }

    app.listen(port, () => {
      console.log(`✅ Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
  }
}

startServer();
