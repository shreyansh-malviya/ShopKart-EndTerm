import mongoose from "mongoose";

// Connects to MongoDB using the URI from .env.
// DB_NAME keeps ShopKart data in its own database on the same cluster.
const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.DB_NAME || "shopkart",
  });
  console.log(`MongoDB connected (db: ${mongoose.connection.name})`);
};

export default connectDB;
