import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Group } from "../models/Group.model";
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
      // Ignore token verification errors
    }
  }
  return undefined;
};

// GET /api/groups - Get all groups for the logged-in teacher
router.get("/", async (req: Request, res: Response) => {
  try {
    const userEmail = getUserEmail(req);
    if (!userEmail) {
      return res.status(401).json({ error: "Unauthorized access. Email not verified." });
    }
    const groups = await Group.find({ createdBy: userEmail.toLowerCase() }).sort({ createdAt: -1 });
    res.json(groups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/groups - Create a new student group
router.post("/", async (req: Request, res: Response) => {
  try {
    const userEmail = getUserEmail(req);
    if (!userEmail) {
      return res.status(401).json({ error: "Unauthorized access. Email not verified." });
    }
    const { name, subject, grade, studentsCount, activeAssignments, averageScore, color } = req.body;

    if (!name || !subject || !grade || !color) {
      return res.status(400).json({ error: "Missing required details: name, subject, grade, color." });
    }

    const group = await Group.create({
      name,
      subject,
      grade,
      studentsCount: studentsCount !== undefined ? studentsCount : Math.floor(Math.random() * 20) + 20,
      activeAssignments: activeAssignments !== undefined ? activeAssignments : 0,
      averageScore: averageScore || "N/A",
      color,
      createdBy: userEmail.toLowerCase(),
    });

    res.status(201).json(group);
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/groups/:id - Delete a group
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const userEmail = getUserEmail(req);
    if (!userEmail) {
      return res.status(401).json({ error: "Unauthorized access. Email not verified." });
    }
    const group = await Group.findOneAndDelete({
      _id: req.params.id,
      createdBy: userEmail.toLowerCase(),
    });
    if (!group) {
      return res.status(404).json({ error: "Group not found or not owned by you." });
    }
    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error deleting group:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
