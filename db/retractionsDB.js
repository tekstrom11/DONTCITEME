import { db } from "./connection.js";
import { ObjectId } from "mongodb";

const retractions = db.collection("retractions");

//Searches by subject category using the prefix
//(e.g. "^\(HSC\)" matches "(HSC) Medicine - Cardiology").
// Supports pagination via skip/limit.
export async function searchRetractions(category, page = 1) {
  const query = category
    ? { primary_subject: { $regex: `^\\(${category}\\)` } }
    : {};
  const pageSize = 25;
  const skip = (page - 1) * pageSize;
  return retractions
    .find(query)
    .sort({ title: 1 })
    .skip(skip)
    .limit(pageSize)
    .toArray();
}

export async function getRetractionsById(id) {
  return retractions.findOne({ _id: new ObjectId(id) });
}

/**
 * record_id has a unique index from the original CSV import, but
 * admin-added records don't have one. we generate a fresh unique
 * string here so inserts don't collide with existing null values.
 **/
export async function createRetraction(data) {
  const newRecord = {
    ...data,
    record_id: new ObjectId().toString(),
  };
  const result = await retractions.insertOne(newRecord);
  return result;
}

export async function updateRetraction(id, data) {
  const result = await retractions.updateOne(
    { _id: new ObjectId(id) },
    { $set: data }
  );
  return result;
}

export async function deleteRetraction(id) {
  const result = await retractions.deleteOne({ _id: new ObjectId(id) });
  return result;
}
