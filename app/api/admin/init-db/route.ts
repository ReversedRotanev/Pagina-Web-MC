import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    // Check authorization
    const authHeader = req.headers.get("authorization");
    const secret = process.env.INIT_DB_SECRET;

    if (!secret) {
      return NextResponse.json(
        { error: "INIT_DB_SECRET not configured" },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid secret" },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Create admin user if doesn't exist
    const User = mongoose.model(
      "User",
      new mongoose.Schema({
        email: String,
        name: String,
        password: String,
        role: String,
      })
    );

    const adminEmail = process.env.ADMIN_EMAIL || "reversedrotanev@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Erkrvphhtgr6820*";

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      await User.create({
        email: adminEmail,
        name: "Admin",
        password: adminPassword,
        role: "OWNER",
      });
    }

    return NextResponse.json(
      {
        message: "Database initialized successfully",
        adminEmail: adminEmail,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Init DB Error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
