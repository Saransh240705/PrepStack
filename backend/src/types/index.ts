import mongoose from "mongoose";

export interface IAssignment {
    subject: string;
    topic:string;
    dueDate:Date;
    questionTypes: ("mcq" | "short" | "long")[];
    numQuestions:number;
    totalMarks:number;
    instructions:string;
    status: "pending" | "processing" | "completed" | "failed";
    fileUrl?: string;
    className?: string;
    timeAllotted?: string;
    createdBy?: string;
}

export interface IQuestion {
    text: string;
    type: "mcq" | "short" | "long";
    difficulty: ("easy" | "medium" | "hard");
    marks: number;
    section: string;
    file?: string;
    answer?: string;
}

export interface IGeneratedPaper {
    assignmentId: mongoose.Types.ObjectId;
    title: string;
    sections: {
        title: string;
        instruction: string;
        questions: IQuestion[];
    }[];
    totalMarks: number;
}