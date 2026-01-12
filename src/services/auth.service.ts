import { client } from "../config/db";


const usersCollection = client
  .db("loweCommerce")
  .collection("users");

export const findByEmail = async (email: string ) => {
  const isExist = await usersCollection.findOne({ email: email });
  return isExist;
};


export const Createuser = async (payload:any)=>{

    const result = await usersCollection.insertOne(payload)

    return result;


}