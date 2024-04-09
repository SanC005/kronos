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
  const getText = message => {
    try{
        return message.conversation || message.extendedTextMessage.text
    }catch{
      return "";
    }
  }
  const sendMessage = async (jid, content) => {
    try{
      const sent = await socket.sendMessage(jid,content);
      store[sent.key.id] = sent;
    } catch(err){
      console.error("send message error: ",err)
    }
      
  }
  const talk = async (msg) => {
      const {key,message} = msg;
      const text = getText(message);
      const command = 'echo';
      if(!text.toLowerCase().startsWith(command)){
        return;
      } else{
        console.log("command working...")
        const reply = text.slice(command.length)
        sendMessage(key.remoteJid,{ text:reply });
      }
  }
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
        if(!message.message) return;
        console.log(message);
        talk(message);
      });
    }
  });
}

chronosBot();
