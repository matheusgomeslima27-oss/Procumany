const express = require("express");
const app = express();

console.log("SERVIDOR SUBIU COM CÓDIGO NOVO");

// isso é obrigatório para o Instagram mandar dados no body
app.use(express.json());

// rota principal
app.get("/", (req, res) => {
  res.send("Bot do Instagram está rodando!");
});

// verificação do webhook (GET)
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verificado com sucesso!");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// recebimento dos eventos (POST)
app.post("/webhook", (req, res) => {
  console.log("CHEGOU UM POST NO /webhook");
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
