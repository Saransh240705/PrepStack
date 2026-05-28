import { Router, Request, Response } from "express";
import z from "zod";
import { Assignment } from "../models/Assignment.model";
import { GeneratedPaper } from "../models/GeneratedPaper.model";
import { addGenerationJob } from "../queues/generationQueue";

import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "vedaai-super-secret-jwt-key-2026";

const getUserEmail = (req: Request): string | undefined => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token) {
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.email) {
        return decoded.email;
      }
    } catch (e) {
      // Ignore token verification errors and fall back
    }
  }
  const legacyEmail = req.headers["x-user-email"];
  return typeof legacyEmail === "string" ? legacyEmail : undefined;
};

const createAssignmentSchma = z.object({
  subject: z.string().min(1),
  topic: z.string().min(1),
  dueDate: z.string(),
  questionTypes: z.array(z.enum(["mcq", "short", "long"])).min(1),
  numQuestions: z.number().min(1),
  totalMarks: z.number().min(1),
  instructions: z.string().optional(),
  fileUrl: z.string().optional(),
  className: z.string().optional(),
  timeAllotted: z.string().optional(),
  createdBy: z.string().optional(),
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const body = createAssignmentSchma.parse(req.body);
    const email = getUserEmail(req) || body.createdBy;

    const assignment = await Assignment.create({
      ...body,
      createdBy: email,
      dueDate: new Date(body.dueDate),
    });

    await addGenerationJob(assignment._id.toString());

    res
      .status(201)
      .json({ assignmentId: assignment._id, status: assignment.status });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error });
    }

    console.error("Error creating assignment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const userEmail = getUserEmail(req);
    const query = userEmail ? { createdBy: userEmail } : {};
    const assignments = await Assignment.find(query).sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }
    res.json(assignment);
  } catch (error) {
    res.status(500).json({error: "Server error"})
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const assignmentId = req.params.id;
    const assignment = await Assignment.findByIdAndDelete(assignmentId);
    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }
    // Clean up any generated paper associated with this assignment
    await GeneratedPaper.deleteMany({ assignmentId });
    res.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/:id/regenerate", async (req: Request, res: Response) => {
  try {
    const assignmentId = req.params.id;
    const assignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      { status: "pending" },
      { returnDocument: "after" }
    );

    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }

    // Clean up any old generated paper to prevent stales
    await GeneratedPaper.deleteMany({ assignmentId });

    // Submit regeneration job to queue
    await addGenerationJob(assignmentId as string);

    res.json({ assignmentId: assignment._id, status: "pending" });
  } catch (error) {
    console.error("Error triggering assignment regeneration:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
