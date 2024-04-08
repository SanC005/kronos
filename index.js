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
    version: [2,2323,4],
    printQRInTerminal: true,
    auth: state,
    getMessage,
  });
}

chronosBot();
