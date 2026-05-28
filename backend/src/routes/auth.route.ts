import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model";
import { authenticateToken, AuthRequest } from "../config/auth.middleware";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET as string;

// Helper to generate JWT token
const generateToken = (userId: string, email: string): string => {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: "7d" });
};

// 1. Signup Route
router.post("/signup", async (req: any, res: Response) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      res.status(400).json({ error: "Missing required signup details." });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({ error: "A user with this email address already exists." });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      fullName,
    });

    const token = generateToken(newUser._id.toString(), newUser.email);

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        onboarded: newUser.onboarded,
        schoolName: newUser.schoolName,
        schoolAddress: newUser.schoolAddress,
        role: newUser.role,
        avatar: newUser.avatar,
      },
    });
  } catch (error: any) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Failed to create account. Please try again." });
  }
});

// 2. Login Route
router.post("/login", async (req: any, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const token = generateToken(user._id.toString(), user.email);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        onboarded: user.onboarded,
        schoolName: user.schoolName,
        schoolAddress: user.schoolAddress,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Authentication failed. Please try again." });
  }
});

// 3. Get Authenticated User Profile
router.get("/me", authenticateToken as any, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized access." });
      return;
    }

    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    res.status(200).json({ user });
  } catch (error: any) {
    console.error("Fetch Me Error:", error);
    res.status(500).json({ error: "Failed to retrieve user profile." });
  }
});

// 4. Update Onboarding Details
router.put("/onboard", authenticateToken as any, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized access." });
      return;
    }

    const { schoolName, schoolAddress, role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        schoolName,
        schoolAddress,
        role,
        onboarded: true,
      },
      { new: true }
    ).select("-password");

    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    res.status(200).json({ user });
  } catch (error: any) {
    console.error("Onboard Error:", error);
    res.status(500).json({ error: "Failed to save onboarding details." });
  }
});

// 5. Update Profile Details
router.put("/profile", authenticateToken as any, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized access." });
      return;
    }

    const { fullName, schoolName, schoolAddress, avatar } = req.body;

    const updates: any = {};
    if (fullName !== undefined) updates.fullName = fullName;
    if (schoolName !== undefined) updates.schoolName = schoolName;
    if (schoolAddress !== undefined) updates.schoolAddress = schoolAddress;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updates,
      { new: true }
    ).select("-password");

    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    res.status(200).json({ user });
  } catch (error: any) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ error: "Failed to update profile details." });
  }
});

export default router;
