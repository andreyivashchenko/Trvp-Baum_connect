export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  image_url: string;
};

export type Application = {
  id: string;
  customer_id: string;
  amount: number;
  date: string;

  status: 'pending' | 'paid';
};

export type Revenue = {
  month: string;
  revenue: number;
};

export type LatestApplication = {
  id: string;
  name: string;
  image_url: string;
  email: string;
  amount: string;
};

// The database returns a number for amount, but we later format it to a string with the formatCurrency function
export type LatestApplicationRaw = Omit<LatestApplication, 'amount'> & {
  amount: number;
};

export type ApplicationsTable = {
  id: string;
  customer_id: string;
  name: string;
  email: string;
  image_url: string;
  date: string;
  amount: number;
  status: 'pending' | 'paid';
  complexity: number;
};

export type MastersTableType = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: number;
  total_paid: number;
  total_workload: number;
  workload: number;
};

export type FormattedMastersTable = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: string;
  total_paid: string;
};

export type MasterField = {
  id: string;
  name: string;
};

export type ApplicationForm = {
  id: string;
  customer_id: string;
  amount: number;
  status: 'pending' | 'paid';
  complexity: number;
};

export type MasterForm = {
  id: string;
  name: string;
  email: number;
};
