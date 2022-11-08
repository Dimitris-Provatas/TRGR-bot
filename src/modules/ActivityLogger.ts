import { MongoClient } from "mongodb";

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
  adminRole: string;

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
      this.client.on("messageCreate", (message) => it.onServerMessage(message));

      // Monitor on Interval
      setInterval(() => it.monitor(), MonitorInterval * 1000);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }

  async printStats(message) {}

  async handleCommand(message) {
    const user = await this.targetServer.members.cache.get(message.author.id);

    if (!user.permissions.has("ADMINISTRATOR")) {
      await message.reply(`${this.adminRole} ο φίλος <@${message.author.id}> θέλει να πάθει κακό!`);
      return;
    }

    const betterMessage = message.content.split(" ");

    switch (betterMessage[1]) {
      default:
        await message.reply(`Δεν έχω το ${betterMessage[1]} command φίλε!`);
        break;
    }
  }

  async onServerMessage(message) {
    if (message.content.startsWith("trgr ")) {
      this.handleCommand(message);
      return;
    }

    const username = `${message.author.username}#${message.author.discriminator}`

    const userInDatabase = await this.collection.findOne({ username: username });

    if (!userInDatabase) {
      this.collection.insertOne({
        username: username,
        points: 0,
        totalMessages: 0,
        lastMessaged: -1,
        lastVoiceJoined: -1,
        lastOnline: Date.now(),
      } as DatabaseObject);
    }

    this.collection.updateOne(
      {
        username: username,
      },
      {
        $set: {
          lastMessaged: Date.now(),
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

    // Users Online
    (await this.targetServer.members.cache).forEach(async (member) => {
      if (
        member.user.bot ||
        !member.presence ||
        member.presence.status === "offline"
      ) {
        return;
      }

      const username = `${member.user.username}#${member.user.discriminator}`;

      const userInDatabase = await this.collection.findOne({ username: username });

      if (!userInDatabase) {
        this.collection.insertOne({
          username: username,
          points: 0,
          totalMessages: 0,
          lastMessaged: -1,
          lastVoiceJoined: -1,
          lastOnline: Date.now(),
        } as DatabaseObject);
      } else {
        this.collection.updateOne(
          {
            username: username,
          },
          {
            $set: {
              lastOnline: Date.now(),
            },
            $inc: {
              points: PointsForOnlinePresence,
            }
          }
        );
      }
    });

      // Users in Voice
    (await this.targetServer.channels.cache).filter(channel => channel.type === "voice").forEach(async (channel) => {
      for (const member of channel.members) {
        const username = `${member.user.username}#${member.user.discriminator}`;

        const userInDatabase = await this.collection.findOne({ username: username });

        if (!userInDatabase) {
          this.collection.insertOne({
            username: username,
            points: 0,
            totalMessages: 0,
            lastMessaged: -1,
            lastVoiceJoined: Date.now(),
            lastOnline: -1,
          } as DatabaseObject);
        } else {
          this.collection.updateOne(
            {
              username: username,
            },
            {
              $set: {
                lastVoiceJoined: Date.now(),
              },
              $inc: {
                points: PointsForVoicePresence,
              }
            }
          );
        }
      }
    });
  }
}
