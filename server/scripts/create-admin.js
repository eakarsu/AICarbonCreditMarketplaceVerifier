'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../models');

async function main() {
  if (!['1', 'true'].includes(process.env.ALLOW_SCHEMA_MIGRATION || '')) {
    throw new Error('Explicit bootstrap acknowledgement is required');
  }
  const email = (process.env.PROVISION_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.PROVISION_ADMIN_PASSWORD || '';
  if (!email || password.length < 12) {
    throw new Error('Admin email and a 12+ character password are required');
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await sequelize.query(
    `INSERT INTO "Users" (name, email, password, role, "createdAt", "updatedAt")
     VALUES (:name, :email, :password, 'admin', NOW(), NOW())
     ON CONFLICT (email) DO UPDATE SET
       name = EXCLUDED.name,
       password = EXCLUDED.password,
       role = EXCLUDED.role,
       "updatedAt" = NOW()`,
    {
      replacements: { name: 'Runtime Administrator', email, password: passwordHash },
      type: QueryTypes.INSERT,
    }
  );
  console.log('Administrator provisioned.');
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
