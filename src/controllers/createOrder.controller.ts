import { Request, Response } from "express";
import {
  CreateOrderService,
  getAllOrder,
  getSingleOrder,
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

    console.log({result:result})

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

export const getOrderById= async(req:Request, res:Response)=>{
  const id= req.params.id

  const query = {_id: new ObjectId(id)}

  try{
    const response = await getSingleOrder(query);

    if (!response) {
      res.status(404).json({
        success: false,
        message: "No Data found in db"
      });
    }

    res.status(200).json({
      success: true,
      message: "Order Founded",
      data: response
    })


  }catch(err:any){
    res.status(500).json({
      success: false,
      message: "something is wrong",
      data: err,
    });
  }

}
