import { Schema, model, Document } from "mongoose";

export interface ITemplate extends Document {
  title: string;
  type: string;
  subject: string;
  questionsCount: number;
  totalMarks: number;
  size: string;
  createdBy: string;
  createdAt: Date;
}

const TemplateSchema = new Schema<ITemplate>({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    default: "Grading Templates",
  },
  subject: {
    type: String,
    required: true,
  },
  questionsCount: {
    type: Number,
    required: true,
  },
  totalMarks: {
    type: Number,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Template = model<ITemplate>("Template", TemplateSchema);
