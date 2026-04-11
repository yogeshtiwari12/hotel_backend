import express from 'express';
import { createRazorpayOrder, verifyPayment } from '../methods/razorpaymethod.js';
import dotenv from 'dotenv';

const router = express.Router();



router.post('/razorpay/createorder', createRazorpayOrder)
router.post('/razorpay/verify', verifyPayment)

export default router;