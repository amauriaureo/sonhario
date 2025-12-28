const express = require("express");
const cors = require("cors");
const db = require("./db");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // Permite que a API entenda JSON

// Rota de Teste
app.get("/", (req, res) => {
  res.send("API do Sonhário está online! 🚀");
});

// Rota para listar usuários (aqueles que você criou no DBeaver)
app.get("/usuarios", async (req, res) => {
  try {
    const result = await db.query("SELECT id, nome, email FROM usuarios");
    res.json(result.rows);
  } catch (err) {
    // ESTA LINHA É A MAIS IMPORTANTE AGORA:
    console.error("DETALHE DO ERRO:", err.message);
    res
      .status(500)
      .json({ error: "Erro ao buscar usuários", detail: err.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
