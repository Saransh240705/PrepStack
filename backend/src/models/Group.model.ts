import { Schema, model, Document } from "mongoose";

export interface IGroup extends Document {
  name: string;
  subject: string;
  grade: string;
  studentsCount: number;
  activeAssignments: number;
  averageScore: string;
  color: string;
  createdBy: string;
  createdAt: Date;
}

const GroupSchema = new Schema<IGroup>({
  name: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  grade: {
    type: String,
    required: true,
  },
  studentsCount: {
    type: Number,
    required: true,
    default: 30,
  },
  activeAssignments: {
    type: Number,
    required: true,
    default: 0,
  },
  averageScore: {
    type: String,
    required: true,
    default: "N/A",
  },
  color: {
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

export const Group = model<IGroup>("Group", GroupSchema);
