import { dbName, dbUrl } from "@/recipes/config";
import { User } from "@/recipes/types";
import { MongoClient, ObjectId } from "mongodb";

export const COLLECTION_USERS = "users";

export const getUser = (userId: string) => {
  return new Promise<User | null>((resolve, reject) => {
    MongoClient.connect(dbUrl)
      .then(async (client) => {
        try {
          const db = client.db(dbName);

          const collections = await db.listCollections().toArray();
          const collectionNames = collections.map((c) => c.name);

          if (!collectionNames.includes(COLLECTION_USERS)) {
            await db.createCollection(COLLECTION_USERS);
            console.log(`Collection ${COLLECTION_USERS} created`);
          }

          let existingUser = await db
            .collection(COLLECTION_USERS)
            .findOne({ id: userId });

          if (existingUser) {
            const { _id, ...user } = existingUser;
            resolve(user as User);
          } else {
            resolve(null);
          }
        } finally {
          client.close();
        }
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
};

export const getUserByEmail = (email: string) => {
  return new Promise<User | null>((resolve, reject) => {
    MongoClient.connect(dbUrl)
      .then(async (client) => {
        try {
          const db = client.db(dbName);

          const collections = await db.listCollections().toArray();
          const collectionNames = collections.map((c) => c.name);

          if (!collectionNames.includes(COLLECTION_USERS)) {
            await db.createCollection(COLLECTION_USERS);
            console.log(`Collection ${COLLECTION_USERS} created`);
          }

          let existingUser = await db
            .collection(COLLECTION_USERS)
            .findOne({ email });

          if (existingUser) {
            const { _id, ...user } = existingUser;
            resolve(user as User);
          } else {
            resolve(null);
          }
        } finally {
          client.close();
        }
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
};

export const getUsersThatAreSharingWithMe = (email: string) => {
  return new Promise<User[]>((resolve, reject) => {
    MongoClient.connect(dbUrl)
      .then(async (client) => {
        try {
          const db = client.db(dbName);

          const collections = await db.listCollections().toArray();
          const collectionNames = collections.map((c) => c.name);

          if (!collectionNames.includes(COLLECTION_USERS)) {
            await db.createCollection(COLLECTION_USERS);
            console.log(`Collection ${COLLECTION_USERS} created`);
          }

          const users = await db
            .collection(COLLECTION_USERS)
            .find({ sharedWith: { $in: [email] } })
            .toArray();

          resolve(
            users.map((u) => {
              const { _id, ...user } = u;
              return user as User;
            })
          );
        } finally {
          client.close();
        }
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
};

export const saveUser = (user: User) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(dbUrl)
      .then(async (client) => {
        try {
          const db = client.db(dbName);

          const collections = await db.listCollections().toArray();
          const collectionNames = collections.map((c) => c.name);

          if (!collectionNames.includes(COLLECTION_USERS)) {
            await db.createCollection(COLLECTION_USERS);
            console.log(`Collection ${COLLECTION_USERS} created`);
          }

          let existingUser = await db
            .collection(COLLECTION_USERS)
            .findOne({ id: user.id });

          if (existingUser) {
            console.log(`User ${user.id} already exists`);
            resolve(existingUser);
          } else {
            console.log(`Creating user ${user.id}`);

            await db.collection(COLLECTION_USERS).insertOne({ ...user });
            resolve(user);
          }
        } finally {
          client.close();
        }
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
};

export const shareWeeklyWithEmail = (userId: string, email: string) => {
  return new Promise<{ success: boolean }>(async (resolve, reject) => {
    MongoClient.connect(dbUrl)
      .then(async (client) => {
        try {
          const [alreadyShared] = await getUsersThatAreSharingWithMe(email);

          if (alreadyShared) {
            reject(new Error("Someone is already sharing with this user"));
            return;
          }

          const otherUser = await getUserByEmail(email);

          if (otherUser?.sharedWith?.length) {
            reject(new Error("This user is already sharing with someone"));
            return;
          }

          const db = client.db(dbName);

          const user = await db
            .collection(COLLECTION_USERS)
            .findOne({ id: userId });

          if (!user) {
            reject(new Error("User not found"));
            return;
          }

          const sharedWith = user.sharedWith || [];

          if (sharedWith.includes(email)) {
            resolve({ success: true });
            return;
          }

          sharedWith.push(email);

          await db
            .collection(COLLECTION_USERS)
            .updateOne({ id: userId }, { $set: { sharedWith } });

          resolve({ success: true });
        } finally {
          client.close();
        }
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
};
