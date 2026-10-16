import { db } from "./connection.js";
import { ObjectId } from "mongodb";

const retractions = db.collection("retractions");

export async function searchRetractions(category) {
  const query = category ? { primary_subject: { $regex: `^\\(${category}\\)` } } : {};
  return retractions.find(query).limit(25).toArray();
}

export async function getRetractionsById(id) {
    return retractions.findOne({_id: id});
}

export async function createRetraction(data) {
  const result = await retractions.insertOne(data);
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

