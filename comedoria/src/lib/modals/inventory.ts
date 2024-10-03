import { Schema, model, models } from "mongoose";

const InventorySchema = new Schema (
    {
        product_name: {
            type: String, 
            required: true, 
            unique: true
        },
        stock: {
            type: Number,
            required: true,
            default: 0
        },
        price: {
            type: Number,
            required: true
        }
    },
    {
        // Registra data de criação e atualização para gerenciamento
        timestamps: true
    }
);

// Exportando o modelo do usuário
const Inventory = models.Inventory || model('Inventory', InventorySchema);
export default Inventory;