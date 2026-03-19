import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Order from "@/models/Order";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const order = await Order.findById(id).lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
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

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update fulfillment status
    if (body.fulfillmentStatus) {
      const oldStatus = order.fulfillmentStatus || "processing";
      order.fulfillmentStatus = body.fulfillmentStatus;

      // Auto-add a tracking update when status changes
      if (oldStatus !== body.fulfillmentStatus) {
        const statusMessages: Record<string, string> = {
          processing: "Order is being processed",
          confirmed: "Order has been confirmed",
          printing: "Artwork is being printed and framed",
          shipped: "Order has been shipped",
          delivered: "Order has been delivered",
        };

        order.trackingUpdates.push({
          status: body.fulfillmentStatus,
          message:
            body.statusMessage ||
            statusMessages[body.fulfillmentStatus] ||
            `Status updated to ${body.fulfillmentStatus}`,
          timestamp: new Date(),
        });
      }
    }

    // Update tracking info
    if (body.trackingNumber !== undefined) {
      order.trackingNumber = body.trackingNumber;
    }
    if (body.trackingCarrier !== undefined) {
      order.trackingCarrier = body.trackingCarrier;
    }

    // Admin notes
    if (body.adminNotes !== undefined) {
      order.adminNotes = body.adminNotes;
    }

    // Add custom tracking update
    if (body.customUpdate) {
      order.trackingUpdates.push({
        status:
          body.customUpdate.status || order.fulfillmentStatus || "processing",
        message: body.customUpdate.message,
        timestamp: new Date(),
      });
    }

    await order.save();

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
