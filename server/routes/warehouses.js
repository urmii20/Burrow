import { Router } from 'express';

import { serialiseDocument, toObjectId } from '../utils/formatters.js';

const router = Router();

const DEFAULT_TIME_SLOTS = [
  '9:00 AM - 11:00 AM',
  '11:00 AM - 1:00 PM',
  '1:00 PM - 3:00 PM',
  '3:00 PM - 5:00 PM',
  '5:00 PM - 7:00 PM'
];

function ensureDatabase(req, res) {
  const db = req.db;
  if (!db) {
    res.status(503).json({ message: 'Database is not ready yet. Please try again.' });
    return null;
  }

  return db;
}

router.get('/', async (req, res) => {
  const db = ensureDatabase(req, res);
  if (!db) {
    return;
  }

  const warehouses = await db
    .collection('warehouses')
    .find({ isActive: { $ne: false } })
    .sort({ name: 1 })
    .toArray();

  return res.json({ data: warehouses.map((warehouse) => serialiseDocument(warehouse)) });
});

router.post('/', async (req, res) => {
  const db = ensureDatabase(req, res);
  if (!db) {
    return;
  }

  const { name, address, coordinates, capacity, operatingHours, isActive = true } = req.body ?? {};

  if (!name || !address) {
    return res.status(400).json({ message: 'name and address are required.' });
  }

  const now = new Date();

  const warehouse = {
    name: name.trim(),
    address: address.trim(),
    coordinates: coordinates ?? null,
    capacity: capacity ?? null,
    operatingHours: operatingHours ?? null,
    isActive,
    createdAt: now,
    updatedAt: now
  };

  const result = await db.collection('warehouses').insertOne(warehouse);

  return res.status(201).json({ data: serialiseDocument({ ...warehouse, _id: result.insertedId }) });
});

router.get('/time-slots/defaults', (_req, res) => {
  res.json({ data: DEFAULT_TIME_SLOTS });
});

router.get('/time-slots', async (req, res) => {
  const db = ensureDatabase(req, res);
  if (!db) {
    return;
  }

  const slots = await db
    .collection('timeSlots')
    .find({ isActive: { $ne: false } })
    .sort({ order: 1, label: 1 })
    .toArray();

  if (!slots.length) {
    return res.json({ data: DEFAULT_TIME_SLOTS });
  }

  return res.json({ data: slots.map((slot) => slot.label ?? slot.name).filter(Boolean) });
});

router.patch('/:id', async (req, res) => {
  const db = ensureDatabase(req, res);
  if (!db) {
    return;
  }

  let warehouseId;
  try {
    warehouseId = toObjectId(req.params.id, 'warehouse id');
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  const updatePayload = { ...req.body, updatedAt: new Date() };

  const updateResult = await db.collection('warehouses').findOneAndUpdate(
    { _id: warehouseId },
    { $set: updatePayload },
    { returnDocument: 'after' }
  );

  if (!updateResult.value) {
    return res.status(404).json({ message: 'Warehouse not found' });
  }

  return res.json({ data: serialiseDocument(updateResult.value) });
});

export default router;
