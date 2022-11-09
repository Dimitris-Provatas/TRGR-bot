import { Client, GatewayIntentBits } from "discord.js";

import Modules from "./modules";
import ActivityLogger from "./modules/ActivityLogger";

require("dotenv").config();
const TOKEN = process.env.DISCORD_BOT_TOKEN;

let activityLogger: ActivityLogger;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent,
  ],
});

if (!client || client == null || client == undefined) {
  console.log("Client was null on line 21 in src/bot.ts!");
  process.exit(1);
}

function botReady() {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setPresence({
    status: "online",
    activities: [
      {
        name: "your every move!",
        type: 3,
      }
    ],
  });
  activityLogger = new ActivityLogger(client);
}

client.on("ready", botReady);

client.login(TOKEN);

