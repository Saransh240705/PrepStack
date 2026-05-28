import { Router, Request, Response, NextFunction } from "express";
import { upload } from "../config/upload";

const router = Router();

router.post("/", (req: Request, res: Response, next: NextFunction) => {
  // Wrap the multer upload middleware so we can capture and print errors
  upload.single("file")(req, res, (err: any) => {
    if (err) {
      console.error("❌ Multer/Cloudinary Upload Error:", err);
      return res.status(400).json({
        error: err.message || "Failed to upload to Cloudinary."
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded"
      });
    }

    res.status(201).json({
      message: "File uploaded successfully",
      url: req.file.path
    });
  });
});

export default router;
