import { client } from "../config/db";

const marquee = client
  .db("loweCommerce")
  .collection("marquee");

export const createMarqueeService=async(payload:any)=>{
    const result = await marquee.insertOne(payload)
    return result
}


export const getMarqueeService = async()=>{
    const result = await marquee.findOne({isActive: true});
    return result
}

export const updateMarqueeService=async(query:any, payload:any)=>{
    

    const result = await marquee.updateOne(query, {$set: payload})
    return result
}

export const toggleMarqueeStatusService = async (
  query: any,
  isActive: boolean | { isActive: boolean },
) => {
  const value = typeof isActive === "object" ? isActive.isActive : isActive;

  const result = await marquee.updateOne(query, {
    $set: { isActive: value },
  });

  return result;
};
export const getAllMarqueeService=async()=>{
    const result = await marquee.find().toArray();
    return result
}

export const deleteMarquee = async(query:any)=>{
    const result = await marquee.deleteOne(query)
    return result
}