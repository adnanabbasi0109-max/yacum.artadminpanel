import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Artwork from "@/models/Artwork";

export async function GET() {
  try {
    await connectToDatabase();
    const artworks = await Artwork.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(artworks);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();

    if (!body.slug && body.theme && body.verseId) {
      body.slug =
        body.verseId ||
        `${body.theme}-${Date.now()}`.toLowerCase().replace(/\s+/g, "-");
    }

    const artwork = await Artwork.create(body);
    return NextResponse.json(artwork, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
