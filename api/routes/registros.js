const express = require("express");
const router = express.Router();
const db = require("../db");
const verificarToken = require("../middleware/verificarToken");

// Middleware aplicado a todas as rotas deste arquivo
router.use(verificarToken);

// Rota para CRIAR um novo registro
router.post("/", async (req, res) => {
  const { registro } = req.body;
  const id_usuario = req.usuario.id;

  if (!registro) {
    return res.status(400).json({ error: "O campo registro é obrigatório." });
  }

  try {
    const query =
      "INSERT INTO registros (id_usuario, registro) VALUES ($1, $2) RETURNING *";
    const result = await db.query(query, [id_usuario, registro]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao criar registro:", err.message);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// Rota para BUSCAR todos os registros do usuário
router.get("/", async (req, res) => {
  const id_usuario = req.usuario.id;

  try {
    const query =
      "SELECT * FROM registros WHERE id_usuario = $1 ORDER BY criado_em DESC";
    const result = await db.query(query, [id_usuario]);
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar registros:", err.message);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// Rota para ATUALIZAR um registro
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { registro } = req.body;
  const id_usuario = req.usuario.id;

  if (!registro) {
    return res.status(400).json({ error: "O campo registro é obrigatório." });
  }

  try {
    // Primeiro, verifica se o registro pertence ao usuário logado para segurança
    const checkQuery =
      "SELECT * FROM registros WHERE id = $1 AND id_usuario = $2";
    const checkResult = await db.query(checkQuery, [id, id_usuario]);

    if (checkResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Registro não encontrado ou não pertence ao usuário." });
    }

    const updateQuery = `
      UPDATE registros 
      SET 
        registro = $1, 
        data_alteracao = array_append(data_alteracao, NOW()) 
      WHERE id = $2 
      RETURNING *`;
    const result = await db.query(updateQuery, [registro, id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao atualizar registro:", err.message);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// Rota para DELETAR um registro
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const id_usuario = req.usuario.id;

  try {
    // Garante que o registro pertence ao usuário logado
    const checkQuery =
      "SELECT id FROM registros WHERE id = $1 AND id_usuario = $2";
    const checkResult = await db.query(checkQuery, [id, id_usuario]);

    if (checkResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Registro não encontrado ou não pertence ao usuário." });
    }

    await db.query("DELETE FROM registros WHERE id = $1 AND id_usuario = $2", [
      id,
      id_usuario,
    ]);

    res.json({ message: "Registro deletado com sucesso." });
  } catch (err) {
    console.error("Erro ao deletar registro:", err.message);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

module.exports = router;
