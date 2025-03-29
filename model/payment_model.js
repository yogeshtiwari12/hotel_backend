import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    order_id: { type: String, required: true, unique: true }, // Unique order ID from Cashfree
    cf_order_id: { type: String, required: true }, // Cashfree internal order ID
    created_at: { type: Date, required: true }, // Order creation timestamp
    order_expiry_time: { type: Date, required: true }, // Order expiry timestamp
    order_amount: { type: Number, required: true }, // Payment amount
    order_currency: { type: String, default: "INR" }, // Currency (Default: INR)

    customer_details: {
      customer_id: { type: String, required: true },
      customer_name: { type: String, required: true },
      customer_email: { type: String, required: true },
      customer_phone: { type: String, required: true },
    },
  },
  { timestamps: true } 
);

const Payment = mongoose.model("Payment", PaymentSchema);
export default Payment;
