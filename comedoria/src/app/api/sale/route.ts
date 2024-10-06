import { NextResponse } from 'next/server';
import connect from '@/lib/db';
import Sale from '@/lib/modals/sale';

export const GET = async (request: Request) => {
  try {
    await connect();

    const url = new URL(request.url);
    const sellerId = url.searchParams.get('seller_id');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const paymentType = url.searchParams.get('payment');
    const reservationId = url.searchParams.get('reservation_id');

    if (sellerId || startDate || endDate || paymentType || reservationId) {
      let query = {};

      if (sellerId) {
        query = { ...query, seller: sellerId };
      }

      if (startDate && endDate) {
        query = {
          ...query,
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        };
      }

      if (paymentType) {
        query = { ...query, payment: paymentType };
      }

      if (reservationId) {
        query = { ...query, reservation_id: reservationId };
      }

      const sales = await Sale.find(query).populate('seller');
      if (sales.length === 0) {
        return new NextResponse('No sales found', { status: 404 });
      }

      return new NextResponse(JSON.stringify(sales), { status: 200 });
    }

    const sales = await Sale.find();
    return new NextResponse(JSON.stringify(sales), { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse('An unknown error occurred', { status: 500 });
  }
};

export const POST = async (request: Request) => {
  try {
    const { seller, order, reservation_id, discount, payment } = await request.json();

    if (!seller || !order || !payment) {
      return new NextResponse('All fields (seller, order, payment) are required', { status: 400 });
    }

    await connect();

    const newSale = new Sale({
      seller,
      order,
      reservation_id: reservation_id || '',
      discount: discount || false,
      payment,
    });

    await newSale.save();
    return new NextResponse(JSON.stringify(newSale), { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse('An unknown error occurred', { status: 500 });
  }
};
