const jwt = require("jsonwebtoken");

function verificarToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Formato "Bearer TOKEN"

  if (token == null) {
    return res.sendStatus(401); // Não autorizado se não houver token
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) {
      return res.sendStatus(403); // Proibido se o token for inválido
    }
    req.usuario = usuario; // Adiciona os dados do usuário (ex: id, nome) ao objeto req
    next();
  });
}

module.exports = verificarToken;
