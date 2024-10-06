import { NextResponse } from 'next/server';
import connect from '@/lib/db';
import Staff from '@/lib/modals/staff';
import { HydratedDocument, ModifyResult } from 'mongoose';

// Define the Staff interface (adjust as needed based on your schema)
interface StaffType {
  email: string;
  password: string;
  username: string;
  phone: string;
  seller?: boolean;
  salary?: number;
  products_sold?: number;
  schedule?: string;
}

// Listar funcionários ou pegar informações de funcionário específico
export const GET = async (request: Request) => {
  try {
    await connect();

    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    const seller = url.searchParams.get('seller');

    // Se email estiver presente nos parâmetros, busque o funcionário específico
    if (email) {
      const staffMember: HydratedDocument<StaffType> | null = await Staff.findOne({ email: email });
      if (!staffMember) {
        return new NextResponse('Staff member not found', { status: 404 });
      }
      return new NextResponse(JSON.stringify(staffMember), { status: 200 });
    } 

    // Se seller estiver presente nos parâmetros, busque por vendedores ou gerentes
    if (seller) {
      const staffMembers: HydratedDocument<StaffType>[] = await Staff.find({ seller: seller });
      if (!staffMembers.length) {
        return new NextResponse('Staff member not found', { status: 404 });
      }
      return new NextResponse(JSON.stringify(staffMembers), { status: 200 });
    }

    const staffMembers: HydratedDocument<StaffType>[] = await Staff.find();
    return new NextResponse(JSON.stringify(staffMembers), { status: 200 });

  } catch (error: unknown) {
    return new NextResponse((error as Error).message, { status: 500 });
  }
};

// Adicionar funcionário
export const POST = async (request: Request) => {
  const { email, password, username, phone, seller, salary, products_sold, schedule }: StaffType = await request.json();

  if (!email || !password || !username || !phone) {
    return new NextResponse('Email, password, username, and phone are required and cannot be empty', { status: 400 });
  }

  try {
    await connect();
    const newStaffMember: HydratedDocument<StaffType> = new Staff({ email, password, username, phone, seller, salary, products_sold, schedule });
    await newStaffMember.save();
    return new NextResponse(JSON.stringify(newStaffMember), { status: 201 });
  } catch (error: unknown) {
    return new NextResponse((error as Error).message, { status: 500 });
  }
};

// Atualizar funcionário
export const PUT = async (request: Request) => {
  const url = new URL(request.url);
  const email = url.searchParams.get('email');
  const updates: Partial<StaffType> = await request.json();

  Object.keys(updates).forEach(key => {
    if (!updates[key as keyof StaffType]) {
      delete updates[key as keyof StaffType];
    }
  });

  if (Object.keys(updates).length === 0) {
    return new NextResponse('No fields to update', { status: 400 });
  }

  try {
    await connect();

    const updatedStaffMember: HydratedDocument<StaffType> | null = await Staff.findOneAndUpdate(
      { email },
      { $set: updates },
      { new: true }
    );

    if (!updatedStaffMember) {
      return new NextResponse('Staff member not found', { status: 404 });
    }

    return new NextResponse(JSON.stringify(updatedStaffMember), { status: 200 });
  } catch (error: unknown) {
    return new NextResponse((error as Error).message, { status: 500 });
  }
};

// Deletar funcionário
export const DELETE = async (request: Request) => {
  const url = new URL(request.url);
  const email = url.searchParams.get('email');

  try {
    await connect();
    const deletedStaffMember: ModifyResult<HydratedDocument<StaffType>> | null = await Staff.findOneAndDelete({ email });

    if (!deletedStaffMember || !deletedStaffMember.value) {
      return new NextResponse('Staff member not found', { status: 404 });
    }

    return new NextResponse('Staff member deleted successfully', { status: 200 });
  } catch (error: unknown) {
    return new NextResponse((error as Error).message, { status: 500 });
  }
};
