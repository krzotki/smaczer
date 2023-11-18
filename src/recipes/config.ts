const MONGO_HOST = process.env.MONGO_HOST;

export const dbUrl: string = `mongodb://root:example@${MONGO_HOST}:27017/?authSource=admin`;
export const dbName: string = "recipes";
