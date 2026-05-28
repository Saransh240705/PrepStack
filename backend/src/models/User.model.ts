import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password?: string; // Optional so we don't accidentally leak or send it
  fullName: string;
  avatar: string;
  onboarded: boolean;
  schoolName: string;
  schoolAddress: string;
  role: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: "/Avatar.jpg",
  },
  onboarded: {
    type: Boolean,
    default: false,
  },
  schoolName: {
    type: String,
    default: "",
  },
  schoolAddress: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User = model<IUser>("User", UserSchema);
