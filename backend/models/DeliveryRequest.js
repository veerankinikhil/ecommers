import mongoose from 'mongoose';
import { DELIVERY_REQUEST_STATUSES } from '../config/constants.js';

const deliveryRequestSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  deliveryAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryAgent', required: true },
  status: { 
    type: String, 
    enum: Object.values(DELIVERY_REQUEST_STATUSES), 
    default: DELIVERY_REQUEST_STATUSES.PENDING 
  },
  payoutAmount: { type: Number, default: 120 }
}, { timestamps: true });

export const DeliveryRequest = mongoose.models.DeliveryRequest || mongoose.model('DeliveryRequest', deliveryRequestSchema);
