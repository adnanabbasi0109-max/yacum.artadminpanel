import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Auction from "@/models/Auction";
import Artwork from "@/models/Artwork";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    Artwork;
    const { id } = await params;
    const auction = await Auction.findById(id)
      .populate("artworkId", "slug theme arabic translation previewImageUrl verseId")
      .lean();
    if (!auction) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }
    return NextResponse.json(auction);
  } catch (error) {
    console.error("Error fetching auction:", error);
    return NextResponse.json(
      { error: "Failed to fetch auction" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();

    if (body.endTime) {
      body.endTime = new Date(body.endTime);
    }

    const auction = await Auction.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!auction) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }
    return NextResponse.json(auction);
  } catch (error) {
    console.error("Error updating auction:", error);
    return NextResponse.json(
      { error: "Failed to update auction" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const auction = await Auction.findByIdAndDelete(id);
    if (!auction) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Auction deleted" });
  } catch (error) {
    console.error("Error deleting auction:", error);
    return NextResponse.json(
      { error: "Failed to delete auction" },
      { status: 500 }
    );
  }
}
