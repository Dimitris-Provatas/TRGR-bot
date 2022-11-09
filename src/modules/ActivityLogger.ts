import { MongoClient } from "mongodb";
import { EmbedBuilder } from "discord.js"

import { DatabaseObject } from "types";

import {
  MonitorInterval,
  PointsForOnlinePresence,
  PointsForMessage,
  PointsForVoicePresence,
} from './constants';

require("dotenv").config();

export default class ActivityLogger {
  client: any;
  targetServer: any;
  adminRole: any;

  db: any;
  collection: any;

  constructor(client: any) {
    this.client = client;

    this.init();
  }

  async init() {
    try {
      // General
      const it = this;
      this.targetServer = await this.client.guilds.cache.get(process.env.SERVER_ID.toString());
      this.adminRole = this.targetServer.roles.cache.find(role => role.name === "Administrator");

      // Database Setup
      const mongodb = new MongoClient("mongodb://localhost:27017/trgr");
      await mongodb.connect();

      this.db = mongodb.db("trgr");

      // check collection exists
      const collections = await this.db.listCollections().toArray();

      if (!collections.map(c => c.name).includes("members")) {
        await this.db.createCollection("members");
      }

      this.collection = this.db.collection("members");

      // Event Listeners
      this.client.on("messageCreate", (message) => this.onServerMessage(message));

      // Monitor on Interval
      setInterval(() => it.monitor(), MonitorInterval * 1000);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }

  async printStats(message) {
    if (message.channel.id.toString() !== "1038511123432996884") {
      const reply = message.reply(`Λάθος κανάλι φίλε <@${message.author.id}>. Δοκίμασε το <#1038511123432996884>!`);
      message.delete({timeout: 5000});
      reply.delete({timeout: 5000});
      return;
    }

    const betterMessage: string[] = message.content.split(" ");
    if (betterMessage.length < 3) {
      // print default
      const toPrint = await this.collection.find().sort({points:-1}).limit(5).toArray();

      const fields: { name: string; value: string }[] = [];

      toPrint.forEach((member: DatabaseObject, index: number) => {
        const lastMessaged = member.lastMessaged > 0 ? `<t:${member.lastMessaged} <t:${member.lastMessaged}:R>` : "Not Available";
        const lastVoiceJoined = member.lastVoiceJoined > 0 ? `<t:${member.lastVoiceJoined}> <t:${member.lastVoiceJoined}:R>` : "Not Available";
        const lastOnline = member.lastOnline > 0 ? `<t:${member.lastOnline}> <t:${member.lastOnline}:R>` : "Not Available";

        const toPush: { name: string; value: string } = {
          name: `${index + 1}: ${member.username}`,
          value: `\
            - Points: ${member.points}\n\
            - Total Messages: ${member.totalMessages}\n\
            - Last Message: ${lastMessaged}\n\
            - Last Voice Join: ${lastVoiceJoined}\n\
            - Last Online: ${lastOnline}\
          `,
        };

        fields.push(toPush);
      });

      const embed = new EmbedBuilder()
        .setTitle("TRGR Top Discord Users")
        .setColor("#c7245d")
        .addFields(...fields)
        .setTimestamp()
        .setFooter({
          text: "Μας λες και το καλύτερο community (με εξαίρεση τον Stew)!",
        });

      await message.reply({embeds: [embed]});
      return;
    }

    // remove useless stuff
    betterMessage.shift() // trgr
    betterMessage.shift() // stats

    // has the desc option
    const desc = betterMessage.includes("desc", 0);
    if (desc) {
      const idx = betterMessage.findIndex(el => el === "desc");
      betterMessage.splice(idx, 1);
    }

    if (betterMessage.length < 1) {
      // print desc
      const toPrint = await this.collection.find().sort({points: 1}).limit(5).toArray();

      let fields: { name: string; value: string }[] = [];

      toPrint.forEach((member: DatabaseObject, index: number) => {
        const lastMessaged = member.lastMessaged > 0 ? `<t:${member.lastMessaged} <t:${member.lastMessaged}:R>` : "Not Available";
        const lastVoiceJoined = member.lastVoiceJoined > 0 ? `<t:${member.lastVoiceJoined}> <t:${member.lastVoiceJoined}:R>` : "Not Available";
        const lastOnline = member.lastOnline > 0 ? `<t:${member.lastOnline}> <t:${member.lastOnline}:R>` : "Not Available";

        const toPush: { name: string; value: string } = {
          name: `${index + 1}: ${member.username}`,
          value: `\
            - Points: ${member.points}\n\
            - Total Messages: ${member.totalMessages}\n\
            - Last Message: ${lastMessaged}\n\
            - Last Voice Join: ${lastVoiceJoined}\n\
            - Last Online: ${lastOnline}\
          `,
        };

        fields.push(toPush);
      });

      const embed = new EmbedBuilder()
        .setTitle("TRGR Top Discord Users")
        .setColor("#c7245d")
        .addFields(...fields)
        .setTimestamp()
        .setFooter({
          text: "Μας λες και το καλύτερο community (με εξαίρεση τον Stew)!",
        });

      await message.reply({embeds: [embed]});
      return;
    }

    // other limit
    const limitRegex = /^(?!#)(\d{1,})/;
    const limitIdx = betterMessage.findIndex(el => limitRegex.test(el));
    if (limitIdx >= 0) {
      const limit = parseInt(betterMessage[limitIdx]);

      // print with custom limit
      const toPrint = await this.collection.find().sort({ points: desc ? 1 : -1 }).limit(limit).toArray();

      let fields: { name: string; value: string }[] = [];

      toPrint.forEach((member: DatabaseObject, index: number) => {
        const lastMessaged = member.lastMessaged > 0 ? `<t:${member.lastMessaged} <t:${member.lastMessaged}:R>` : "Not Available";
        const lastVoiceJoined = member.lastVoiceJoined > 0 ? `<t:${member.lastVoiceJoined}> <t:${member.lastVoiceJoined}:R>` : "Not Available";
        const lastOnline = member.lastOnline > 0 ? `<t:${member.lastOnline}> <t:${member.lastOnline}:R>` : "Not Available";

        const toPush: { name: string; value: string } = {
          name: `${index + 1}: ${member.username}`,
          value: `\
            - Points: ${member.points}\n\
            - Total Messages: ${member.totalMessages}\n\
            - Last Message: ${lastMessaged}\n\
            - Last Voice Join: ${lastVoiceJoined}\n\
            - Last Online: ${lastOnline}\
          `,
        };

        fields.push(toPush);
      });

      const embed = new EmbedBuilder()
        .setTitle("TRGR Top Discord Users")
        .setColor("#c7245d")
        .addFields(...fields)
        .setTimestamp()
        .setFooter({
          text: "Μας λες και το καλύτερο community (με εξαίρεση τον Stew)!",
        });

      await message.reply({embeds: [embed]});
      return;
    }

    // contains 1 or more mentions
    const mentions = await message.mentions.users;
    const hasMentions = mentions.size > 0;
    if (hasMentions && !message.mentions.everyone) {
      const fields: { name: string, value: string }[] = []

      const userIds = mentions.map(mention => mention.id);
      const members = await this.collection.find({ user_id: { $in: userIds } }, {}).sort({ points: desc ? 1 : -1 }).toArray();

      for (const member of members) {
        const lastMessaged = member.lastMessaged > 0 ? `<t:${member.lastMessaged} <t:${member.lastMessaged}:R>` : "Not Available";
        const lastVoiceJoined = member.lastVoiceJoined > 0 ? `<t:${member.lastVoiceJoined}> <t:${member.lastVoiceJoined}:R>` : "Not Available";
        const lastOnline = member.lastOnline > 0 ? `<t:${member.lastOnline}> <t:${member.lastOnline}:R>` : "Not Available";

        const toPush: { name: string; value: string } = {
          name: member.username,
          value: `\
            - Points: ${member.points}\n\
            - Total Messages: ${member.totalMessages}\n\
            - Last Message: ${lastMessaged}\n\
            - Last Voice Join: ${lastVoiceJoined}\n\
            - Last Online: ${lastOnline}\
          `,
        };

        fields.push(toPush);
      }

      const embed = new EmbedBuilder()
        .setTitle("TRGR Top Discord Users")
        .setColor("#c7245d")
        .addFields(...fields)
        .setTimestamp()
        .setFooter({
          text: "Μας λες και το καλύτερο community (με εξαίρεση τον Stew)!",
        });

      await message.reply({embeds: [embed]});
      return;
    }

    // should not reach here
    console.log("HOW!");
    console.trace();
  }

  async help(message) {
    if (message.channel.id.toString() !== "1038511123432996884") {
      const reply = message.reply(`Λάθος κανάλι φίλε <@${message.author.id}>. Δοκίμασε το <#1038511123432996884>!`);
      message.delete({timeout: 5000});
      reply.delete({timeout: 5000});
    }

    const embed = new EmbedBuilder()
      .setTitle("TRGR Bot Help Message")
      .setColor("#c7245d")
      .setURL("https://www.bungie.net/en/ClanV2?groupid=3845554")
      .setAuthor({
        name: "Created by: Sheepstress#9964 (Δημήτρης)",
        url: "https://github.com/Dimitris-Provatas/TRGR-bot",
      })
      .setDescription("\
        Δημιουργήθηκε επί ιερά κυβέρνηση `Shadow Chaser#1247`!\n\n\
        Όλα τα commands έχουν το prefix `trgr`!\n\
        Παράδειγμα: `trgr help`\
      ")
      .addFields(
        {
          name: "help",
          value: "Αυτό το μήνυμα",
        },
        {
          name: "prune {1-1000}",
          value: "Σβήνει όσα μηνύματα του πεις. Μετράει και το command, οπότε αν θες να σβήσεις τα 5 τελευταία μηνύματα, κάνεις και +1 αυτό που θα γράψεις",
        },
        {
          name: "stats {mentions (1+)} {limit?} {desc?}",
          value: "\
            Δείχνει τα στατιστικά για τους top 5 χρήστες (φθίνουσα σειρά στους πόντους).\n\
            - Αν υπάρχει το `desc`, θα αλλάξει την σειρά των αποτελεσμάτων σε αύξουσα (πχ θα δείξει τους 5 χρήστες με τους λιγότερους πόντους).\
            - Αν βάλεις limit (πχ `10`), θα βγάλει τόσους χρήστες (φθινουσα σειρά στους πόντους). Το limit \"υπερνικά\" τα mentions.\n\
            - Αν βάλεις mention (πχ `@Sheepstress`), θα βγάλει μόνο αυτόν τον χρήστη. Μπορείς να κάνεις όσα mentions θες. Αν υπάρχει αριθμός στο μήνυμα, θεωρείται limit και τα mentions αγνοούνται!\n\
          ",
        },
      )
      .setTimestamp()
      .setFooter({
        text: "Μας λες και το καλύτερο community (με εξαίρεση τον Stew)!",
      });
    await message.channel.send({ embeds: [embed] });
  }

  async handleCommand(message) {
    const user = await this.targetServer.members.cache.get(message.author.id);
    // console.log(`${user} | ${message.channel.name} | ${message.channel.id}`)

    if (!user.permissions.has("ADMINISTRATOR")) {
      await message.reply(`${this.adminRole} ο φίλος <@${message.author.id}> θέλει να πάθει κακό!`);
      return;
    }

    const betterMessage = message.content.split(" ");

    switch (betterMessage[1]) {
      case "help":
        this.help(message);
        break;
      // Bulk delete messages
      case "prune": { // https://stackoverflow.com/a/50753272/13195498
        const toDelete = parseInt(betterMessage[2]);

        if (toDelete <= 0) {
          await message.reply("Έγκυρη πηγή μάμου...");
        } else if (toDelete > 1000) {
          await message.reply("Μέχρι 1000 την φορά...");
        } else {
          await message.channel.bulkDelete(toDelete);
        }
        break;
      }
      case "stats":
        this.printStats(message);
        break;
      default:
        await message.reply(`Δεν έχω το command ${betterMessage[1]} φίλε!`);
        break;
    }
  }

  async onServerMessage(message) {
    if (message.author.bot) {
      return;
    }

    if (message.content.startsWith("trgr ")) {
      this.handleCommand(message);
      return;
    }

    const username = `${message.author.username}#${message.author.discriminator}`

    const userInDatabase = await this.collection.findOne({ username: username });

    if (!userInDatabase) {
      this.collection.insertOne({
        username: username,
        user_id: message.author.id,
        points: 0,
        totalMessages: 0,
        lastMessaged: -1,
        lastVoiceJoined: -1,
        lastOnline: Math.floor(Date.now() / 1000),
      } as DatabaseObject);
    }

    this.collection.updateOne(
      {
        username: username,
      },
      {
        $set: {
          lastMessaged: Math.floor(Date.now() / 1000),
        },
        $inc: {
          totalMessages: 1,
          points: PointsForMessage,
        },
      }
    );
  }

  async monitor() {
    console.log(`Monitoring on ${new Date().toString()}`);

    // Update Server Cache
    await this.targetServer.fetch();

    const usernamesOnline = (await this.targetServer.members.cache).filter(member => {
        return (
          !member.user.bot &&
          member.presence &&
          member.presence.status !== "offline"
        );
      })
      .map(member => `${member.user.username}#${member.user.discriminator}(^_^)${member.user.id}`);

    const usernamesInChannels: any[] = (await this.targetServer.channels.cache).filter(channel => {
        return (
          channel.type === 2 &&
          channel.id !== "657658422459891734" // AFK channel
        );
      })
      .map(channel => channel.members.map(member => `${member.user.username}#${member.user.discriminator}(^_^)${member.user.id}`).flat()).flat();

    const allUsernames: any[] = Array.from(new Set([
      ...usernamesOnline,
      ...usernamesInChannels,
    ]));

    for (const usernameAndId of allUsernames) {
      const username = usernameAndId.split("(^_^)")[0];
      const userId = usernameAndId.split("(^_^)")[1];

      const inOnlineList = usernamesOnline.includes(usernameAndId);
      const inVoiceChannel = usernamesInChannels.includes(usernameAndId);

      const userInDatabase = await this.collection.findOne({ username: username });

      if (!userInDatabase) {
        await this.collection.insertOne({
          username: username,
          user_id: userId,
          points: 0,
          totalMessages: 0,
          lastMessaged: -1,
          lastVoiceJoined: inVoiceChannel ? Math.floor(Date.now() / 1000) : -1,
          lastOnline: inOnlineList ? Math.floor(Date.now() / 1000) : -1,
        } as DatabaseObject);
      } else {
        const toSet: { lastOnline?: number, lastVoiceJoined?: number } = {};
        if (inOnlineList) {
          toSet.lastOnline = Math.floor(Date.now() / 1000);
        }

        if (inVoiceChannel) {
          toSet.lastVoiceJoined = Math.floor(Date.now() / 1000);
        }

        const points = (inOnlineList ? PointsForOnlinePresence : 0) + (inVoiceChannel ? PointsForVoicePresence : 0);

        await this.collection.updateOne(
          {
            username: username,
          },
          {
            $set: toSet,
            $inc: {
              points: points,
            }
          }
        );
      }
    }
  }
}
