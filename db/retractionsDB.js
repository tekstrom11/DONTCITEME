import { db } from "./connection.js";
import { ObjectId } from "mongodb";

const retractions = db.collection("retractions");

export async function searchRetractions(category, page = 1) {
  const query = category ? { primary_subject: { $regex: `^\\(${category}\\)` } } : {};
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
    return retractions.findOne({ _id: new ObjectId(id)});
}

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
  const result = await retractions.deleteOne({ _id: new ObjectId(id)});
  return result;
}

