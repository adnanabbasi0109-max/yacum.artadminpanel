import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    await connectToDatabase();
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
