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

// Função que envia a DM com botão
function enviarMensagem(userId) {
  const data = JSON.stringify({
    recipient: { id: userId },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Ficamos felizes por ter interesse em nossos produtos, clique no botão abaixo para acessar nossos produtos 😉",
          buttons: [
            {
              type: "web_url",
              url: "https://collshp.com/procuro.achou_13?view=storefront",
              title: "Clique aqui para acessar!"
            }
          ]
        }
      }
    }
  });

  const options = {
    hostname: "graph.facebook.com",
    path: `/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length
    }
  };

  const req = https.request(options, (res) => {
    res.on("data", (d) => {
      process.stdout.write(d);
    });
  });

  req.on("error", (error) => {
    console.error(error);
  });

  req.write(data);
  req.end();
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

