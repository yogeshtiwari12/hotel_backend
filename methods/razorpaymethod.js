
import dotenv from "dotenv";
import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../model/payment_model.js";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function createRazorpayOrder(req, res) {
  try {
    const { order_amount, customer_details } = req.body;

    if (!order_amount || !customer_details) {
      return res.status(400).json({ error: "Missing required payment details." });
    }

    const { customer_id, customer_name, customer_email, customer_phone } = customer_details;

    if (!customer_id || !customer_name || !customer_email || !customer_phone) {
      return res.status(400).json({ error: "Incomplete customer details." });
    }

    // Create order options
    const options = {
      amount: Math.round(order_amount * 100), 
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        customer_id: customer_id,
        customer_name: customer_name,
        customer_email: customer_email,
        customer_phone: customer_phone
      }
    };

    const order = await razorpay.orders.create(options);

    if (order.id) {
      return res.status(200).json({ 
        order_id: order.id,
        key_id: "rzp_test_pWTyz7mheqVuPN",
        amount: order.amount,
        currency: order.currency,
        notes: order.notes,
        created_at: order.created_at
      });
    } else {
      console.error("Error: Order ID not found in the response:", order);
      return res.status(500).json({ error: "Order creation failed." });
    }
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return res.status(500).json({ error: "Error creating payment order." });
  }
}

export async function verifyPayment(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const generatedSignature = crypto
      .createHmac("sha256", "egBqDudTjXSJSWqPBr6adyqM")
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    const newPayment = new Payment({
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      signature: razorpay_signature,
      created_at: new Date(),
      order_amount: req.body.amount / 100, // Convert back from paise to rupees
      order_currency: "INR",
      customer_details: req.body.notes || {}
    });

    await newPayment.save();
    
    return res.status(200).json({ 
      message: "Payment verified and saved successfully", 
      paymentId: razorpay_payment_id 
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({ error: "Error verifying payment." });
  }
}
