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

const bcrypt = require("bcrypt");
const saltRounds = 10; // Nível de complexidade da criptografia

// Rota para Cadastrar Novo Usuário com Senha Criptografada
app.post("/usuarios/registrar", async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    // 1. Gera o Hash da senha (segurança)
    const hashSenha = await bcrypt.hash(senha, saltRounds);

    // 2. Insere no banco com a senha protegida
    const query =
      "INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email";
    const values = [nome, email, hashSenha];

    const result = await db.query(query, values);

    res.status(201).json({
      message: "Usuário criado com sucesso!",
      usuario: result.rows[0],
    });
  } catch (err) {
    console.error("Erro ao registrar:", err.message);
    res.status(500).json({ error: "Erro ao criar conta. Email já existe?" });
  }
});
