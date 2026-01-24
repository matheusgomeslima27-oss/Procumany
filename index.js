import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post("/webhook", async (req, res) => {
  try {
    console.log("CHEGOU UM POST NO /webhook");

    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    const commentText = value?.text;
    const userId = value?.from?.id;

    if (!commentText || !userId) {
      return res.sendStatus(200);
    }

    console.log("Comentário:", commentText);

    if (commentText.toLowerCase().includes("eu quero")) {
      const messageData = {
        recipient: {
          id: userId
        },
        message: {
          attachment: {
            type: "template",
            payload: {
              template_type: "button",
              text: "Olá, ficamos felizes com seu comentário! Clique no botão abaixo para acessar os produtinhos 😉",
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
      };

      await fetch(
        `https://graph.facebook.com/v18.0/me/messages?access_token=${process.env.IG_TOKEN}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(messageData)
        }
      );

      console.log("DM enviada!");
    }

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(200);
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
