import mongoose from "mongoose";
import { IAssignment } from "../types";

const assignmentSchema = new mongoose.Schema<IAssignment>({
    subject: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    questionTypes: {
        type: [String],
        enum: ["mcq", "short", "long"],
        required: true
    },
    numQuestions: {
        type: Number,
        required: true
    },
    totalMarks: {
        type: Number,
        required: true
    },
    instructions: {
        type: String,
        default: "",
    },
    status: {
        type: String,
        enum: ["pending", "processing", "completed", "failed"],
        default: "pending"
    },
    fileUrl: {
        type: String,
        default: "",
    },
    className: {
        type: String,
        default: "",
    },
    timeAllotted: {
        type: String,
        default: "",
    },
    createdBy: {
        type: String,
        default: "",
    }
}, {timestamps: true});

export const Assignment = mongoose.model<IAssignment>("Assignment", assignmentSchema);