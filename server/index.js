import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from "cors";
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './utils/db.js';

import projectRouter from "./routes/projectRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import authRouter from "./routes/authRoutes.js";
import studentRouter from './routes/studentRoutes.js';
import facultyRouter from './routes/facultyRoutes.js';

dotenv.config();
connectDB();

const app = express();

// CORS setup — allow frontend origin
const allowedOrigins = [
  'http://localhost:3000', // for development
  'https://cpms-new.vercel.app', // your deployed frontend on Vercel
  'http://localhost:5173',
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser()); // good to have for future

const PORT = process.env.PORT || 5000;

// Mount API routes
app.use("/api/auth", authRouter);       // POST /api/auth/login
app.use("/api/project", projectRouter); // project routes
app.use("/api/admin", adminRouter);     // GET /api/admin/allFaculty etc.
app.use("/api/student", studentRouter);
app.use("/api/faculty", facultyRouter); // GET /api/faculty/getFacultyDetails/:id

app.listen(PORT, () => {
  console.log(`🚀 Server running at https://cpms-new-xge9.onrender.com/${PORT}`);
});
