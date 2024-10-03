import { Schema, model, models } from "mongoose";

const SaleSchema = new Schema (
    {   
        // Venda com reserva, irá pegar essas informações do próprio objeto de reserva
        reservation: {
            type: Schema.Types.ObjectId,
            ref: 'Reservation', 
        },
        // Recebe vendedor responsável
        seller: {
            type: Schema.Types.ObjectId, // Referência ao modelo Seller
            ref: 'Seller', // Relaciona com o Seller
            required: true
        }
    },
    {
        // Registra data de criação e atualização para gerenciamento
        timestamps: true
    }
);

// Exportando o modelo do usuário
const Sale = models.Sale || model('Sale', SaleSchema);
export default Sale;