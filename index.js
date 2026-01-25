import express from "express";
import https from "https";

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// Página principal
app.get("/", (req, res) => {
  res.send("Bot do Instagram está rodando!");
});

// Verificação do webhook
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

// Recebe eventos do Instagram
app.post("/webhook", (req, res) => {
  console.log("🔥 CHEGOU ALGUMA COISA DO INSTAGRAM 🔥");
  console.log(JSON.stringify(req.body, null, 2));

  const entry = req.body.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;

  if (value?.comment_id && value?.text) {
    const comentario = value.text.toLowerCase();
    const userId = value.from.id;

    console.log("Comentário recebido:", comentario);

    if (comentario.includes("eu quero")) {
      enviarMensagem(userId);
    }
  }

  res.sendStatus(200);
});

// Função que envia a DM
function enviarMensagem(userId) {
  const data = JSON.stringify({
    messaging_type: "RESPONSE",
    recipient: {
      id: userId
    },
    message: {
      text:
        "Ficamos felizes por ter interesse em nossos produtos! 😄\n\n" +
        "Clique no link abaixo para acessar nossa loja:\n" +
        "https://collshp.com/procuro.achou_13?view=storefront"
    }
  });

  const options = {
    hostname: "graph.facebook.com",
    path: `/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(data)
    }
  };

  const req = https.request(options, (res) => {
    let body = "";
    res.on("data", (chunk) => {
      body += chunk;
    });
    res.on("end", () => {
      console.log("Resposta da API:", body);
    });
  });

  req.on("error", (error) => {
    console.error("Erro ao enviar DM:", error);
  });

  req.write(data);
  req.end();
}


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});


