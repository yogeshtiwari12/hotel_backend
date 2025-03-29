
import { Cashfree } from "cashfree-pg";
import dotenv from "dotenv";
import Payment from "../model/payment_model.js";
dotenv.config();

Cashfree.XClientId = process.env.CLIENT_ID;
Cashfree.XClientSecret = process.env.CLIENT_SECRET;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;



export async function createPayment(req, res) {
  try {
    const { order_amount, customer_details } = req.body;

    if (!order_amount || !customer_details) {
      return res.status(400).json({ error: "Missing required payment details." });
    }

    const { customer_id, customer_name, customer_email, customer_phone } = customer_details;

  
    if (!customer_id || !customer_name || !customer_email || !customer_phone) {
      return res.status(400).json({ error: "Incomplete customer details." });
    }

 
    const request = {
      order_amount,
      order_currency: "INR",
      customer_details: {
        customer_id,
        customer_name,
        customer_email,
        customer_phone,
      },
      order_note: "Payment for booking",
    };


    const response = await Cashfree.PGCreateOrder("2023-08-01", request);

    const paymentSessionId = response?.data?.payment_session_id;

    if (paymentSessionId) {
      return res.status(200).json({ payment_session_id: paymentSessionId,res:response.data });
    } else {
      console.error("Error: Payment session ID not found in the response:", response?.data);
      return res.status(500).json({ error: "Payment session ID not found." });
    }

  } catch (error) {
    console.error("Error creating payment order:", error.response?.data || error.message);
    return res.status(500).json({ error: "Error creating payment order." });
  }
}






export async function savePayment(req, res) {
  try {
    const {
      order_id,
      cf_order_id,
      created_at,
      order_expiry_time,
      order_amount,
      order_currency,
      customer_details,
    } = req.body;

    // Check if all required fields are present
    if (
      !order_id ||
      !cf_order_id ||
      !created_at ||
      !order_expiry_time ||
      !order_amount ||
      !order_currency ||
      !customer_details?.customer_id ||
      !customer_details?.customer_name ||
      !customer_details?.customer_email ||
      !customer_details?.customer_phone
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

  
    const existingPayment = await Payment.findOne({ order_id });
    if (existingPayment) {
      return res.status(409).json({ error: "Payment already exists" });
    }

    // Save payment to the database
    const newPayment = new Payment({
      order_id,
      cf_order_id,
      created_at,
      order_expiry_time,
      order_amount,
      order_currency,
      customer_details,
    });

    await newPayment.save();
    return res.status(201).json({ message: "Payment saved successfully", payment: newPayment });
  } catch (error) {
    console.error("Error saving payment:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
