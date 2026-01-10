import { Request, Response } from "express";
import { getSocialService, socialService } from "../services/social.service";

export const socialController = async (req: Request, res: Response) => {
  const data = req.body;

  if (!data) {
    return res
      .status(400)
      .json({ success: false, message: "No data provided" });
  }

  try {
    const result = await socialService(data);

    if (!result) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to add social info" });
    }
    return res
      .status(201)
      .json({
        success: true,
        message: "Social info added successfully",
        data: result,
      });
  } catch (err: any) {
    return res
      .status(500)
      .json({ success: false, message: err.message, data: err });
  }
};


export const getSocialController = async (req: Request, res: Response) => {
     // Implementation for fetching social info will go here
    const result = await getSocialService();

    if (!result) {
        return res
        .status(500)
        .json({ success: false, message: "Failed to fetch social info" });
    }
    return res
      .status(200)
      .json({
        success: true,
        message: "Social info fetched successfully",
        data: result,
      });
}