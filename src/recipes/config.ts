import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import OpenAI from "openai";

const MONGO_HOST = process.env.MONGO_HOST;

export const dbUrl: string = `mongodb://root:example@${MONGO_HOST}:27017/?authSource=admin`;
export const dbName: string = "recipes";

// Instantiate a new Pinecone client, which will automatically read the
// env vars: PINECONE_API_KEY and PINECONE_ENVIRONMENT which come from
// the Pinecone dashboard at https://app.pinecone.io
const pinecone = new Pinecone();
export const pineconeIndex = pinecone.Index(
  process.env.PINECONE_INDEX || "smaczer"
);
const embeddings = new OpenAIEmbeddings();
export const pineconeStore = new PineconeStore(embeddings, { pineconeIndex });
export const openAIClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
