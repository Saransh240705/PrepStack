import { Worker } from "bullmq";
import { redisConnection } from "../config/redis";
import { Assignment } from "../models/Assignment.model";
import { GeneratedPaper } from "../models/GeneratedPaper.model";
import { generationQuestions, generateFromFile } from "../services/aiServices";
import { parseAIResponse } from "../services/parserService";
import { getIO } from "../socket";

export const generationWorker = new Worker(
  "paper-generation",
  async (job) => {
    const { assignmentId } = job.data;
    const assignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      { status: "processing" },
      { returnDocument: 'after' },
    );

    if (!assignment) throw new Error("Assignment not found");

    try {
      let rawResponse: string;
      if(assignment.fileUrl) {
        rawResponse = await generateFromFile(assignment, assignment.fileUrl); 
      } else {
        rawResponse = await generationQuestions(assignment);
      }
      const paperData = parseAIResponse(rawResponse);
      const paper = await GeneratedPaper.create({
        assignmentId,
        title: paperData.title,
        sections: paperData.sections,
        totalMarks: paperData.totalMarks,
      });

      await Assignment.findByIdAndUpdate(assignmentId, { status: "completed" });
      getIO().emit("generation:complete", {
        assignmentId, paperId: paper._id
      })
      return { paperId: paper._id };
    } catch (error) {
      await Assignment.findByIdAndUpdate(assignmentId, { status: "failed" });
      getIO().emit("generation:failed", {assignmentId})
      throw error;
    }
  },
  { connection: redisConnection },
);
