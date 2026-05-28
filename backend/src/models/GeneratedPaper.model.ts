import mongoose from "mongoose";
import { IGeneratedPaper } from "../types";
const questionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["mcq","short","long"],
        required: true,
    },
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        required: true,
    },
    marks: {
        type: Number,
        required: true,
    },
    section: {
        type: String,
        required: true,
    },
    file: {
        type: String,
        default: null,
    },
    answer: {
        type: String,
        default: "",
    }
}, {_id: false});

const sectionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    instruction: {
        type: String,
        required: true,
    },
    questions: [questionSchema]
}, {_id: false})

const generatedPaperSchema = new mongoose.Schema<IGeneratedPaper>({
    assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment",
        required: true      
    },
    title: {
        type: String,
        required: true,
    },
    sections: [sectionSchema],
    totalMarks: {
        type: Number,
        required: true,
    },
}, {timestamps: true});

export const GeneratedPaper = mongoose.model<IGeneratedPaper>("GeneratedPaper", generatedPaperSchema);