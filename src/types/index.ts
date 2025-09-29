export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'consumer' | 'operator';
  addresses: Address[];
  createdAt: string;
}

export interface Address {
  id: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  capacity: number;
  operatingHours: string;
  isActive: boolean;
}

export interface Request {
  id: string;
  userId: string;
  orderNumber: string;
  platform: string;
  productDescription: string;
  receiptUrl?: string;
  warehouseId: string;
  originalETA: string;
  scheduledDeliveryDate: string;
  deliveryTimeSlot: string;
  destinationAddress: Address;
  status: RequestStatus;
  statusHistory: StatusUpdate[];
  paymentDetails: PaymentDetails;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type RequestStatus = 
  | 'submitted'
  | 'payment_pending'
  | 'approval_pending'
  | 'approved'
  | 'rejected'
  | 'parcel_expected'
  | 'parcel_arrived'
  | 'in_storage'
  | 'preparing_dispatch'
  | 'out_for_delivery'
  | 'delivered'
  | 'issue_reported';

export interface StatusUpdate {
  status: RequestStatus;
  timestamp: string;
  notes?: string;
}

export interface PaymentDetails {
  baseHandlingFee: number;
  storageFee: number;
  deliveryCharge: number;
  gst: number;
  totalAmount: number;
  paymentMethod?: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
}