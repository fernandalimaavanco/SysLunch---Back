import pool from "../Database/pg.js";

const translateKeys = (user) => {
    return {
        id: user.id,
        email: user.email,
        password: user.password,
        name: user.name,
        status: user.status
    };
};

const User = {
    getAll: async () => {
        try {
            const result = await pool.query(`
                SELECT id, email, name, status
                FROM tb_users
            `);

            return result.rows.map(translateKeys);
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    },

    getById: async (id) => {
        try {
            const result = await pool.query(
                'SELECT id, email, name, status FROM tb_users WHERE id = $1',
                [id]
            );
            if (result.rows.length === 0) return false;

            return translateKeys(result.rows[0]);
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    },

    getByEmail: async (email) => {
        try {
            const result = await pool.query(
                'SELECT * FROM tb_users WHERE email = $1 AND status = true',
                [email]
            );
            if (result.rows.length === 0) return false;

            return translateKeys(result.rows[0]);
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    },

    create: async (userData) => {
        const { name, email, password, status } = userData;
        try {
            const result = await pool.query(
                'INSERT INTO tb_users (email, password, name, status) VALUES ($1, $2, $3, $4) RETURNING id, email, name, status',
                [email, password, name, status]
            );
            return translateKeys(result.rows[0]);
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    },

    update: async (id, userData) => {
        const { name, email, password, status } = userData;
        try {
            const result = await pool.query(
                'UPDATE tb_users SET email = $1, password = $2, name = $3, status = $4 WHERE id = $5 RETURNING id, email, name, status',
                [email, password, name, status, id]
            );

            if (result.rows.length === 0) return false;

            return translateKeys(result.rows[0]);
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    },


    delete: async (id) => {
        try {
            const result = await pool.query('DELETE FROM tb_users WHERE id = $1 RETURNING id, email, name, status', [id]);
            if (result.rows.length === 0) return false;

            return translateKeys(result.rows[0]);
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }
};

export default User;
