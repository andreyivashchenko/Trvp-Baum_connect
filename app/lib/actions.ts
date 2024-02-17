'use server';

import {
  fetchActualWorkload,
  fetchApplicationStateBeforeByApplicationId,
} from '@/app/lib/data';
import { imageUrls } from '@/app/lib/utils';
import { signIn } from '@/auth';
import { sql } from '@vercel/postgres';
import { AuthError } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export type StateApplication = {
  errors?: {
    masterId?: string[];
    amount?: string[];
    status?: string[];
    complexity?: string[];
  };
  message?: string | null;
};
export type StateMaster = {
  errors?: {
    name?: string[];
    email?: string[];
  };
  message?: string | null;
};

const FormSchemaApplication = z.object({
  id: z.string(),
  masterId: z.string({
    invalid_type_error: 'Please select a master.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an application status.',
  }),
  complexity: z.coerce
    .number()
    .gt(0, { message: 'Please enter an complexity greater than 0.' })
    .lt(11, { message: 'Please enter an complexity less than 11' }),
  date: z.string(),
});

const FormSchemaMaster = z.object({
  id: z.string(),
  name: z.string().min(1, 'Please enter master name.'),
  email: z
    .string()
    .min(1, { message: 'This field has to be filled.' })
    .email('This is not a valid email.'),
});

const CreateApplication = FormSchemaApplication.omit({ id: true, date: true });

const CreateMaster = FormSchemaMaster.omit({ id: true });

export async function createMaster(prevState: StateMaster, formData: FormData) {
  const validatedFields = CreateMaster.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Master.',
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
      message: 'Database Error: Failed to Create Master.',
    };
  }
  revalidatePath('/dashboard/masters');
  redirect('/dashboard/masters');
}

export async function createApplication(
  prevState: StateApplication,
  formData: FormData,
) {
  const validatedFields = CreateApplication.safeParse({
    masterId: formData.get('masterId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
    complexity: formData.get('complexity'),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Application.',
    };
  }
  const { masterId, amount, status, complexity } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  try {
    const workload = await fetchActualWorkload(masterId);
    if (workload + complexity >= 21 && status == 'pending') {
      throw Error('Reduce complexity, master is not omnipotent');
    }
  } catch (e: any) {
    return { message: e.message };
  }

  try {
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date, complexity)
    VALUES (${masterId}, ${amountInCents}, ${status}, ${date}, ${complexity})
  `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Application.',
    };
  }
  revalidatePath('/dashboard/applications');
  redirect('/dashboard/applications');
}

const UpdateMaster = FormSchemaMaster.omit({ id: true });

export async function updateMaster(
  id: string,
  prevState: StateMaster,
  formData: FormData,
) {
  const validatedFields = UpdateMaster.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Application.',
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
    return { message: 'Database Error: Failed to Update Master.' };
  }

  revalidatePath('/dashboard/masters');
  redirect('/dashboard/masters');
}

const UpdateApplication = FormSchemaApplication.omit({ id: true, date: true });

export async function updateApplication(
  id: string,
  prevState: StateApplication,
  formData: FormData,
) {
  const validatedFields = UpdateApplication.safeParse({
    masterId: formData.get('masterId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
    complexity: formData.get('complexity'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Application.',
    };
  }

  const { masterId, amount, status, complexity } = validatedFields.data;
  const amountInCents = amount * 100;
  try {
    let workload = await fetchActualWorkload(masterId);
    const applicationStateBefore =
      await fetchApplicationStateBeforeByApplicationId(id);

    if (masterId === applicationStateBefore.customer_id) {
      if (status === applicationStateBefore.status) {
        workload = workload - applicationStateBefore.complexity;
      }
      if (workload + complexity >= 21 && status === 'pending') {
        throw Error('Reduce complexity, master is not omnipotent');
      }
    } else {
      if (workload + complexity >= 21 && status === 'pending') {
        throw Error('Reduce complexity, master is not omnipotent');
      }
    }
  } catch (e: any) {
    return { message: e.message };
  }
  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${masterId}, amount = ${amountInCents}, status = ${status}, complexity = ${complexity}
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Application.' };
  }

  revalidatePath('/dashboard/applications');
  redirect('/dashboard/applications');
}

export async function deleteApplication(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/applications');
    return { message: 'Deleted Application.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Application.' };
  }
}

export async function deleteMaster(id: string) {
  try {
    await sql`DELETE FROM customers WHERE id = ${id}`;
    revalidatePath('/dashboard/masters');
    return { message: 'Deleted Master.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Master.' };
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
