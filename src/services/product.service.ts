import { ObjectId, ReturnDocument } from "mongodb";
import { client } from "../config/db";
import { Product } from "../models/product.model";

export const productCollection = client
  .db("loweCommerce")
  .collection<Product>("products");

export async function createProduct(product: Product) {
  const result = await productCollection.insertOne(product);
  return result;
}

export async function existingProductSlug(slug: string) {
  const result = await productCollection.findOne({ slug: slug });
  return result;
}

export async function getAllProductService() {
  const query = { isDraft: false, isDelete: false };

  const result = await productCollection
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  return result;
}

export async function getProduct(slug: string) {
  return await productCollection.findOne({ slug });
}

// it's not need for now
export async function productWithSku(sku: string) {
  return await productCollection.findOne({
    $or: [{ sku }, { "variants.sku": sku }],
    isDelete: false,
    isDraft: false,
  });
}

// get all draft product
export async function DraftService(query: { isDraft: boolean }) {
  const result = await productCollection
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  return result;
}

export async function DeleteService(query: { isDelete: boolean }) {
  const result = await productCollection.find(query).toArray();
  return result;
}

export const permanentlyDeleteServer = async (query: any) => {
  const result = await productCollection.deleteOne(query);
  return result;
};

export const restoreProductService = async (query: any) => {
  const result = await productCollection.updateOne(query, {
    $set: { isDelete: false, restoreAt: new Date() },
  });
  return result;
};

export async function getFeatureProdct(query: {
  isDraft: boolean;
  featured: boolean;
  isDelete: boolean;
}) {
  const result = await productCollection
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  return result;
}

export const primaryDeleteProductService = async (query: any) => {
  const result = await productCollection.findOneAndUpdate(
    query,
    { $set: { isDelete: true, deletedAt: new Date() } },
    { returnDocument: "after" },
  );
  return result;
};

export const productUpdateService = async (query: any, payload: any) => {
  const result = await productCollection.findOneAndUpdate(
    query,
    { $set: payload },
    { returnDocument: "after" },
  );
  return result;
};
