import pool from "../Database/pg.js";

const translateKeys = (order) => {
    return {
        id: order.id_order,
        createdAt: order.date,
        tableNumber: order.table_number,
        observations: order.observation,
        status: order.status,
        items: order.items
    };
};

const Order = {
    getAll: async (query) => {
        try {

            let queryString = `
                SELECT 
                    tb_orders.id_order,
                    tb_orders.date,
                    tb_orders.observation,
                    tb_orders.table_number,
                    CASE 
                        WHEN tb_orders.id_payment IS NULL THEN 'A'
                        ELSE 'P'
                    END AS status,
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'orderItemId', rl_order_item.id_order_item,
                                'itemId', tb_items.id_item,
                                'name', tb_items.name,
                                'quantity', rl_order_item.item_quantity,
                                'observation', rl_order_item.observation,
                                'price', rl_order_item.item_quantity * tb_items.price
                            )
                        ) FILTER (WHERE tb_items.id_item IS NOT NULL), 
                        '[]'::json
                    ) AS items
                FROM tb_orders
                LEFT JOIN rl_order_item ON rl_order_item.id_order = tb_orders.id_order
                LEFT JOIN tb_items ON tb_items.id_item = rl_order_item.id_item
            `


            if (query) {
                queryString += ` WHERE tb_orders.table_number = $1 
                GROUP BY tb_orders.id_order
                `
            } else {
                queryString += ` GROUP BY tb_orders.id_order`
            }

            const values = query ? [query] : [];

            const result = await pool.query(queryString, values)

            return result.rows.map(translateKeys);
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    },

    getById: async (id) => {
        try {
            const result = await pool.query(`
                SELECT 
                    tb_orders.id_order,
                    tb_orders.date,
                    tb_orders.observation,
                    tb_orders.table_number,
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'orderItemId', rl_order_item.id_order_item,
                                'itemId', tb_items.id_item,
                                'name', tb_items.name,
                                'quantity', rl_order_item.item_quantity,
                                'observation', rl_order_item.observation,
                                'price', rl_order_item.item_quantity * tb_items.price
                            )
                        ) FILTER (WHERE tb_items.id_item IS NOT NULL), 
                        '[]'::json
                    ) AS items
                FROM tb_orders
                LEFT JOIN rl_order_item ON rl_order_item.id_order = tb_orders.id_order
                LEFT JOIN tb_items ON tb_items.id_item = rl_order_item.id_item
                WHERE tb_orders.id_order = $1
                GROUP BY tb_orders.id_order
                `, [id]);
            if (result.rows.length === 0) return false;

            return translateKeys(result.rows[0]);
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    },

    getByTableNumber: async (tableNumber) => {
        try {
            const result = await pool.query(`
                SELECT 
                    tb_orders.id_order,
                    tb_orders.date,
                    tb_orders.observation,
                    tb_orders.table_number,
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'orderItemId', rl_order_item.id_order_item,
                                'itemId', tb_items.id_item,
                                'name', tb_items.name,
                                'quantity', rl_order_item.item_quantity,
                                'observation', rl_order_item.observation,
                                'price', rl_order_item.item_quantity * tb_items.price
                            )
                        ) FILTER (WHERE tb_items.id_item IS NOT NULL), 
                        '[]'::json
                    ) AS items
                FROM tb_orders
                LEFT JOIN rl_order_item ON rl_order_item.id_order = tb_orders.id_order
                LEFT JOIN tb_items ON tb_items.id_item = rl_order_item.id_item
                WHERE tb_orders.table_number = $1 AND tb_orders.id_payment is NULL
                GROUP BY tb_orders.id_order
                `, [tableNumber]);
            if (result.rows.length === 0) return false;

            return translateKeys(result.rows[0]);
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    },

    create: async (orderData) => {
        const { observations, tableNumber } = orderData;

        try {
            const result = await pool.query(
                'INSERT INTO tb_orders (observation, table_number, date) VALUES ($1, $2, NOW()) RETURNING *',
                [observations, tableNumber]
            );
            return translateKeys(result.rows[0]);
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    },

    update: async (id, orderData) => {
        const { observations, tableNumber } = orderData;

        try {
            const result = await pool.query(
                `UPDATE tb_orders SET 
                    observation = COALESCE($1, observation), 
                    table_number = COALESCE($2, table_number) 
                WHERE id_order = $3 RETURNING *`,
                [observations, tableNumber, id]
            );
            if (result.rows.length === 0) return false;

            return translateKeys(result.rows[0]);
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    },

    delete: async (id) => {
        try {
            const result = await pool.query('DELETE FROM tb_orders WHERE id_order = $1 RETURNING *', [id]);
            if (result.rows.length === 0) return false;
            return translateKeys(result.rows[0]);
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    },

    addItem: async (orderId, orderItem) => {
        const { itemCode, quantity, observation } = orderItem;

        try {
            const result = await pool.query(
                `INSERT INTO rl_order_item (id_order, id_item, item_quantity, observation)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [orderId, itemCode, quantity, observation]
            );

            if (result.rows.length === 0) return false;

            const addedItem = await pool.query(
                `SELECT 
                    rl_order_item.id_item AS itemId, 
                    name, 
                    item_quantity * price AS price,
                    item_quantity AS quantity, 
                    observation
                 FROM rl_order_item
                 INNER JOIN tb_items on tb_items.id_item = rl_order_item.id_item
                 WHERE rl_order_item.id_order_item = $1`,
                [result.rows[0]['id_order_item']]
            );

            if (addedItem.rows.length === 0) return false;

            return addedItem.rows[0];
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    },

    deleteItem: async (orderItemId) => {

        try {
            const result = await pool.query(
                `DELETE FROM rl_order_item WHERE id_order_item = $1
                 RETURNING *`,
                [orderItemId]
            )
            if (result.rows.length === 0) return false;
            return result.rows[0];
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    },

    updateItem: async (orderItemId, orderItem) => {
        const { itemCode, quantity, observation } = orderItem;

        try {
            const result = await pool.query(
                `UPDATE rl_order_item set id_item = $1, item_quantity = $2, observation = $3
                 WHERE id_order_item = $4
                 RETURNING *`,
                [itemCode, quantity, observation, orderItemId]
            );

            if (result.rows.length === 0) return false;

            const updatedItem = await pool.query(
                `SELECT 
                    rl_order_item.id_item AS itemId, 
                    name, 
                    item_quantity * price AS price,
                    item_quantity AS quantity, 
                    observation
                 FROM rl_order_item
                 INNER JOIN tb_items on tb_items.id_item = rl_order_item.id_item
                 WHERE rl_order_item.id_order_item = $1`,
                [orderItemId]
            );

            if (updatedItem.rows.length === 0) return false;

            return updatedItem.rows[0];
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    },
};

export default Order;
