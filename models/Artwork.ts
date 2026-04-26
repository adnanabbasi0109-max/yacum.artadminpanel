import mongoose, { Schema, Document } from "mongoose";

export interface IPrintSize {
  label: string;
  dimensions: string;
  price: number;
}

export interface IFrameOption {
  label: string;
  material: string;
  priceAddon: number;
}

export interface IArtwork extends Document {
  slug: string;
  title: string;
  verseId: string;
  arabic: string;
  transliteration?: string;
  translation: string;
  tafsir?: string;
  surah?: string;
  surahNumber?: number;
  ayah?: number;
  theme: string;
  previewImageUrl: string;
  highResS3Key: string;
  qrCodeImageUrl?: string;
  digitalPrice: number;
  printPriceBase: number;
  printSizes: IPrintSize[];
  frameOptions: IFrameOption[];
  status: "draft" | "published" | "soldout";
  orientation?: "vertical" | "horizontal";
  description?: string;
  isAuctionPiece: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PrintSizeSchema = new Schema<IPrintSize>(
  {
    label: { type: String, required: true },
    dimensions: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const FrameOptionSchema = new Schema<IFrameOption>(
  {
    label: { type: String, required: true },
    material: { type: String, required: true },
    priceAddon: { type: Number, required: true },
  },
  { _id: false }
);

const ArtworkSchema = new Schema<IArtwork>(
  {
    slug: { type: String, unique: true, required: true },
    title: { type: String, required: true },
    verseId: { type: String, required: true },
    arabic: { type: String, required: true },
    transliteration: { type: String },
    translation: { type: String, required: true },
    tafsir: { type: String },
    surah: { type: String },
    surahNumber: { type: Number },
    ayah: { type: Number },
    theme: { type: String, required: true },
    previewImageUrl: { type: String, required: true },
    highResS3Key: { type: String, default: "" },
    qrCodeImageUrl: { type: String },
    digitalPrice: { type: Number, required: true },
    printPriceBase: { type: Number, required: true },
    printSizes: [PrintSizeSchema],
    frameOptions: [FrameOptionSchema],
    status: {
      type: String,
      enum: ["draft", "published", "soldout"],
      default: "published",
    },
    orientation: {
      type: String,
      enum: ["vertical", "horizontal"],
      default: "vertical",
    },
    description: { type: String },
    isAuctionPiece: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Artwork =
  (mongoose.models.Artwork as mongoose.Model<IArtwork>) ||
  mongoose.model<IArtwork>("Artwork", ArtworkSchema);

export default Artwork;
