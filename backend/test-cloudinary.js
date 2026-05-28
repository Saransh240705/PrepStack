const cloudinary = require("cloudinary").v2;
require("dotenv").config();

console.log("Configuring Cloudinary...");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

async function run() {
  try {
    console.log("Testing Cloudinary API credentials...");
    const result = await cloudinary.api.ping();
    console.log("Cloudinary ping successful! Connection details are valid.");
    console.log(result);
  } catch (error) {
    console.error("Cloudinary connection failed! Error details:");
    console.error(error);
  }
}

run();
