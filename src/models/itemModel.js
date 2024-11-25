import pool from "../Database/pg.js";
import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const translateKeys = (item) => {
    return {
        id: item.id_item,
        name: item.name,
        description: item.description,
        price: item.price,
        active: item.active
    };
};

const Item = {
    getAll: async () => {
        try {
            const result = await pool.query(`
              SELECT id_item, name, description, price, active, image
              FROM tb_items
            `);

            return result.rows.map(item => {
                let imageBase64 = null;

                if (item.image) {
                    try {
                        const imagePath = path.resolve(item.image)
                        if (fs.existsSync(imagePath)) {
                            const imageBuffer = fs.readFileSync(imagePath);
                            imageBase64 = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
                        } else {
                            console.error(`Imagem não encontrada: ${imagePath}`);
                        }
                    } catch (error) {
                        console.error(`Erro ao ler a imagem: ${error.message}`);
                    }
                }

                return {
                    ...item,
                    image: imageBase64,
                };
            });
        } catch (error) {
            console.error(`Erro ao buscar itens: ${error.message}`);
            throw new Error(`${error.message}`);
        }
    },

    getById: async (id) => {
        try {
            const result = await pool.query(
                'SELECT * FROM tb_items WHERE id_item = $1',
                [id]
            );
            if (result.rows.length === 0) return false;

            return translateKeys(result.rows[0]);
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    },

    create: async (itemData) => {
        const { name, description, price, active, image } = itemData;

        try {
            const result = await pool.query(
                'INSERT INTO tb_items (name, description, price, active, image) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [name, description, price, active, image]
            );
            return translateKeys(result.rows[0]);
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    },

    update: async (id, itemData) => {
        const { name, description, price, active } = itemData;
        try {
            const result = await pool.query(
                'UPDATE tb_items SET name = $1, description = $2, price = $3, active = $4 WHERE id_item = $5 RETURNING *',
                [name, description, price, active, id]
            );

            if (result.rows.length === 0) return false;

            return translateKeys(result.rows[0]);
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    },


    delete: async (id) => {
        try {
            const result = await pool.query('DELETE FROM tb_items WHERE id_item = $1 RETURNING *', [id]);
            if (result.rows.length === 0) return false;

            return translateKeys(result.rows[0]);
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }
};

export default Item;
