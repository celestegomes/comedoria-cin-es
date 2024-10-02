import { Schema, model, models } from "mongoose";

const SaleSchema = new Schema (
    {   
        // Caso seja vendida uma reserva, confere reserva a ser vendida, localizando informações de pedido e preço
        reservation: {
            type: Schema.Types.ObjectId,
            ref: 'Reservation', 
        },
        // Recebe vendedor responsável
        seller: {
            type: Schema.Types.ObjectId, // Referência ao modelo Seller
            ref: 'Seller', // Relaciona com o Seller
            required: true
        },
        // Caso seja uma venda sem reserva, irá receber o que foi pedido e calculará o preço total
        // Caso seja uma venda com reserva, irá pegar essas informações do próprio objeto de reserva

        // O pedido pode conter mais de um mesmo salgado ou de salgados diferentes 
        order: [
            {
                product_name: {
                    type: String,
                    required: true
                },
                quantity_products: {
                    type: Number,
                    required: true
                }
            }
        ],
        // Preço calculado a partir dos salados do pedido
        price: {
            type: Number,
            required: true
        },
    },
    {
        // Registra data de criação e atualização para gerenciamento
        timestamps: true
    }
);

// Exportando o modelo do usuário
const Sale = models.Sale || model('Sale', SaleSchema);
export default Sale;