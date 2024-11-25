import User from "../models/userModel.js";

export const validateLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userAuth = await User.getByEmail(email);
        if (!userAuth) return res.status(404).json({ message: 'Email não encontrado!' });

        if (userAuth.password !== password) return res.status(404).json({ message: 'Email ou senha incorreto(s)!' });

        return res.status(200).json({ message: 'Seja Bem Vindo ao SysLunch!' });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao fazer login!' });
    }
};