const express = require("express");
const cors = require("cors");
const db = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // Importa o JWT
require("dotenv").config();
const morgan = require("morgan");
const app = express();
const port = process.env.PORT || 3000;
const { enviarEmailReset } = require("./mailer");

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Utilitário simples para gerar senha aleatória
function gerarSenhaAleatoria(tamanho = 12) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
  let senha = "";
  for (let i = 0; i < tamanho; i++) {
    senha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return senha;
}

// await enviarEmailReset(email, usuario.nome, novaSenha);

// Stub de envio de e-mail (substitua por nodemailer/serviço real)
// async function enviarEmailReset(destinatario, novaSenha) {
//   console.log(
//     `[RESET SENHA] Enviar para ${destinatario} a nova senha: ${novaSenha}`
//   );
//   // Aqui você pode integrar nodemailer ou outro serviço de e-mail.
// }

// Rota de Teste
app.get("/", (req, res) => {
  res.send("API do Sonhário está online! 🚀");
});

// Rota para listar usuários
app.get("/usuarios", async (req, res) => {
  try {
    const result = await db.query("SELECT id, nome, email FROM usuarios");
    res.json(result.rows);
  } catch (err) {
    console.error("DETALHE DO ERRO:", err.message);
    res
      .status(500)
      .json({ error: "Erro ao buscar usuários", detail: err.message });
  }
});

// Rota para Cadastrar Novo Usuário
app.post("/usuarios/registrar", async (req, res) => {
  const { nome, email, senha } = req.body;
  const saltRounds = 10;

  try {
    const hashSenha = await bcrypt.hash(senha, saltRounds);
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

// Rota de Login
app.post("/usuarios/login", async (req, res) => {
  const { email, senha } = req.body;

  try {
    // 1. Busca o usuário pelo email
    const userQuery = "SELECT * FROM usuarios WHERE email = $1";
    const result = await db.query(userQuery, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }
    const usuario = result.rows[0];

    // 2. Compara a senha enviada com a senha hash no banco
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    // 3. Gera o Token JWT
    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome },
      process.env.JWT_SECRET, // Chave secreta do .env
      { expiresIn: "1h" } // Token expira em 1 hora
    );

    // Remove a senha do objeto de usuário antes de enviar
    delete usuario.senha;

    res.json({ message: "Login bem-sucedido!", token, usuario });
  } catch (err) {
    console.error("Erro no login:", err.message);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// Rota de Esqueci Minha Senha
app.post("/usuarios/esqueci-senha", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "E-mail é obrigatório." });
  }

  try {
    const userQuery = "SELECT * FROM usuarios WHERE email = $1";
    const result = await db.query(userQuery, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "E-mail não cadastrado." });
    }

    const usuario = result.rows[0];
    const novaSenha = gerarSenhaAleatoria(12);
    const hashSenha = await bcrypt.hash(novaSenha, 10);

    const updateQuery = "UPDATE usuarios SET senha = $1 WHERE id = $2";
    await db.query(updateQuery, [hashSenha, usuario.id]);

    await enviarEmailReset(email, usuario.nome, novaSenha);

    res.json({
      message: "Uma nova senha foi gerada e enviada para seu e-mail.",
    });
  } catch (err) {
    console.error("Erro no reset de senha:", err.message);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// Rotas
const registrosRoutes = require("./routes/registros");
app.use("/registros", registrosRoutes);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
