import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Template } from "../models/Template.model";
import { JWT_SECRET } from "../config/jwt";

const router = Router();

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
      // Ignore
    }
  }
  return undefined;
};

// GET /api/templates - Get all grading templates for the teacher
router.get("/", async (req: Request, res: Response) => {
  try {
    const userEmail = getUserEmail(req);
    if (!userEmail) {
      return res.status(401).json({ error: "Unauthorized access. Email not verified." });
    }
    const templates = await Template.find({ createdBy: userEmail.toLowerCase() }).sort({ createdAt: -1 });
    res.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/templates - Create a new grading template
router.post("/", async (req: Request, res: Response) => {
  try {
    const userEmail = getUserEmail(req);
    if (!userEmail) {
      return res.status(401).json({ error: "Unauthorized access. Email not verified." });
    }
    const { title, subject, questionsCount, totalMarks, size } = req.body;

    if (!title || !subject || questionsCount === undefined || totalMarks === undefined || !size) {
      return res.status(400).json({ error: "Missing required details: title, subject, questionsCount, totalMarks, size." });
    }

    const template = await Template.create({
      title,
      type: "Grading Templates",
      subject,
      questionsCount,
      totalMarks,
      size,
      createdBy: userEmail.toLowerCase(),
    });

    res.status(201).json(template);
  } catch (error) {
    console.error("Error creating template:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/templates/:id - Delete a grading template
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const userEmail = getUserEmail(req);
    if (!userEmail) {
      return res.status(401).json({ error: "Unauthorized access. Email not verified." });
    }
    const template = await Template.findOneAndDelete({
      _id: req.params.id,
      createdBy: userEmail.toLowerCase(),
    });
    if (!template) {
      return res.status(404).json({ error: "Template not found or not owned by you." });
    }
    res.json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Error deleting template:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
