import express from 'express';
import { createPayment, savePayment } from '../methods/paymentmethod.js';
import { createRazorpayOrder, verifyPayment } from '../methods/razorpaymethod.js';

const router = express.Router();


router.post('/razorpay/createorder', createRazorpayOrder)
router.post('/razorpay/verify', verifyPayment)

export default router;