const mongoose = require("mongoose");
require("dotenv").config();

const AssignmentSchema = new mongoose.Schema({
  subject: String,
  topic: String,
  dueDate: Date,
  questionTypes: [String],
  numQuestions: Number,
  totalMarks: Number,
  instructions: String,
  status: String,
}, { timestamps: true });

const Assignment = mongoose.model("Assignment", AssignmentSchema);

const GeneratedPaperSchema = new mongoose.Schema({
  assignmentId: mongoose.Schema.Types.ObjectId,
  title: String,
  totalMarks: Number,
}, { timestamps: true });

const GeneratedPaper = mongoose.model("GeneratedPaper", GeneratedPaperSchema);

async function diagnose() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected successfully!");

    console.log("\n--- Last 5 Assignments ---");
    const assignments = await Assignment.find().sort({ createdAt: -1 }).limit(5);
    
    if (assignments.length === 0) {
      console.log("No assignments found in DB.");
    }

    for (const asm of assignments) {
      console.log(`\nID: ${asm._id}`);
      console.log(`Subject: ${asm.subject}`);
      console.log(`Topic: ${asm.topic}`);
      console.log(`Status: ${asm.status}`);
      console.log(`Created: ${asm.createdAt}`);
      
      const paper = await GeneratedPaper.findOne({ assignmentId: asm._id });
      if (paper) {
        console.log(`Generated Paper: Yes ("${paper.title}")`);
      } else {
        console.log(`Generated Paper: No`);
      }
    }
  } catch (err) {
    console.error("Diagnosis failed:", err);
  } finally {
    await mongoose.disconnect();
  }
}

diagnose();
