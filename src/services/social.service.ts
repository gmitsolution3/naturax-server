import { client } from "../config/db";

import { Collection } from "mongodb";

interface SocialInfo {
  _id: string; // 👈 important
  facebook?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  phone?: string;
  email?: string;
}

const socialCollection: Collection<SocialInfo> = client
  .db("loweCommerce")
  .collection("social");

// Always use fixed _id
const SOCIAL_ID = "index";

export const socialService = async (payload: any) => {
  const result = await socialCollection.updateOne(
    { _id: SOCIAL_ID },
    { $set: { ...payload } },
    { upsert: true },
  );

  return result;
};

export const getSocialService = async () => {
  const result = await socialCollection.findOne({ _id: SOCIAL_ID });
  return result;
};
