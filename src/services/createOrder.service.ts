import { client } from "../config/db";
import { productCollection } from "./product.service";

const createOrderCollection = client
  .db("loweCommerce")
  .collection("create_order");

// created order
export async function CreateOrderService(payload: any) {
  //  Extract slugs from cart
  const slugs = payload.products.map((p: any) => p.slug);

  //  Fetch products from DB
  const productsFromDB = await productCollection
    .find({
      slug: { $in: slugs },
    })
    .toArray();

  if (!productsFromDB.length) {
    return { success: false, message: "No Data found in database" };
  }

  //  Merge frontend cart with DB data & validate price / stock
  const finalProducts = payload.products.map((cartItem: any) => {
    const productDB = productsFromDB.find((p) => p.slug === cartItem.slug);
    if (!productDB) {
      throw new Error(`Product not found: ${cartItem.slug}`);
    }

    // Validate stock
    const availableStock = parseInt(productDB.stockQuantity as string, 10);
    if (cartItem.quantity > availableStock) {
      throw new Error(`Not enough stock for product: ${productDB.title}`);
    }

    // Calculate price after discount
    let basePrice = parseFloat(productDB.basePrice);
    if (productDB.discount?.type === "percentage") {
      basePrice =
        basePrice - (basePrice * parseFloat(productDB.discount.value)) / 100;
    }

    return {
      productId: productDB._id,
      title: productDB.title,
      slug: productDB.slug,
      quantity: cartItem.quantity,
      price: basePrice,
      subtotal: basePrice * cartItem.quantity,
      variant: cartItem.variant, // keep variant info
    };
  });

  // Calculate order totals
  const subtotal = finalProducts.reduce(
    (sum: any, p: any) => sum + p.subtotal,
    0
  );

  const deliveryCharge = payload.deliveryMethod === "inside" ? 80 : 100;
  const grandTotal = subtotal + deliveryCharge;

  //  Prepare final order object
  const orderData = {
    customerInfo: {
      firstName: payload.customerInfo.firstName,
      lastName: payload.customerInfo.lastName,
      phone: payload.customerInfo.phone,
      email: payload.customerInfo.email,
    },
    shippingAddress: {
      street: payload.shippingAddress.street,
      city: payload.shippingAddress.city,
      region: payload.shippingAddress.region,
      postalCode: payload.shippingAddress.postalCode,
    },
    products: finalProducts,
    subtotal,
    deliveryCharge,
    grandTotal,
    paymentMethod: payload.paymentMethod,
    deliveryMethod: payload.deliveryMethod,
    promoCode: payload.promoCode || "",
    createdAt: new Date(),
    orderStatus: payload.orderStatus,
    paymentStatus: payload.paymentStatus,
  };

  // Insert order into DB
  const result = await createOrderCollection.insertOne(orderData);

  return {
    success: true,
    orderId: result.insertedId,
    grandTotal,
    message: "Order created successfully",
    paymentMethod: payload.paymentMethod,
  };
}

// get all order
export async function getAllOrder() {
  const result = await createOrderCollection
    .find()
    .sort({ createdAt: -1 })
    .toArray();
  return result;
}

// get single order for details and edit
export async function getSingleOrder(query: any) {
  const result = await createOrderCollection.findOne(query);

  return result;
}

export const updateSingleOrder = async (query: any, payload: any) => {
  console.log({ payload: payload, query: query });

  const { _id, ...updateData } = payload;

  return await createOrderCollection.updateOne(query, {
    $set: updateData,
  });
};

export async function getHistory(query: any) {
  // const historyTracker = await createOrderCollection
  //   .find(query)
  //   .sort({ createdAt: -1 })
  //   .toArray();

  const historyTracker = await createOrderCollection
    .aggregate([
      {
        $match: {
          "customerInfo.phone": query["customerInfo.phone"],
        },
      },
      {
        $group: {
          _id: "$customerInfo.phone",

          // 🔹 Total Orders
          totalOrders: { $sum: 1 },

          // 🔹 Financial
          totalGrandTotal: { $sum: "$grandTotal" },

          // 🔹 Order Status Counts
          pending: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "pending"] }, 1, 0] },
          },
          processing: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "processing"] }, 1, 0] },
          },
          courier: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "courier"] }, 1, 0] },
          },
          onHold: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "on-hold"] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "cancelled"] }, 1, 0] },
          },
          returned: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "return"] }, 1, 0] },
          },
          completed: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "completed"] }, 1, 0] },
          },

          // 🔹 Payment Summary
          totalPaidOrders: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "success"] }, 1, 0],
            },
          },

          totalPaidAmount: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "success"] }, "$grandTotal", 0],
            },
          },
          totalDueOrders: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "due"] }, 1, 0] },
          },
          totalDueAmount: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "due"] }, "$grandTotal", 0],
            },
          },
          userInfo: { $first: "$customerInfo" },

          // 🔹 Dates
          firstOrderDate: { $min: "$createdAt" },
          lastOrderDate: { $max: "$createdAt" },
        },
      },
    ]).toArray();


  return historyTracker;
}
