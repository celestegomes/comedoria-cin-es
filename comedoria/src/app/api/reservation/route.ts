import { NextResponse } from 'next/server';
import connect from '@/lib/db';
import Reservation from '@/lib/modals/reservation';
import Customer from '@/lib/modals/customer';

// Listar todas as reservas, buscar reservas por status ou por cliente
export const GET = async (request: Request) => {
    try {
      await connect();
  
      const url = new URL(request.url);
      const status = url.searchParams.get('status'); // Buscar status das reservas
      const customerEmail = url.searchParams.get('customer_email'); // Buscar reservas por cliente
  
      // Se o status estiver presente, filtre as reservas com base nele
      if (status) {
        const reservations = await Reservation.find({ status: status }).populate('customer');
        if (reservations.length === 0) {
          return new NextResponse('No reservations found with the specified status', { status: 404 });
        }
        return new NextResponse(JSON.stringify(reservations), { status: 200 });
      }
  
      // Se o email do cliente estiver presente, encontre o cliente e busque as reservas dele
      if (customerEmail) {
        const customer = await Customer.findOne({ email: customerEmail });
        
        // Se o cliente não for encontrado
        if (!customer) {
          return new NextResponse('Customer not found', { status: 404 });
        }
  
        // Buscar reservas associadas ao cliente
        const reservations = await Reservation.find({ customer: customer._id }).populate('customer');
        if (reservations.length === 0) {
          return new NextResponse('No reservations found for the specified customer', { status: 404 });
        }
        return new NextResponse(JSON.stringify(reservations), { status: 200 });
      }
  
      // Caso contrário, retorne todas as reservas
      const reservations = await Reservation.find().populate('customer');
      return new NextResponse(JSON.stringify(reservations), { status: 200 });
    } catch (error: any) {
      return new NextResponse(error.message, { status: 500 });
    }
};
  
// Criar uma nova reserva
export const POST = async (request: Request) => {
    const { customer, order, price, shift } = await request.json();
  
    // Validação simples
    if (!customer || !order || !price || !shift) {
      return new NextResponse('All fields (customer, order, price, shift) are required', { status: 400 });
    }
  
    try {
      await connect();
      const newReservation = new Reservation({
        customer,
        order,
        price,
        shift,
        status: true // status padrão como "ativo"
      });
      await newReservation.save();
      return new NextResponse(JSON.stringify(newReservation), { status: 201 });
    } catch (error: any) {
      return new NextResponse(error.message, { status: 500 });
    }
};
  
// Deletar reserva por ID
export const DELETE = async (request: Request) => {
    try {
      await connect();
  
      const url = new URL(request.url);
      const reservationId = url.searchParams.get('id'); // Obter o ID da reserva da query string
  
      if (!reservationId) {
        return new NextResponse('Reservation ID is required', { status: 400 });
      }
  
      const deletedReservation = await Reservation.findByIdAndDelete(reservationId);
      if (!deletedReservation) {
        return new NextResponse('Reservation not found', { status: 404 });
      }
  
      return new NextResponse('Reservation deleted successfully', { status: 200 });
    } catch (error: any) {
      return new NextResponse(error.message, { status: 500 });
    }
};
  