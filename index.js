import makeWASocket, { DisconnectReason } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
const makeWAsocket = require("@adiwajshing/baileys").default;
const {
  DisconnectReason,
  useMultiFileAuthState,
} = require("@adiwajshing/baileys");

const store = {};
const getMessage = (key) => {
  const { id } = key;
  if (store[id]) {
    return store[id].message;
  }
};

async function chronosBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");
  const socket = makeWAsocket({
    version: [2, 2323, 4],
    printQRInTerminal: true,
    auth: state,
    getMessage,
  });

  socket.ev.process(async (events) => {
    if (events["connection.update"]) {
      const { connection, lastDisconnect } = events["connection.update"];
      if (connection === "close") {
        if (
          lastDisconnect?.error?.output?.StatusCode !=
          DisconnectReason.loggedOut
        ) {
          chronosBot();
        } else {
          console.log("Disconnected becuase user has logged out");
        }
      }
    }
    if (events["creds.update"]) {
      await saveCreds();
    }
    if (events["messages.upsert"]) {
      const { messages } = events["messages.upsert"];
      messages.forEach((message) => {
        console.log(message);
      });
    }
  });
}

chronosBot();
