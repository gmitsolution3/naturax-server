import { Request, Response } from "express";
import {
  createProduct,
  DeleteService,
  DraftService,
  existingProductSlug,
  getAllProductService,
  getFeatureProdct,
  getProduct,
  primaryDeleteProductService,
  productWithSku,
} from "../services/product.service";
import { topSellingProduct } from "../services/createOrder.service";
import { ObjectId } from "mongodb";

export const addProduct = async (req: Request, res: Response) => {
  const productData = req.body;

  try {
    if (!productData) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const isExistedProductSlug = await existingProductSlug(productData.slug)

    if(isExistedProductSlug){
      return res.status(500).json({
        success: false,
        message: "Your slug is already exited"
      })
    }

    const result = await createProduct(productData);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

export const getAllProduct = async (req: Request, res: Response) => {
  try {
    const products = await getAllProductService();
    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductDetails = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;

    if (!slug) {
      res.status(400).json({
        success: false,
        message: "search parameter is missing. Try with search parameter",
      });
      return;
    }

    const product = await getProduct(slug as string);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductBySku = async (req: Request, res: Response) => {
  try {
    const { sku } = req.query;

    if (!sku || typeof sku !== "string") {
      res.status(400).json({
        success: false,
        message: "sku is missing. Try with sku",
      });
      return;
    }

    const skuProduct = await productWithSku(sku);

    if (!skuProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: skuProduct,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDraftProduct = async (req: Request, res: Response) => {
  const query = { isDraft: true };

  try {
    const result = await DraftService(query);

 

    if (result.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No data found in the db" });
    }

    res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDeleteProduct = async (req: Request, res: Response) => {
  const query = { isDelete: true };
  try {
    const result = await DeleteService(query);

    if (result.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No data found in the db" });
    }

    res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getFeaturedProduct = async (req: Request, res: Response) => {
  const query = { isDraft: false, featured: true, isDelete: false };


  try {
    const result = await getFeatureProdct(query);

    

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No feature data found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Feature Product found",
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, error: err });
  }
};


export const getTopSellingProduct = async(req:Request, res:Response)=>{
  try{
    const result = await topSellingProduct();

    if(result.length===0){
      return res.status(404).json({
        success: false,
        message: "Don't any any top selling product",
      })
    }


    res.status(200).json({
      success: true,
      message: "Find top selling product",
      data: result
    })

  }catch(err:any){
    res.status(500).json({
      success: false,
      message: err.message,
      error: err
    })
  }
}


export const primaryProductDelete = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID missing" });
    }

    const query = { _id: new ObjectId(id) };

    console.log(query)

    const updatedProduct = await primaryDeleteProductService(
      query,
    );

    console.log(updatedProduct)

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found or cannot update",
      });
    }

    res.status(200).json({
      success: true,
      message: `Product updated successfully`,
      data: updatedProduct,
    });
  } catch (err: any) {
    console.error("Error updating product:", err);
    res.status(500).json({
      success: false,
      message: err.message,
      error: err,
    });
  }
};
