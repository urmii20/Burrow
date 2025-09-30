const resolveMockFlag = () => {
  if (typeof import.meta !== 'undefined') {
    const explicitFlag = import.meta.env?.VITE_ENABLE_MOCK_DATA;
    if (explicitFlag !== undefined) {
      return explicitFlag !== 'false' && explicitFlag !== '0';
    }
    return Boolean(import.meta.env?.DEV);
  }

  const globalProcess = typeof globalThis !== 'undefined' ? globalThis.process : undefined;

  if (globalProcess) {
    const explicitFlag =
      globalProcess.env?.VITE_ENABLE_MOCK_DATA ?? globalProcess.env?.ENABLE_MOCK_DATA;
    if (explicitFlag !== undefined) {
      return explicitFlag !== 'false' && explicitFlag !== '0';
    }
    return globalProcess.env?.NODE_ENV !== 'production';
  }

  return false;
};

export const MOCK_DATA_ENABLED = resolveMockFlag();

if (!MOCK_DATA_ENABLED && typeof console !== 'undefined') {
  console.warn('Mock data is disabled. Ensure your API and database are configured.');
}

const warehouseData = [
  {
    id: '1',
    name: 'Burrow Delhi Hub',
    address: 'Sector 18, Noida, Uttar Pradesh 201301',
    coordinates: [28.5355, 77.3910],
    capacity: 1000,
    operatingHours: '9:00 AM - 7:00 PM',
    isActive: true
  },
  {
    id: '2',
    name: 'Burrow Mumbai Central',
    address: 'Andheri East, Mumbai, Maharashtra 400069',
    coordinates: [19.1136, 72.8697],
    capacity: 1200,
    operatingHours: '9:00 AM - 7:00 PM',
    isActive: true
  },
  {
    id: '3',
    name: 'Burrow Bangalore Tech',
    address: 'Whitefield, Bangalore, Karnataka 560066',
    coordinates: [12.9698, 77.7500],
    capacity: 800,
    operatingHours: '9:00 AM - 7:00 PM',
    isActive: true
  },
  {
    id: '4',
    name: 'Burrow Chennai Port',
    address: 'OMR, Chennai, Tamil Nadu 600119',
    coordinates: [12.8406, 80.1534],
    capacity: 900,
    operatingHours: '9:00 AM - 7:00 PM',
    isActive: true
  },
  {
    id: '5',
    name: 'Burrow Kolkata East',
    address: 'Salt Lake, Kolkata, West Bengal 700091',
    coordinates: [22.5726, 88.3639],
    capacity: 700,
    operatingHours: '9:00 AM - 7:00 PM',
    isActive: true
  },
  {
    id: '6',
    name: 'Burrow Pune Hub',
    address: 'Hinjewadi, Pune, Maharashtra 411057',
    coordinates: [18.5879, 73.7386],
    capacity: 600,
    operatingHours: '9:00 AM - 7:00 PM',
    isActive: true
  }
];

const mockRequestsData = [
  {
    id: 'REQ001',
    userId: '2',
    orderNumber: 'AMZ123456789',
    platform: 'Amazon',
    productDescription: 'iPhone 15 Pro Max - Space Black 256GB',
    warehouseId: '1',
    originalETA: '2024-01-15',
    scheduledDeliveryDate: '2024-01-20',
    deliveryTimeSlot: '2:00 PM - 4:00 PM',
    destinationAddress: {
      id: 'addr1',
      line1: '123 Park Avenue',
      line2: 'Apartment 4B',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      landmark: 'Near Metro Station'
    },
    status: 'approval_pending',
    statusHistory: [
      {
        status: 'submitted',
        timestamp: '2024-01-10T10:00:00Z'
      },
      {
        status: 'approval_pending',
        timestamp: '2024-01-10T10:05:00Z'
      }
    ],
    paymentDetails: {
      baseHandlingFee: 49,
      storageFee: 20,
      deliveryCharge: 60,
      gst: 23.22,
      totalAmount: 152.22,
      paymentStatus: 'pending'
    },
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:05:00Z'
  }
];

const ecommercePlatformsData = [
  'Amazon',
  'Flipkart',
  'Myntra',
  'Nykaa',
  'Meesho',
  'Ajio',
  'Other'
];

const timeSlotsData = [
  '9:00 AM - 11:00 AM',
  '11:00 AM - 1:00 PM',
  '1:00 PM - 3:00 PM',
  '3:00 PM - 5:00 PM',
  '5:00 PM - 7:00 PM'
];

export const warehouses = MOCK_DATA_ENABLED ? warehouseData : [];
export const mockRequests = MOCK_DATA_ENABLED ? mockRequestsData : [];
export const ecommercePlatforms = MOCK_DATA_ENABLED ? ecommercePlatformsData : [];
export const timeSlots = MOCK_DATA_ENABLED ? timeSlotsData : [];
