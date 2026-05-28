import { Router, Request, Response } from "express"; 
import { GeneratedPaper } from "../models/GeneratedPaper.model";

const router = Router();

router.get("/:assignmentId", async (req: Request, res: Response) => {
    try {
        const paper = await GeneratedPaper.findOne({assignmentId: req.params.assignmentId});

        if(!paper) {
            res.status(404).json({error: "Paper not found"});
            return;
        }
        res.json(paper);
    } catch (error) {
        res.status(500).json({error: "Server error"});
    }
})

export default router;