import { client } from "../config/db";
import { productCollection } from "./product.service";

const createOrderCollection = client
  .db("loweCommerce")
  .collection("create_order");


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
    throw new Error("No products found in database for given slugs");
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

export async function getAllOrder() {
  const result = await createOrderCollection.find().toArray();
  return result;
}

export async function getSingleOrder(query:any) {

  const result = await createOrderCollection.findOne(query)

  return result;
  
}
