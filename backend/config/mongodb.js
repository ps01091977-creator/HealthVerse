import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI.includes('/appointy')
      ? process.env.MONGODB_URI
      : `${process.env.MONGODB_URI}/appointy`;
    await mongoose.connect(uri);
    console.log("Database Connected");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
