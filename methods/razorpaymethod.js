
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
        key_id: process.env.RAZORPAY_KEY_ID,
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
    
    try {
      const paymentDetails = await razorpay.orders.fetchPayments(razorpay_order_id);
      
      // Check if the payment exists and has been authorized/captured
      const payment = paymentDetails.items.find(item => item.id === razorpay_payment_id);
      
      if (!payment) {
        console.log(" not found in Razorpay records");
        return res.status(400).json({ 
          error: "Invalid payment",
          details: "Payment not found in Razorpay records"
        });
      }
      
      if (payment.status !== 'captured' && payment.status !== 'authorized') {
        console.log("Payment not successful, status:", payment.status);
        return res.status(400).json({ 
          error: "Payment verification failed",
          details: `Payment status is ${payment.status}`
        });
      }
     
      const newPayment = new Payment({
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        signature: razorpay_signature,
        created_at: new Date(),
        order_amount: req.body.amount / 100, 
        order_currency: "INR",
        customer_details: req.body.notes || {},
        payment_status: payment.status
      });
  
      await newPayment.save();
      
      return res.status(200).json({ 
        message: "Payment verified and saved successfully", 
        paymentId: razorpay_payment_id,
        status: payment.status
      });
      
    } catch (razorpayError) {
      console.error("Error fetching payment from Razorpay:", razorpayError);
      
      // Fallback to signature verification if API call fails
      console.log("Falling back to signature verification...");
      
      // Create signature string and generate HMAC
      const signatureString = razorpay_order_id + "|" + razorpay_payment_id;
      console.log("Signature string:", signatureString);
      
      const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET) 
        .update(signatureString)
        .digest("hex");
      
      // Compare signatures
      console.log("Generated signature:", generatedSignature);
      console.log("Razorpay signature:", razorpay_signature);
      console.log("Signatures match:", generatedSignature === razorpay_signature);
  
      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({ 
          error: "Invalid payment signature",
          details: "Signature verification failed. Please contact support."
        });
      }
  
      const newPayment = new Payment({
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        signature: razorpay_signature,
        created_at: new Date(),
        order_amount: req.body.amount / 100, 
        order_currency: "INR",
        customer_details: req.body.notes || {}
      });
  
      await newPayment.save();
      
      return res.status(200).json({ 
        message: "Payment verified and saved successfully (via signature)", 
        paymentId: razorpay_payment_id 
      });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({ error: "Error verifying payment." });
  }
}
