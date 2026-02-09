import { Request, Response } from "express";
import { client } from "../config/db";
import { ObjectId } from "mongodb";
import {
  createSteadFastParcel,
  trackSteadFastParcel,
  createSteadFastBulkParcel,
} from "../services/steadfast.service";

const orderCollection = client
  .db("loweCommerce")
  .collection("create_order");

export const assignCourier = async (req: Request, res: Response) => {
  try {
    const { courierService, orderId } = req.query;

    const order = await orderCollection.findOne({
      _id: new ObjectId(orderId as string),
    });

    if (courierService?.toString().toUpperCase() === "STEADFAST") {
      const courier = await createSteadFastParcel(order);

      const result = await orderCollection.updateOne(
        {
          _id: new ObjectId(orderId as string),
        },
        {
          $set: {
            courier,
          },
        },
      );

      res.status(200).json({
        success: true,
        message: "Assigned courier.",
        data: result,
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Pathao courrier coming soon.",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to assign courier",
    });
  }
};

export const assignCourierBulk = async (
  req: Request,
  res: Response,
) => {
  try {
    const { courierService } = req.query;
    const orderIds = req.body; 

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order IDs are required",
      });
    }

    const orders = await orderCollection
      .find({
        _id: { $in: orderIds.map((id) => new ObjectId(id)) },
        courier: { $exists: false },
      })
      .toArray();

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No valid orders found",
      });
    }

    if (courierService?.toString().toUpperCase() !== "STEADFAST") {
      return res.json({
        success: true,
        message: "Pathao courier coming soon",
      });
    }

    const courierResponses = await createSteadFastBulkParcel(orders);

    const bulkOps = courierResponses.map((item: any) => ({
      updateOne: {
        filter: { _id: new ObjectId(item.invoice.split("-")[1]) },
        update: {
          $set: {
            courier: {
              provider: "STEADFAST",
              consignmentId: item.consignment_id,
              trackingCode: item.tracking_code,
              status: "BOOKED",
            },
          },
        },
      },
    }));

    const result = await orderCollection.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      message: "Bulk courier assigned successfully",
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Bulk courier assignment failed",
    });
  }
};

export const getCourierStatusForOrder = async (
  req: Request,
  res: Response,
) => {
  try {
    const { orderId } = req.params;

    const order = await orderCollection.findOne({
      _id: new ObjectId(orderId as string),
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "No Order found!",
      });
    }

    const orderStatus = await trackSteadFastParcel(
      order.courier.trackingCode,
    );

    res.status(200).json(orderStatus);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to assign courier",
    });
  }
};
