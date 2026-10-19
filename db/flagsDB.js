import { db } from "./connection.js";
import { ObjectId } from "mongodb";

const flags = db.collection("flags");

// Anyone can submit a flag - no admin check needed here.
export async function createFlag(data) {
  const newFlag = {
    retractionId: data.retractionId,
    reason: data.reason,
    submittedBy: data.submittedBy || "Anonymous",
    status: "open",
    createdAt: new Date(),
  };
  const result = await flags.insertOne(newFlag);
  return result;
}

// Admin-only: list all open flags for review.
export async function getOpenFlags() {
  return flags.find({ status: "open" }).sort({ createdAt: -1 }).toArray();
}

// Admin-only: mark a flag resolved or dismissed, without deleting it.
export async function updateFlagStatus(id, status) {
  const result = await flags.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status } }
  );
  return result;
}

// Admin-only: remove a flag entirely.
export async function deleteFlag(id) {
  const result = await flags.deleteOne({ _id: new ObjectId(id) });
  return result;
}
