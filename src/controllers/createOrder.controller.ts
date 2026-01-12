import { Request, Response } from "express";
import {
  CreateOrderService,
  getAllOrder,
  getDashboardAnalytics,
  getHistory,
  getSingleOrder,
  updateSingleOrder,
} from "../services/createOrder.service";
import { ObjectId } from "mongodb";

export const CreateOrder = async (req: Request, res: Response) => {
  const orderData = req.body;
  if (!orderData) {
    return res.status(500).json({
      success: false,
      message: "body data not found",
    });
  }

  console.log({orderData:orderData})

  try {
    const result = await CreateOrderService(orderData);

    res.status(201).send(result);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "something is wrong",
      data: err,
    });
  }
};

export const orderController = async (req: Request, res: Response) => {
  try {
    const result = await getAllOrder();

  

    if (result.length === 0) {
      res.status(404).json({
        success: false,
        message: "No Order found in db",
        data: result,
      });
    }

    res.status(200).json({
      success: false,
      message: "All data found",
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "something is wrong",
      data: err,
    });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  const id = req.params.id;

  const query = { _id: new ObjectId(id) };

  console.log("get into wrong place")

  try {
    const response = await getSingleOrder(query);

    if (!response) {
      res.status(404).json({
        success: false,
        message: "No Data found in db",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order Founded",
      data: response,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "something is wrong",
      data: err,
    });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;


  // console.log({payload: payload});

  const query = { _id: new ObjectId(id) };


  try {
    if (!ObjectId.isValid(id!)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order id",
      });
    }

    const result = await updateSingleOrder(query, payload);

    console.log({resultFromServer: result});

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};



export const historyController =async (req:Request, res:Response)=>{

  const userPhone = req.params.id;

  if (!userPhone) {
    return res.status(400).json({
      success: false,
      message: "User id is required",
    });
  }

  const query = { "customerInfo.phone": userPhone };

  try{
    const result = await getHistory(query);

    // if(result.length ===0){
    //   return res.status(404).json({
    //     success:false,
    //     message:"No order found for this user"
    //   })
    // }
    res.status(200).json({
      success:true,
      message:"Order history found",
      data:result
    })
  }catch(err:any){
    res.status(500).json({
      success:false,
      message:"Something went wrong",
      data:err
    })
  }

}

export const dashboardAnalyticsController = async (req: Request, res: Response) => {

  try{
    const result = await getDashboardAnalytics()

    res.status(200).json({
      success:true,
      message:"Dashboard analytics data found",
      data:result
    })


  }catch(err:any){
    res.status(500).json({
      success:false,
      message:"Something went wrong",
      data:err
    })
  }



};
