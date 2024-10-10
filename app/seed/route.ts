import bcrypt from 'bcrypt';
import { db } from '@vercel/postgres';
import { users, customers, invoices, revenue } from '../lib/placeholder-data';

async function seedDatabase() {
  await db.connect();

  try {
    await Promise.all([
      seedUsers(),
      seedCustomers(),
      seedInvoices(),
      seedRevenue(),
    ]);
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await db.end();
  }
}

async function seedUsers() {
  await db.sql`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );

    INSERT INTO users (id, name, email, password)
    VALUES ${users.map((user) => `(${user.id}, ${user.name}, ${user.email}, ${bcrypt.hashSync(user.password, 10)})`).join(',')}
    ON CONFLICT (id) DO NOTHING;
  `;
}

async function seedCustomers() {
  await db.sql`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );

    INSERT INTO customers (id, name, email, image_url)
    VALUES ${customers.map((customer) => `(${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})`).join(',')}
    ON CONFLICT (id) DO NOTHING;
  `;
}

async function seedInvoices() {
  await db.sql`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );

    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES ${invoices.map((invoice) => `(${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})`).join(',')}
    ON CONFLICT (id) DO NOTHING;
  `;
}

async function seedRevenue() {
  await db.sql`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );

    INSERT INTO revenue (month, revenue)
    VALUES ${revenue.map((rev) => `(${rev.month}, ${rev.revenue})`).join(',')}
    ON CONFLICT (month) DO NOTHING;
  `;
}

export async function GET() {
  try {
    await seedDatabase();
    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
