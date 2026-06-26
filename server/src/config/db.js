import mongoose from "mongoose";
import { DB } from "./config.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(`${DB.url}/${DB.name}`);
    console.log(`\n MongoDB connected !! DB Host ${conn.connection.host}`);
  } catch (error) {
    console.log("MongoDB connection failed", error);
    process.exit(1);
  }
};

export default connectDB;
