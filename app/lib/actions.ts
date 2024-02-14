'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { imageUrls } from '@/app/lib/utils';
import {
  fetchActualWorkload,
  fetchInvoiceStateBeforeByInvoiceId,
} from '@/app/lib/data';

export type StateInvoice = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
    complexity?: string[];
  };
  message?: string | null;
};
export type StateCustomer = {
  errors?: {
    name?: string[];
    email?: string[];
  };
  message?: string | null;
};

const FormSchemaInvoice = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  complexity: z.coerce
    .number()
    .gt(0, { message: 'Please enter an complexity greater than 0.' })
    .lt(11, { message: 'Please enter an complexity less than 11' }),
  date: z.string(),
});

const FormSchemaCustomer = z.object({
  id: z.string(),
  name: z.string().min(1, 'Please enter customer name.'),
  email: z
    .string()
    .min(1, { message: 'This field has to be filled.' })
    .email('This is not a valid email.'),
});

const CreateInvoice = FormSchemaInvoice.omit({ id: true, date: true });

const CreateCustomer = FormSchemaCustomer.omit({ id: true });

export async function createCustomer(
  prevState: StateCustomer,
  formData: FormData,
) {
  const validatedFields = CreateCustomer.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  });
  // console.log(validatedFields);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Customer.',
    };
  }
  const { name, email } = validatedFields.data;

  const randomIndex = Math.floor(Math.random() * imageUrls.length);
  const imageUrl = imageUrls[randomIndex];

  try {
    await sql`
    INSERT INTO customers (name, email, image_url)
    VALUES (${name}, ${email}, ${imageUrl})
  `;
  } catch (error) {
    console.log(error);
    return {
      message: 'Database Error: Failed to Create Customer.',
    };
  }
  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

export async function createInvoice(
  prevState: StateInvoice,
  formData: FormData,
) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
    complexity: formData.get('complexity'),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
  const { customerId, amount, status, complexity } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  try {
    const workload = await fetchActualWorkload(customerId);
    if (workload + complexity >= 21 && status == 'pending') {
      throw Error('Reduce complexity, worker is not omnipotent');
    }
  } catch (e: any) {
    return { message: e.message };
  }

  try {
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date, complexity)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date}, ${complexity})
  `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

const UpdateCustomer = FormSchemaCustomer.omit({ id: true });

export async function updateCustomer(
  id: string,
  prevState: StateCustomer,
  formData: FormData,
) {
  const validatedFields = UpdateCustomer.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }
  const { name, email } = validatedFields.data;

  try {
    await sql`
      UPDATE customers
      SET name = ${name}, email = ${email}
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Customer.' };
  }

  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

const UpdateInvoice = FormSchemaInvoice.omit({ id: true, date: true });

export async function updateInvoice(
  id: string,
  prevState: StateInvoice,
  formData: FormData,
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
    complexity: formData.get('complexity'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customerId, amount, status, complexity } = validatedFields.data;
  const amountInCents = amount * 100;
  try {
    let workload = await fetchActualWorkload(customerId);
    const invoiceStateBefore = await fetchInvoiceStateBeforeByInvoiceId(id);

    if (customerId === invoiceStateBefore.customer_id) {
      if (status === invoiceStateBefore.status) {
        workload = workload - invoiceStateBefore.complexity;
      }
      if (workload + complexity >= 21 && status === 'pending') {
        throw Error('Reduce complexity, worker is not omnipotent');
      }
    } else {
      if (workload + complexity >= 21 && status === 'pending') {
        throw Error('Reduce complexity, worker is not omnipotent');
      }
    }
  } catch (e: any) {
    return { message: e.message };
  }
  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}, complexity = ${complexity}
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}

export async function deleteCustomer(id: string) {
  try {
    await sql`DELETE FROM customers WHERE id = ${id}`;
    revalidatePath('/dashboard/customers');
    return { message: 'Deleted Customer.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Customer.' };
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}
