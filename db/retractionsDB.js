import { db } from "./connection.js";

const retractions = db.collection("retractions");

export async function searchRetractions(category) {
  const query = category ? { primary_subject: { $regex: `^\\(${category}\\)` } } : {};
  return retractions.find(query).limit(25).toArray();
}

export async function getRetractionsById(id) {
    return retractions.findOne({_id: id});
}