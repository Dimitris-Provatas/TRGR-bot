# TRGR Bot
## The official bot of the Tower Rangers Greece Discord Server

Made with [Discord.js](https://discord.js.org/#/), [Typescript](https://www.typescriptlang.org/) and [MongoDB](https://www.mongodb.com/).
This bot was created as an activity monitor of the users of the server. It mainly monitors time spent online, in voice channels and sending messages.

### Version 1.0
Create a `.env` file in the root of the project to store the following:
```
DISCORD_BOT_TOKEN='your token'

SERVER_ID='the server id you care about'

BOT_CHANNEL_ID='the channel for the bot commands'
AFK_CHANNEL_ID='the voice channel marked for AFK'

TR_ROLE_ID='the GoGo Tower Rangers role id'
ADMIN_ROLE_ID='the Administrator role id'
```

- Node.js version 16
- Discord.js version 14
- An installation of MongoDB is needed
