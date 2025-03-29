import express from 'express';
import { createPayment, savePayment } from '../methods/paymentmethod.js';

const router = express.Router();

router.post('/paymentkrdobhaiya',createPayment)
router.post('/savepayment',savePayment)

export default router;