import User from "../models/userModel.js";

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.getAll();
        if (!users.length) return res.status(404).json({ message: 'Sem resultado para usuários!' });
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao buscar usuários!' });
    }
};

export const getUserById = async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ message: "ID do usuário é obrigatório!" });

    try {
        const user = await User.getById(id);
        if (!user) return res.status(404).json({ message: "Usuário não encontrado!" });
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao buscar usuário!' });
    }
};

export const createUser = async (req, res) => {
    const { name, password, email, status } = req.body;

    if (!name || !password || !email) {
        return res.status(400).json({ message: "Preencha todos os campos obrigatórios!" });
    }

    try {
        const newUser = await User.create({ name, password, email, status });
        return res.status(201).json({ message: 'Usuário cadastrado com sucesso!', user: newUser });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao criar usuário!' + error });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, password, status } = req.body;

    if (!id) return res.status(400).json({ message: "ID do usuário é obrigatório." });

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Preencha todos os campos obrigatórios!" });
    }

    try {
        const updatedUser = await User.update(id, { name, email, password, status });
        if (!updatedUser) return res.status(404).json({ message: 'Usuário não encontrado!' });
        return res.status(200).json({ message: 'Usuário atualizado com sucesso!', user: updatedUser });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao atualizar usuário!' + error });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ message: "ID do usuário é obrigatório." });

    try {
        const deletedUser = await User.delete(id);
        if (!deletedUser) return res.status(404).json({ message: 'Usuário não encontrado!' });
        return res.status(200).json({ message: 'Usuário deletado com sucesso!' });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao deletar usuário!' });
    }
};