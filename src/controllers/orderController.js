import Order from "../models/orderModel.js";

export const getAllOrders = async (req, res) => {

  const query = req.query.q

  try {
    const orders = await Order.getAll(query);
    if (!orders.length) return res.status(404).json({ message: 'Sem resultado para pedidos!' });
    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar pedidos!' });
  }
}

export const getOrderById = async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ message: "ID do pedido é obrigatório!" });

  try {
    const order = await Order.getById(id);
    if (!order) return res.status(404).json({ message: "Pedido não encontrado!" });
    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar pedido!' });
  }
};

export const getOrderByTableNumber = async (req, res) => {
  const { tableNumber } = req.params;

  if (!tableNumber) return res.status(400).json({ message: "Número da mesa do pedido é obrigatório!" });

  try {
    const order = await Order.getByTableNumber(tableNumber);
    if (!order) return res.status(404).json({ message: "Pedido não encontrado!" });
    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar pedido!' });
  }
};

export const createOrder = async (req, res) => {
  const { observations, tableNumber } = req.body;

  if (!tableNumber) {
    return res.status(400).json({ message: "Preencha todos os campos obrigatórios!" });
  }

  try {
    const newOrder = await Order.create({ observations, tableNumber });
    return res.status(201).json({ message: 'Pedido cadastrado com sucesso!', order: newOrder });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao criar pedido!' + error });
  }
};

export const updateOrder = async (req, res) => {
  const { id } = req.params;
  const { observations, tableNumber } = req.body;

  if (!id) return res.status(400).json({ message: "ID do pedido é obrigatório." });

  if (!tableNumber) {
    return res.status(400).json({ message: "Preencha todos os campos obrigatórios!" });
  }

  try {
    const updatedOrder = await Order.update(id, { observations, tableNumber });
    if (!updatedOrder) return res.status(404).json({ message: 'Pedido não encontrado!' });
    return res.status(200).json({ message: 'Pedido atualizado com sucesso!', order: updatedOrder });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao atualizar pedido!' + error });
  }
};

export const deleteOrder = async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ message: "ID do pedido é obrigatório." });

  try {
    const deletedOrder = await Order.delete(id);
    if (!deletedOrder) return res.status(404).json({ message: 'Pedido não encontrado!' });
    return res.status(200).json({ message: 'Pedido deletado com sucesso!' });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao deletar pedido!' });
  }
};

export const addItem = async (req, res) => {
  const { id } = req.params;
  const { itemCode, quantity, observation } = req.body;

  if (!itemCode || !quantity) {
    return res.status(400).json({ message: "Preencha todos os campos obrigatórios!" });
  }

  try {
    const insertedItem = await Order.addItem(id, { itemCode, quantity, observation });
    return res.status(201).json({ message: 'Item adicionado com sucesso!', orderItem: insertedItem });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao inserir item!' + error });
  }
};

export const updateItem = async (req, res) => {
  const { orderItemId } = req.params;
  const { itemCode, quantity, observation } = req.body;

  if (!itemCode || !quantity) {
    return res.status(400).json({ message: "Preencha todos os campos obrigatórios!" });
  }

  try {
    const updatedItem = await Order.updateItem(orderItemId, { itemCode, quantity, observation });
    return res.status(201).json({ message: 'Item atualizado com sucesso!', orderItem: updatedItem });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao atualizar item!' + error });
  }
};

export const deleteItem = async (req, res) => {
  const { orderItemId } = req.params;

  if (!orderItemId) return res.status(400).json({ message: "ID do item no pedido é obrigatório." });

  try {
    const deletedOrderItem = await Order.deleteItem(orderItemId);
    if (!deletedOrderItem) return res.status(404).json({ message: 'Item não encontrado no pedido!' });
    return res.status(200).json({ message: 'Item deletado do pedido com sucesso!' });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao deletar item do pedido!' + error });
  }
};