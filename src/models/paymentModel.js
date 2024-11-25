import pool from "../Database/pg.js";

const translateKeys = (payment) => {
    return {
        id: payment.id_payment,
        date: payment.date,
        tableNumber: payment.table_number,
        total: payment.total,
        paidItems: payment.items
    };
};

const Payment = {
    getAll: async (query) => {
        try {
            let queryString = `
                SELECT 
                    tb_payments.id_payment,
                    tb_orders.table_number,
                    tb_payments.date,
                    SUM(rl_order_item.item_quantity * tb_items.price) AS total
                FROM tb_payments
                INNER JOIN tb_orders ON tb_payments.id_order = tb_orders.id_order
                LEFT JOIN rl_order_item ON tb_orders.id_order = rl_order_item.id_order
                LEFT JOIN tb_items ON rl_order_item.id_item = tb_items.id_item
            `;


            if (query) {
                queryString += ` WHERE tb_orders.table_number = $1 
                GROUP BY tb_payments.id_payment, tb_orders.table_number, tb_payments.date
                `
            } else {
                queryString += ` GROUP BY tb_payments.id_payment, tb_orders.table_number, tb_payments.date`
            }

            const values = query ? [query] : [];

            const result = await pool.query(queryString, values);
            return result.rows.map(translateKeys);
        } catch (error) {
            throw new Error(error.message);
        }
    },

    getById: async (id) => {
        try {
            const result = await pool.query(`
                SELECT 
                    tb_payments.id_payment,
                    tb_orders.table_number,
                    tb_payments.date,
                    SUM(rl_order_item.item_quantity * tb_items.price) AS total,
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'orderItemId', rl_order_item.id_order_item,
                                'itemId', tb_items.id_item,
                                'name', tb_items.name,
                                'quantity', rl_order_item.item_quantity,
                                'observation', rl_order_item.observation,
                                'total', rl_order_item.item_quantity * tb_items.price
                            )
                        ) FILTER (WHERE tb_items.id_item IS NOT NULL), 
                        '[]'::json
                    ) AS items
                FROM tb_payments
                INNER JOIN tb_orders ON tb_payments.id_order = tb_orders.id_order
                LEFT JOIN rl_order_item ON tb_orders.id_order = rl_order_item.id_order
                LEFT JOIN tb_items ON rl_order_item.id_item = tb_items.id_item
                WHERE tb_payments.id_payment = $1
                GROUP BY tb_payments.id_payment, tb_orders.table_number, tb_payments.date`,
                [id]
            );
            if (result.rows.length === 0) return false;

            return translateKeys(result.rows[0]);
        } catch (error) {
            throw new Error(error.message);
        }
    },

    create: async (orderId) => {
        try {
            const client = await pool.connect();
            await client.query('BEGIN');

            const result = await client.query(
                'INSERT INTO tb_payments (date, id_order) VALUES (NOW(), $1) RETURNING *',
                [orderId]
            );

            const paymentId = result.rows[0].id_payment;

            await client.query(
                'UPDATE tb_orders SET id_payment = $1 WHERE id_order = $2',
                [paymentId, orderId]
            );

            const paymentDetails = await client.query(`
                SELECT 
                    tb_payments.id_payment,
                    tb_orders.table_number,
                    tb_payments.date,
                    SUM(rl_order_item.item_quantity * tb_items.price) AS total
                FROM tb_payments
                INNER JOIN tb_orders ON tb_payments.id_order = tb_orders.id_order
                LEFT JOIN rl_order_item ON tb_orders.id_order = rl_order_item.id_order
                LEFT JOIN tb_items ON rl_order_item.id_item = tb_items.id_item
                WHERE tb_payments.id_payment = $1
                GROUP BY tb_payments.id_payment, tb_orders.table_number, tb_payments.date
            `, [paymentId]);

            await client.query('COMMIT');
            return paymentDetails.rows.map(translateKeys)
        } catch (error) {
            await client.query('ROLLBACK');
            throw new Error(error.message);
        }
    },

    update: async (id, orderId) => {

        try {

            const client = await pool.connect();

            await client.query('BEGIN');

            const result = await client.query(
                'UPDATE tb_payments SET order_id = $1 WHERE id_payment = $2 RETURNING *',
                [orderId, id]
            );

            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                return false;
            }

            const payment_id = result.rows[0].id_payment;

            await client.query(
                'UPDATE tb_orders SET id_payment = $1 WHERE id_order = $2',
                [payment_id, orderId]
            );

            await client.query('COMMIT');

            return translateKeys(result.rows[0]);
        } catch (error) {
            throw new Error(error.message);
        }
    },

    delete: async (id) => {
        try {

            const client = await pool.connect();

            await client.query('BEGIN');

            const updateResult = await client.query(
                'UPDATE tb_orders SET id_payment = NULL WHERE id_payment = $1 RETURNING *',
                [id]
            );

            if (updateResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return false
            }

            const deleteResult = await client.query(
                'DELETE FROM tb_payments WHERE id_payment = $1 RETURNING *',
                [id]
            );

            if (deleteResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return false;
            }

            await client.query('COMMIT');
            return deleteResult.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw new Error(error.message);
        }
    }
};

export default Payment;
