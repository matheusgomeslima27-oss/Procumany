const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Token que você vai colocar no Meta depois
const VERIFY_TOKEN = "meubotinsta123";

// Rota do webhook (é essa que você coloca no Meta)
app.get("/webhook", (req, res) => {
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

// Para a Render saber que seu servidor está vivo
app.get("/", (req, res) => {
  res.send("Bot do Instagram está rodando!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
