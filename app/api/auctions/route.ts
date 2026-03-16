import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Auction from "@/models/Auction";
import Artwork from "@/models/Artwork";

export async function GET() {
  try {
    await connectToDatabase();
    // Ensure Artwork model is registered before populate
    Artwork;
    const auctions = await Auction.find({})
      .populate("artworkId", "slug theme arabic translation previewImageUrl")
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(auctions);
  } catch (error) {
    console.error("Error fetching auctions:", error);
    return NextResponse.json(
      { error: "Failed to fetch auctions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const auction = await Auction.create({
      artworkId: body.artworkId,
      startingBid: body.startingBid,
      currentBid: 0,
      bidIncrement: body.bidIncrement,
      bidHistory: [],
      endTime: new Date(body.endTime),
      status: body.status || "upcoming",
      serialNumber: body.serialNumber,
    });

    return NextResponse.json(auction, { status: 201 });
  } catch (error) {
    console.error("Error creating auction:", error);
    return NextResponse.json(
      { error: "Failed to create auction" },
      { status: 500 }
    );
  }
}
