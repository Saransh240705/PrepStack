import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { connectDB } from './config/db';
import { setupSocket } from './socket';
import assignmentRoutes from './routes/assigments.route';
import papersRoute from './routes/papers.route';
import "./workers/generationWorker";
import uploadRoute from "./routes/upload.route";

const app = express();
app.use(cors({ origin: "http://localhost:3000"}))

app.use(express.json());

app.use("/api/assignments", assignmentRoutes);
app.use("/api/papers", papersRoute);
app.use("/api/upload", uploadRoute);


const server = http.createServer(app);

setupSocket(server);


const PORT = process.env.PORT || 5001;

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});