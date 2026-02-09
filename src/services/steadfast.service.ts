import axios from "axios";
import "dotenv/config";
import { generateInvoiceNumber } from "./../utils/generateInvoiceNumber";

const steadFastApi = axios.create({
  baseURL: process.env.STEADFAST_BASE_URL!,
  headers: {
    "Api-Key": process.env.STEADFAST_API_KEY!,
    "Secret-Key": process.env.STEADFAST_SECRET_KEY!,
    "Content-Type": "application/json",
  },
});

const isTest = process.env.STEADFAST_MODE === "TEST";

export const createSteadFastParcel = async (order: any) => {
  const steadFastOrderData = {
    invoice: isTest
      ? `TEST-${generateInvoiceNumber("INV", 10)}`
      : generateInvoiceNumber("INV", 10),
    recipient_name: `${order.customerInfo.firstName} ${order.customerInfo.lastName}`,
    recipient_email: order.customerInfo.email,
    recipient_phone: order.customerInfo.phone,
    recipient_address: `${order.shippingAddress.region}, ${order.shippingAddress.city}, ${order.shippingAddress.street}`,
    cod_amount: order.grandTotal,
    note: isTest ? "TEST ORDER - DO NOT SHIP" : "Handle with care",
  };

  const res = await steadFastApi.post(
    "/create_order",
    steadFastOrderData,
  );

  const courierRes = res?.data?.consignment;

  const courier = {
    provider: "STEADFAST",
    consignmentId: courierRes.consignment_id,
    trackingCode: courierRes.tracking_code,
    status: "BOOKED",
  };

  return courier;
};

export const createSteadFastBulkParcel = async (orders: any[]) => {
  const bulkData = orders.map((order) => ({
    invoice: `INV-${order._id.toString()}`,
    recipient_name: `${order.customerInfo.firstName} ${order.customerInfo.lastName}`,
    recipient_email: order.customerInfo.email,
    recipient_phone: order.customerInfo.phone,
    recipient_address: `${order.shippingAddress.region}, ${order.shippingAddress.city}, ${order.shippingAddress.street}`,
    cod_amount: Number(order.grandTotal),
    note: isTest ? "Test order - do not ship." : "Handle with care",
  }));

  const res = await steadFastApi.post("/create_order/bulk-order", {
    data: JSON.stringify(bulkData),
  });

  return res?.data?.data || [];
};

export const trackSteadFastParcel = async (trackingCode: string) => {
  const res = await steadFastApi.get(
    `/status_by_trackingcode/${trackingCode}`,
  );

  return res.data;
};
