import { client } from "../config/db";


const socialInfo = client
  .db("loweCommerce")
  .collection("social");

export const socialService =async (payload:any)=>{
    const result= await socialInfo.insertOne(payload);
    return result;
}

export const getSocialService = async () => {
    const result = await socialInfo.findOne({}, { sort: { $natural: -1 } });
    return result;
}