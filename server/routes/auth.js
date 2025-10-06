import bcrypt from 'bcryptjs';
import { Router } from 'express';

import { serialiseDocument, toObjectId } from '../utils/formatters.js';
import { isDemoUserEmail, seedDemoUsers } from '../lib/seedDemoData.js';

const DEMO_ACCOUNTS = {
  'user@test.com': {
    password: 'UserDemo1',
    user: {
      id: 'demo-user',
      name: 'Demo Customer',
      email: 'user@test.com',
      role: 'consumer',
      privileges: ['consumer'],
      isActive: true
    }
  },
  'admin@burrow.com': {
    password: 'AdminDemo1',
    user: {
      id: 'demo-operator',
      name: 'Demo Operator',
      email: 'admin@burrow.com',
      role: 'operator',
      privileges: ['operator'],
      isActive: true
    }
  }
};

const router = Router();

const SENSITIVE_USER_FIELDS = ['password', 'passwordHash'];

function sanitiseUser(user) {
  if (!user) {
    return null;
  }

  const safeUser = serialiseDocument(user);
  for (const field of SENSITIVE_USER_FIELDS) {
    delete safeUser[field];
  }

  return safeUser;
}

router.post('/register', async (req, res) => {
  const db = req.db;
  if (!db) {
    return res.status(503).json({ message: 'Database is not ready yet. Please try again.' });
  }

  const { name, email, password, role = 'consumer' } = req.body ?? {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required.' });
  }

  const normalisedEmail = email.trim().toLowerCase();
  const usersCollection = db.collection('users');

  const existingUser = await usersCollection.findOne({ email: normalisedEmail });
  if (existingUser) {
    return res.status(409).json({ message: 'A user with this email already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const now = new Date();

  const user = {
    name: name.trim(),
    email: normalisedEmail,
    passwordHash,
    role,
    isActive: true,
    createdAt: now,
    updatedAt: now
  };

  const result = await usersCollection.insertOne(user);

  return res.status(201).json({
    data: sanitiseUser({ ...user, _id: result.insertedId })
  });
});

router.post('/login', async (req, res) => {
  const db = req.db;
  if (!db) {
    return res.status(503).json({ message: 'Database is not ready yet. Please try again.' });
  }

  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const normalisedEmail = email.trim().toLowerCase();
  const usersCollection = db.collection('users');

  let user = await usersCollection.findOne({ email: normalisedEmail, isActive: { $ne: false } });


  const respondWithDemoAccountIfValid = () => {
    const demoAccount = DEMO_ACCOUNTS[normalisedEmail];
    if (demoAccount && password === demoAccount.password) {
      return res.json({ data: sanitiseUser(demoAccount.user) });
    }
    return null;
  };


  if (!user && isDemoUserEmail(normalisedEmail)) {
    await seedDemoUsers(db, { emails: [normalisedEmail] });
    user = await usersCollection.findOne({ email: normalisedEmail, isActive: { $ne: false } });
  }



  if (!user) {
    const response = respondWithDemoAccountIfValid();
    if (response) {
      return response;
    }

    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const passwordMatches = user.passwordHash
    ? await bcrypt.compare(password, user.passwordHash)
    : user.password === password;

  if (!passwordMatches) {
    const response = respondWithDemoAccountIfValid();
    if (response) {
      return response;
    }

    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  if (user._id) {
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { lastLoginAt: new Date() } }
    );
  }

  return res.json({ data: sanitiseUser(user) });
});

router.post('/logout', (_req, res) => {
  res.json({ message: 'Logged out' });
});

router.get('/:id', async (req, res) => {
  const db = req.db;
  if (!db) {
    return res.status(503).json({ message: 'Database is not ready yet. Please try again.' });
  }

  const { id } = req.params;

  let objectId;
  try {
    objectId = toObjectId(id, 'User id');
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  const user = await db.collection('users').findOne({ _id: objectId });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json({ data: sanitiseUser(user) });
});

export default router;
