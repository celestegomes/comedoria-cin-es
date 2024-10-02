import { NextResponse } from 'next/server';
import connect from '@/lib/db';
import Inventory from '@/lib/modals/inventory';

// Listar todos os produtos ou pegar informações de produto específico
export const GET = async (request: Request) => {
    try {
      await connect();
  
      // Extrair parâmetros da query string
      const url = new URL(request.url);
      const productName = url.searchParams.get('product_name'); // Obter o nome do produto
      const flavor = url.searchParams.get('flavor'); // Obter o sabor do produto
  
      // Se o nome do produto estiver presente nos parâmetros, buscar o produto específico
      if (productName) {
        const product = await Inventory.findOne({ product_name: productName });
        if (!product) {
          return new NextResponse('Product not found', { status: 404 });
        }
        return new NextResponse(JSON.stringify(product), { status: 200 });
      }
  
      // Se o sabor estiver presente nos parâmetros, buscar produtos com o sabor especificado
      if (flavor) {
        const products = await Inventory.find({ flavor: flavor });
        if (products.length === 0) {
          return new NextResponse('No products found with the specified flavor', { status: 404 });
        }
        return new NextResponse(JSON.stringify(products), { status: 200 });
      }
  
      // Se nenhum parâmetro for passado, listar todos os produtos
      const products = await Inventory.find();
      return new NextResponse(JSON.stringify(products), { status: 200 });
  
    } catch (error: any) {
      return new NextResponse(error.message, { status: 500 });
    }
};

// POST: Adicionar um novo produto
export const POST = async (request: Request) => {
  const { product_name, stock, price, flavor } = await request.json();

  // Validação dos campos obrigatórios
  if (!product_name || stock === undefined || !price || !flavor) {
    return new NextResponse('All fields (product_name, stock, price, flavor) are required', { status: 400 });
  }

  try {
    await connect();
    const newProduct = new Inventory({ product_name, stock, price, flavor });
    await newProduct.save();
    return new NextResponse(JSON.stringify(newProduct), { status: 201 });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
};

// PUT: Atualizar produto pelo nome
export const PUT = async (request: Request) => {
  try {
    await connect();
    const url = new URL(request.url);
    const productName = url.searchParams.get('product_name'); // Obter o nome do produto da query string

    const updates = await request.json(); // Dados de atualização fornecidos no corpo da requisição

    // Remove campos vazios ou indefinidos do objeto de atualização
    Object.keys(updates).forEach(key => {
      if (!updates[key] && updates[key] !== 0) {
        delete updates[key];
      }
    });

    // Erro se não há campos para atualizar
    if (Object.keys(updates).length === 0) {
      return new NextResponse('No fields to update', { status: 400 });
    }

    const updatedProduct = await Inventory.findOneAndUpdate(
      { product_name: productName },
      { $set: updates },
      { new: true }
    );

    if (!updatedProduct) {
      return new NextResponse('Product not found', { status: 404 });
    }

    return new NextResponse(JSON.stringify(updatedProduct), { status: 200 });
    
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
};

// DELETE: Deletar produto pelo nome
export const DELETE = async (request: Request) => {
  try {
    await connect();
    const url = new URL(request.url);
    const productName = url.searchParams.get('product_name'); // Obter o nome do produto da query string

    const deletedProduct = await Inventory.findOneAndDelete({ product_name: productName });

    if (!deletedProduct) {
      return new NextResponse('Product not found', { status: 404 });
    }

    return new NextResponse('Product deleted successfully', { status: 200 });
    
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
};