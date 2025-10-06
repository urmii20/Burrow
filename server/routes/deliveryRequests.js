import { Router } from 'express';
import { ObjectId } from 'mongodb';

import { serialiseDocument, toObjectId } from '../utils/formatters.js';

const router = Router();

const DEFAULT_STATUS = 'submitted';
const STATUS_FLOW = [
  'submitted',
  'payment_pending',
  'approval_pending',
  'approved',
  'rejected',
  'scheduled',
  'parcel_expected',
  'parcel_arrived',
  'in_storage',
  'preparing_dispatch',
  'reschedule_requested',
  'out_for_delivery',
  'delivered',
  'issue_reported',
  'cancelled'
];

function buildStatusHistoryEntry(status, note) {
  return {
    status,
    timestamp: new Date(),
    ...(note ? { note, notes: note } : {})
  };
}

function parseDate(value, fieldName) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} must be a valid date.`);
  }

  return date;
}

function ensureDatabase(req, res) {
  const db = req.db;
  if (!db) {
    res.status(503).json({ message: 'Database is not ready yet. Please try again.' });
    return null;
  }

  return db;
}

function serialiseRequests(requests) {
  return requests.map((request) => serialiseDocument(request));
}

function buildRequestIdQuery(rawId) {
  if (!rawId) {
    throw new Error('request id is required.');
  }

  if (ObjectId.isValid(rawId)) {
    const objectId = new ObjectId(rawId);
    return { $or: [{ _id: objectId }, { _id: rawId }] };
  }

  return { _id: rawId };
}

async function resolveUpdatedRequest(collection, idQuery, updateResult) {
  if (updateResult && typeof updateResult === 'object') {
    if ('value' in updateResult && updateResult.value) {
      return updateResult.value;
    }

    if (updateResult.lastErrorObject?.updatedExisting) {
      return collection.findOne(idQuery);
    }
  }

  return updateResult;
}

router.get('/', async (req, res) => {
  const db = ensureDatabase(req, res);
  if (!db) {
    return;
  }

  const { userId, status, orderNumber } = req.query;

  const query = {};

  if (userId) {
    try {
      query.userId = toObjectId(userId, 'userId');
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  if (status) {
    query.status = status;
  }

  if (orderNumber && orderNumber.trim()) {
    query.orderNumber = orderNumber.trim();
  }

  const requests = await db
    .collection('deliveryRequests')
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  return res.json({ data: serialiseRequests(requests) });
});

router.get('/:id', async (req, res) => {
  const db = ensureDatabase(req, res);
  if (!db) {
    return;
  }

  let idQuery;
  try {
    idQuery = buildRequestIdQuery(req.params.id);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  const request = await db.collection('deliveryRequests').findOne(idQuery);

  if (!request) {
    return res.status(404).json({ message: 'Request not found' });
  }

  return res.json({ data: serialiseDocument(request) });
});

router.post('/', async (req, res) => {
  const db = ensureDatabase(req, res);
  if (!db) {
    return;
  }

  const {
    userId,
    orderNumber,
    platform,
    productDescription,
    warehouseId,
    originalETA,
    scheduledDeliveryDate,
    deliveryTimeSlot,
    destinationAddress,
    paymentDetails = {}
  } = req.body ?? {};

  if (!userId) {
    return res.status(400).json({ message: 'userId is required.' });
  }

  if (!orderNumber) {
    return res.status(400).json({ message: 'orderNumber is required.' });
  }

  if (!scheduledDeliveryDate) {
    return res.status(400).json({ message: 'scheduledDeliveryDate is required.' });
  }

  if (!deliveryTimeSlot) {
    return res.status(400).json({ message: 'deliveryTimeSlot is required.' });
  }

  let userObjectId;
  try {
    userObjectId = toObjectId(userId, 'userId');
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  let parsedOriginalEta = null;
  if (originalETA) {
    try {
      parsedOriginalEta = parseDate(originalETA, 'originalETA');
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  let parsedScheduledDeliveryDate;
  try {
    parsedScheduledDeliveryDate = parseDate(scheduledDeliveryDate, 'scheduledDeliveryDate');
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  let resolvedWarehouseId = warehouseId ?? null;
  if (warehouseId) {
    try {
      resolvedWarehouseId = toObjectId(warehouseId, 'warehouseId');
    } catch {
      resolvedWarehouseId = warehouseId;
    }
  }

  const now = new Date();

  const request = {
    userId: userObjectId,
    orderNumber: orderNumber.trim(),
    platform: platform?.trim() ?? 'Other',
    productDescription: productDescription?.trim() ?? '',
    warehouseId: resolvedWarehouseId,
    originalETA: parsedOriginalEta,
    scheduledDeliveryDate: parsedScheduledDeliveryDate,
    deliveryTimeSlot,
    destinationAddress: destinationAddress ?? {},
    status: DEFAULT_STATUS,
    statusHistory: [buildStatusHistoryEntry(DEFAULT_STATUS)],
    paymentDetails: {
      baseHandlingFee: paymentDetails.baseHandlingFee ?? 0,
      storageFee: paymentDetails.storageFee ?? 0,
      deliveryCharge: paymentDetails.deliveryCharge ?? 0,
      gst: paymentDetails.gst ?? 0,
      totalAmount: paymentDetails.totalAmount ?? 0,
      paymentStatus: paymentDetails.paymentStatus ?? 'pending',
      paymentMethod: paymentDetails.paymentMethod ?? 'card'
    },
    createdAt: now,
    updatedAt: now
  };

  const result = await db.collection('deliveryRequests').insertOne(request);

  return res.status(201).json({
    data: serialiseDocument({ ...request, _id: result.insertedId })
  });
});

router.put('/:id/reschedule', async (req, res) => {
  const db = ensureDatabase(req, res);
  if (!db) {
    return;
  }

  const { scheduledDeliveryDate, deliveryTimeSlot, note } = req.body ?? {};

  if (!scheduledDeliveryDate || !deliveryTimeSlot) {
    return res.status(400).json({ message: 'scheduledDeliveryDate and deliveryTimeSlot are required.' });
  }

  let idQuery;
  try {
    idQuery = buildRequestIdQuery(req.params.id);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  let parsedScheduledDeliveryDate;
  try {
    parsedScheduledDeliveryDate = parseDate(scheduledDeliveryDate, 'scheduledDeliveryDate');
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  const now = new Date();
  const collection = db.collection('deliveryRequests');

  const updateResult = await collection.findOneAndUpdate(
    idQuery,
    {
      $set: {
        scheduledDeliveryDate: parsedScheduledDeliveryDate,
        deliveryTimeSlot,
        status: 'reschedule_requested',
        updatedAt: now
      },
      $push: { statusHistory: buildStatusHistoryEntry('reschedule_requested', note) }
    },
    { returnDocument: 'after' }
  );

  const updatedRequest = await resolveUpdatedRequest(collection, idQuery, updateResult);

  if (!updatedRequest) {
    return res.status(404).json({ message: 'Request not found' });
  }

  return res.json({ data: serialiseDocument(updatedRequest) });
});

router.patch('/:id/status', async (req, res) => {
  const db = ensureDatabase(req, res);
  if (!db) {
    return;
  }

  const { status, note } = req.body ?? {};

  if (!status) {
    return res.status(400).json({ message: 'status is required.' });
  }

  if (!STATUS_FLOW.includes(status)) {
    return res.status(400).json({ message: `status must be one of: ${STATUS_FLOW.join(', ')}` });
  }

  let idQuery;
  try {
    idQuery = buildRequestIdQuery(req.params.id);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  const now = new Date();
  const collection = db.collection('deliveryRequests');

  const updateResult = await collection.findOneAndUpdate(
    idQuery,
    {
      $set: { status, updatedAt: now },
      $push: { statusHistory: buildStatusHistoryEntry(status, note) }
    },
    { returnDocument: 'after' }
  );

  const updatedRequest = await resolveUpdatedRequest(collection, idQuery, updateResult);

  if (!updatedRequest) {
    return res.status(404).json({ message: 'Request not found' });
  }

  return res.json({ data: serialiseDocument(updatedRequest) });
});

router.patch('/:id/payment', async (req, res) => {
  const db = ensureDatabase(req, res);
  if (!db) {
    return;
  }

  const { paymentStatus, paymentDetails = {} } = req.body ?? {};

  if (!paymentStatus) {
    return res.status(400).json({ message: 'paymentStatus is required.' });
  }

  let idQuery;
  try {
    idQuery = buildRequestIdQuery(req.params.id);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  const now = new Date();

  const updateSet = {
    'paymentDetails.paymentStatus': paymentStatus,
    updatedAt: now
  };

  if (paymentDetails.baseHandlingFee !== undefined) {
    updateSet['paymentDetails.baseHandlingFee'] = paymentDetails.baseHandlingFee;
  }

  if (paymentDetails.storageFee !== undefined) {
    updateSet['paymentDetails.storageFee'] = paymentDetails.storageFee;
  }

  if (paymentDetails.deliveryCharge !== undefined) {
    updateSet['paymentDetails.deliveryCharge'] = paymentDetails.deliveryCharge;
  }

  if (paymentDetails.gst !== undefined) {
    updateSet['paymentDetails.gst'] = paymentDetails.gst;
  }

  if (paymentDetails.totalAmount !== undefined) {
    updateSet['paymentDetails.totalAmount'] = paymentDetails.totalAmount;
  }

  if (paymentDetails.paymentMethod !== undefined) {
    updateSet['paymentDetails.paymentMethod'] = paymentDetails.paymentMethod;
  }

  const collection = db.collection('deliveryRequests');

  const updateResult = await collection.findOneAndUpdate(
    idQuery,
    { $set: updateSet },
    { returnDocument: 'after' }
  );

  const updatedRequest = await resolveUpdatedRequest(collection, idQuery, updateResult);

  if (!updatedRequest) {
    return res.status(404).json({ message: 'Request not found' });
  }

  return res.json({ data: serialiseDocument(updatedRequest) });
});

export default router;
