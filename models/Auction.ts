import mongoose, { Schema, Document, Types } from "mongoose";

export interface IBidHistoryEntry {
  userId: string;
  userName: string;
  amount: number;
  time: Date;
}

export interface IAuctionWinner {
  userId: Types.ObjectId;
  finalBid: number;
  paidAt?: Date;
}

export interface IAuction extends Document {
  artworkId: Types.ObjectId;
  startingBid: number;
  currentBid: number;
  currentBidderId?: Types.ObjectId;
  bidIncrement: number;
  bidHistory: IBidHistoryEntry[];
  endTime: Date;
  status: "upcoming" | "live" | "ended" | "sold" | "unsold";
  winner?: IAuctionWinner;
  serialNumber: string;
  certificateS3Url?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BidHistorySchema = new Schema<IBidHistoryEntry>(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    amount: { type: Number, required: true },
    time: { type: Date, required: true, default: Date.now },
  },
  { _id: false }
);

const WinnerSchema = new Schema<IAuctionWinner>(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    finalBid: { type: Number, required: true },
    paidAt: { type: Date },
  },
  { _id: false }
);

const AuctionSchema = new Schema<IAuction>(
  {
    artworkId: {
      type: Schema.Types.ObjectId,
      ref: "Artwork",
      required: true,
    },
    startingBid: { type: Number, required: true },
    currentBid: { type: Number, required: true, default: 0 },
    currentBidderId: { type: Schema.Types.ObjectId },
    bidIncrement: { type: Number, required: true, default: 100 },
    bidHistory: [BidHistorySchema],
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["upcoming", "live", "ended", "sold", "unsold"],
      default: "upcoming",
    },
    winner: WinnerSchema,
    serialNumber: { type: String, required: true },
    certificateS3Url: { type: String },
  },
  { timestamps: true }
);

const Auction =
  (mongoose.models.Auction as mongoose.Model<IAuction>) ||
  mongoose.model<IAuction>("Auction", AuctionSchema);

export default Auction;
