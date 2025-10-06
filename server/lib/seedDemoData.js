/* eslint-env node */
import bcrypt from 'bcryptjs';


export const DEMO_USERS = [
  {
    name: 'Demo Customer',
    email: 'user@test.com',
    password: 'UserDemo1',
    role: 'consumer',
    privileges: ['consumer']
  },
  {
    name: 'Burrow Admin',
    email: 'admin@burrow.com',
    password: 'AdminDemo1',
    role: 'operator',
    privileges: ['operator']

  }
];

async function upsertUser(usersCollection, userConfig) {
  const email = userConfig.email.toLowerCase();
  const existingUser = await usersCollection.findOne({ email });

  if (!existingUser) {
    const now = new Date();
    const passwordHash = await bcrypt.hash(userConfig.password, 10);

    await usersCollection.insertOne({
      name: userConfig.name,
      email,
      passwordHash,
      role: userConfig.role,
      privileges: userConfig.privileges,
      isActive: true,
      createdAt: now,
      updatedAt: now
    });

    return;
  }

  const updates = {};

  if (existingUser.email !== email) {
    updates.email = email;
  }

  if (existingUser.name !== userConfig.name) {
    updates.name = userConfig.name;
  }

  if (existingUser.role !== userConfig.role) {
    updates.role = userConfig.role;
  }


  if (userConfig.privileges?.length) {
    const existingPrivileges = existingUser.privileges ?? [];
    const targetPrivileges = userConfig.privileges;

    const privilegesChanged =
      existingPrivileges.length !== targetPrivileges.length ||
      existingPrivileges.some((value, index) => value !== targetPrivileges[index]);

    if (privilegesChanged) {
      updates.privileges = targetPrivileges;
    }
  }


  if (existingUser.isActive === false) {
    updates.isActive = true;
  }

  const passwordMatches = existingUser.passwordHash
    ? await bcrypt.compare(userConfig.password, existingUser.passwordHash)
    : existingUser.password === userConfig.password;

  if (!passwordMatches) {
    updates.passwordHash = await bcrypt.hash(userConfig.password, 10);
  }

  if (!existingUser.createdAt) {
    updates.createdAt = new Date();
  }

  if (!existingUser.updatedAt || Object.keys(updates).length > 0) {
    updates.updatedAt = new Date();
  }

  if (Object.keys(updates).length > 0) {
    await usersCollection.updateOne(
      { _id: existingUser._id },
      { $set: updates }
    );
  }
}

export function isDemoUserEmail(email) {
  if (!email) {
    return false;
  }

  const normalisedEmail = email.trim().toLowerCase();
  return DEMO_USERS.some((user) => user.email === normalisedEmail);
}


export async function seedDemoUsers(db, options = {}) {
  if (!db) {
    throw new Error('Cannot seed demo users without an active database connection.');
  }

  const usersCollection = db.collection('users');

  const requestedEmails = options.emails?.map((email) => email.trim().toLowerCase());
  const usersToSeed = requestedEmails?.length
    ? DEMO_USERS.filter((user) => requestedEmails.includes(user.email))
    : DEMO_USERS;

  for (const userConfig of usersToSeed) {
    await upsertUser(usersCollection, userConfig);
  }
}

