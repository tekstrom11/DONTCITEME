import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);
try {
  await client.connect();
  console.log("Connected to MongoDB");
} catch (err) {
  console.error("Could not connect to MongoDB:", err.message);
  process.exit(1);
}

export const db = client.db("dontciteme");
