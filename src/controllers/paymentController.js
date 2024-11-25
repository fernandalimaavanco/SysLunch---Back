import Payment from '../models/paymentModel.js';

export const getAllPayments = async (req, res) => {
    const query = req.query.q

    try {
        const payments = await Payment.getAll(query)
        if (!payments.length) return res.status(404).json({ message: 'Sem resultado para pagamentos!' });
        return res.status(200).json(payments);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao buscar pagamentos!' });
    }
}

export const getPaymentById = async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ message: 'ID do pagamento é obrigatório!' });

    try {
        const payment = await Payment.getById(id);
        if (!payment) return res.status(404).json({ message: 'Pagamento não encontrado!' });
        return res.status(200).json(payment);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao buscar pagamento!' });
    }
}

export const createPayment = async (req, res) => {
    const { orderId } = req.body;

    if (!orderId) {
        return res.status(400).json({ message: "Preencha todos os campos obrigatórios!" });
    }

    try {
        const payment = await Payment.create(orderId);
        return res.status(201).json({ message: 'Pagamento cadastrado com sucesso!', payment: payment });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao criar pagamento!' });
    }
};


export const updatePayment = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'ID do pagamento é obrigatório!' });
    }

    const { order_id } = req.body;

    if (!order_id) {
        return res.status(400).json({ message: "Preencha todos os campos obrigatórios!" });
    }

    try {
        const updatedPayment = await Payment.update(id, order_id);
        if (!updatedPayment) return res.status(404).json({ message: 'Pagamento não encontrado para atualização!' });
        return res.status(201).json({ message: 'Pagamento atualizado com sucesso!', payment: updatedPayment });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao atualizar pagamento!' });
    }
};

export const deletePayment = async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ message: 'ID do pagamento é obrigatório!' });

    try {
        const deletedPayment = await Payment.delete(id);
        if (!deletedPayment) return res.status(404).json({ message: 'Pagamento não encontrado para exclusão!' });
        return res.status(200).json({ message: 'Pagamento deletado com sucesso!' });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao deletar pagamento!' });
    }
};
