import multer from 'multer';
import path from 'path';
import Item from "../models/itemModel.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      return cb(new Error('Tipo de arquivo não permitido!'), false);
    }
  },
});


export const getAllItems = async (req, res) => {
  try {
    const items = await Item.getAll();
    if (!items.length) return res.status(404).json({ message: 'Sem resultados para itens!' });
    return res.status(200).json(items);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar itens!' });
  }
};

export const getItemById = async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ message: "ID do item é obrigatório!" });

  try {
    const item = await Item.getById(id);
    if (!item) return res.status(404).json({ message: 'Item não encontrado!' });
    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar item!' });
  }
}

export const createItem = async (req, res) => {

  const { name, description, price, active } = req.body;
  const image = req.file;

  if (!name || !description || price === undefined || active === undefined) {
    return res.status(400).json({ message: 'Preencha todos os campos obrigatórios!' });
  }

  if (!image) {
    return res.status(400).json({ message: 'Imagem é obrigatória!' });
  }

  try {
    const imagePath = image.path;

    const newItem = await Item.create({
      name,
      description,
      price,
      active,
      image: imagePath,
    });

    return res.status(201).json({
      message: 'Item cadastrado com sucesso!',
      item: newItem,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao criar item!' });
  }
}

export const updateItem = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, active } = req.body;

  if (!id) return res.status(400).json({ message: "ID do item é obrigatório!" });

  if (!name || !description || price === undefined || active === undefined) {
    return res.status(400).json({ message: "Preencha todos os campos obrigatórios!" });
  }

  try {
    const updatedItem = await Item.update(id, { name, description, price, active });
    if (!updatedItem) return res.status(404).json({ message: 'Item não encontrado!' });
    return res.status(200).json({ message: 'Item atualizado com sucesso!', item: updatedItem });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao atualizar item!' + error });
  }
}

export const deleteItem = async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ message: "ID do item é obrigatório" });

  try {
    const deletedItem = await Item.delete(id);
    if (!deletedItem) return res.status(404).json({ message: 'Item não encontrado!' });
    return res.status(200).json({ message: 'Item deletado com sucesso!' });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao deletar item!' });
  }
}

export { upload };
