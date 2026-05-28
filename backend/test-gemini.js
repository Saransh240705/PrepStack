const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const apiKey = process.env.GEMINI_API_KEY;
console.log("Using API Key:", apiKey ? `${apiKey.substring(0, 8)}...` : "UNDEFINED");

if (!apiKey) {
  console.error("Error: GEMINI_API_KEY is not defined in .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function run() {
  try {
    console.log("Sending test prompt to Gemini...");
    const result = await model.generateContent("Hello, write a 3-word greeting.");
    console.log("Response received successfully!");
    console.log("Output:", result.response.text());
  } catch (error) {
    console.error("Gemini API call failed! Error details:");
    console.error(error);
  }
}

run();
