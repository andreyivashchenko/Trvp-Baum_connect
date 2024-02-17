import { sql } from '@vercel/postgres';
import { unstable_noStore as noStore } from 'next/cache';
import {
  ApplicationForm,
  ApplicationsTable,
  LatestApplicationRaw,
  MasterField,
  MasterForm,
  MastersTableType,
  Revenue,
  User,
} from './definitions';
import { formatCurrency } from './utils';

export async function fetchRevenue() {
  noStore();
  try {
    console.log('Fetching revenue data...');

    const data = await sql<Revenue>`SELECT * FROM revenue`;

    console.log('Data fetch completed after 3 seconds.');

    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestApplications() {
  noStore();
  try {
    const data = await sql<LatestApplicationRaw>`
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    const latestInvoices = data.rows.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest applications.');
  }
}

export async function fetchCardData() {
  noStore();
  try {
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfApplications = Number(data[0].rows[0].count ?? '0');
    const numberOfMasters = Number(data[1].rows[0].count ?? '0');
    const totalPaidApplications = formatCurrency(data[2].rows[0].paid ?? '0');
    const totalPendingApplications = formatCurrency(
      data[2].rows[0].pending ?? '0',
    );

    return {
      numberOfMasters,
      numberOfApplications,
      totalPaidApplications,
      totalPendingApplications,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;

export async function fetchFilteredApplications(
  query: string,
  currentPage: number,
) {
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await sql<ApplicationsTable>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        invoices.complexity,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch applications.');
  }
}

export async function fetchApplicationsPages(query: string) {
  noStore();
  try {
    const count = await sql`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of applications.');
  }
}

export async function fetchMastersPages(query: string) {
  noStore();

  try {
    const count = await sql`SELECT COUNT(*)
    FROM customers
    WHERE 
    name ILIKE ${`%${query}%`} OR
    email ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of masters.');
  }
}

export async function fetchApplicationById(id: string) {
  noStore();
  try {
    const data = await sql<ApplicationForm>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status,
        invoices.complexity
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.rows.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));
    console.log(invoice);
    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchMasterById(id: string) {
  noStore();
  try {
    const data = await sql<MasterForm>`
      SELECT
        customers.id,
        customers.name,
        customers.email
      FROM customers
      WHERE customers.id = ${id};
    `;

    const customer = data.rows.map((customer) => ({
      ...customer,
      // Convert amount from cents to dollars
    }));
    console.log(customer);
    return customer[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch customer.');
  }
}

export async function fetchMasters() {
  noStore();
  try {
    const data = await sql<MasterField>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name
      
    `;
    console.log(data);
    const customers = data.rows;
    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all masters.');
  }
}

export async function fetchFilteredMasters(query: string, currentPage: number) {
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  try {
    const data = await sql<MastersTableType>`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  customers.workload,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.complexity ELSE 0 END) AS total_workload
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
		LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
	  `;
    console.log(data);
    const customers = data.rows.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
      total_workload: customer.total_workload || 0,
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}

export async function getUser(email: string) {
  try {
    const user = await sql`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0] as User;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export async function fetchActualWorkload(customerId: string) {
  noStore();
  try {
    const totalWorkload = await sql`
    SELECT
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.complexity ELSE 0 END) AS total_workload
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		customers.id = ${customerId}
		`;

    const workload = totalWorkload.rows.map((total_workload) => ({
      ...total_workload,
    }));
    return +workload[0].total_workload;
  } catch (e) {
    throw new Error('Failed to fetch workload.');
  }
}

export async function fetchApplicationStateBeforeByApplicationId(id: string) {
  noStore();
  try {
    const data = await sql`
SELECT customer_id, complexity, status FROM invoices WHERE id=${id}
`;
    const invoice = data.rows.map((invoice) => ({
      ...invoice,
    }));
    return invoice[0];
  } catch (e) {
    throw new Error('Failed to fetch invoice before.');
  }
}
