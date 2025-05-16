import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    order_id: { type: String, required: true, unique: true }, 
    created_at: { type: Date, required: true }, 
    order_amount: { type: Number, required: true }, 
    order_currency: { type: String, default: "INR" },

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
