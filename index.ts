import discordJs, { DiscordAPIError, Guild, Intents, MessageEmbed, TextChannel, User } from "discord.js"
import dotenv from "dotenv"
import WOKCommands from "wokcommands"
import path from "path"
import noblox from "noblox.js"
import mongoose from "mongoose"
import merits from "./models/merits"
import express, { response } from "express"
import Filter from "bad-words"
import bodyParser from "body-parser"
import application from './models/applications'
import applications from "./models/applications"
let port = 5075
let app = express()


const talkedRecently = new Set();
dotenv.config()
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(bodyParser.json());

//Authentication
app.use((req, res, next) => {



  const auth = { login: 'zutureadmin', password: 'Zu7u4eVbXm8o0' }


  const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
  const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')


  if (login && password && login === auth.login && password === auth.password) {

    return next()
  }

  // Access denied
  res.set('WWW-Authenticate', 'Basic realm="401"') // change this if you want to be a 
  res.status(401).send('Authentication required.') // custom message

})

const client = new discordJs.Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS
  ]
})

client.on('ready', async () => {
  client.user?.setPresence({ activities: [{ name: 'to Vista Academy', type: "LISTENING" }], status: 'online' });
  console.log('The bot is online.')
  let primaryGuild = client.guilds.cache.get('973253184137076806') as Guild

  let errorChannel = primaryGuild.channels.cache.get('973555709537042452') as TextChannel
  errorChannel.send({
    embeds: [new MessageEmbed()
      .setTitle('Notification')
      .setDescription('The bot had just been restarted.')
      .setColor('GOLD')
      .setTimestamp()
    ]
  })
  const currentUser = await noblox.setCookie(`${process.env["robloxcookie"]}`)
  console.log(`Logged in as ${currentUser.UserName} [${currentUser.UserID}]`)
  const wok = new WOKCommands(client, {
    // The name of the local folder for your command files
    commandsDir: path.join(__dirname, 'commands'),
    testServers: ['973253184137076806'],
    // Pass in the new dbOptions
    // Pass in your own mongo connection URI
    // mongoUri: "mongodb+srv://Vista Academydiscord:Vista Academy314@cluster0.1gt3c.mongodb.net/test"
    mongoUri: process.env["dbLink"]

  })

})

var db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"));

db.once("open", function () {
  console.log("Connection To MongoDB Atlas Successful!");
});

app.get("/", (request, response) => {
  var ResponseTable = { status: "Success", app: "Online" }
  let primaryGuild = client.guilds.cache.get('973253184137076806') as Guild

  let errorChannel = primaryGuild.channels.cache.get('973555709537042452') as TextChannel
  errorChannel.send({
    embeds: [new MessageEmbed()
      .setTitle('Notification')
      .setDescription('This is a test message triggered by my API.')
      .setColor('AQUA')
      .setTimestamp()
    ]
  })
  response.status(200).json(ResponseTable)
});

app.post("/log", async (request, response) => {
  let actions = request.body.actionLogs
  for (const action of actions) {
    let moderator = action.Moderator
    let actionTaken = action.Action
    if (actionTaken == 'Ban' || actionTaken == 'Kick' || actionTaken == 'Warn') {
      let reason = action.Reason
      let target = action.Target
      let primaryGuild = client.guilds.cache.get('973253184137076806') as Guild

      let logChannel = primaryGuild.channels.cache.get('975429627935866951') as TextChannel
      logChannel.send({
        embeds: [
          new MessageEmbed()
            .setTitle(`${actionTaken} Log`)
            .setDescription(`Moderator: ${moderator} \n Target: ${target} \n Reason: ${reason}`)
            .setColor('PURPLE')
            .setFooter({ text: 'Vista System | Developed by Damien' })
        ]
      })
    } else {
      let primaryGuild = client.guilds.cache.get('973253184137076806') as Guild

      let logChannel = primaryGuild.channels.cache.get('975429627935866951') as TextChannel
      logChannel.send({
        embeds: [
          new MessageEmbed()
            .setTitle(`${actionTaken} Log`)
            .setDescription(`Moderator: ${moderator}`)
            .setColor('PURPLE')
            .setFooter({ text: 'Vista Academy | Developed by Damien' })
        ]
      })
    }
    response.status(200).json({ status: 'Success' })
  }
})
app.get('/application/group/:groupid', async (request, response) => {
  let groupID = request.params.groupid
  let data = await applications.findOne({ GroupID: `${groupID}` })
  if (data) {
    response.status(200).json({ status: 'Not eligible' })
  } else {
    response.status(200).json({ status: 'Eligible' })
  }
})
app.get('/application/user/:userid', async (request, response) => {
  let UserID = request.params.userid
  let data = await applications.findOne({ RobloxUserID: `${UserID}` })
  if (data) {
    response.status(200).json({ status: 'Not eligible' })
  } else {
    response.status(200).json({ status: 'Eligible' })
  }

})
app.post("/createApplication", async (request, response) => {
  let primaryGuild = client.guilds.cache.get('973253184137076806') as Guild

  let applicationChannel = primaryGuild.channels.cache.get('987397799228370974') as TextChannel

  let applicationtype = request.body.Type
  let GroupID = request.body.GroupID
  let discordInvite = request.body.Code
  let answer1 = request.body.Answer1
  let answer2 = request.body.Answer2
  let answer3 = request.body.Answer3
  let answer4 = request.body.Answer4
  let dateString = request.body.Date
  let userID = request.body.UserID
  if (applicationtype == 'Partner') {
    let groupdata = await noblox.getGroup(GroupID)
    if (groupdata) {
      let applicationData = await applications.create({
        Type: 'Partner',
        RobloxUserID: `${userID}`,
        GroupID: `${GroupID}`,
        Status: 'Processing',
        Date: `${dateString}`
      })
      let appicationID = applicationData.id
      let groupName = groupdata.name
      let membercount = groupdata.memberCount
      let description = `\n **Group Name: ** ${groupName} \n **Group Member: ${membercount}** \n **Discord Code: ${discordInvite}`
      let question1 = '****'
    }
  }


  response.status(200).json({ status: 'Success' })
})
client.on('error', error => {
  let primaryGuild = client.guilds.cache.get('973253184137076806') as Guild

  let errorChannel = primaryGuild.channels.cache.get('973555709537042452') as TextChannel
  errorChannel.send({
    embeds: [new MessageEmbed()
      .setTitle(error.message)
      .setDescription(`${error}`)
      .setColor('RED')
      .setFooter({ text: 'Vista Academy | Developed by Damien' })
    ]
  })
  console.log('Error: ' + error)
  throw (error)
})

client.on('messageCreate', async (message) => {
  if (message.content.length > 5) {

    if (message.member) {
      if (message.member.user.bot) {
        console.log('Member is bot')
      } else {
        if (talkedRecently.has(message.author.id)) {
          console.log("On cool down")
        } else {
          talkedRecently.add(message.author.id);

          var RobloxUsername = message.member.displayName
          var RobloxID = await noblox.getIdFromUsername(RobloxUsername)

          if (RobloxID) {
            let data = await merits.findOne({ RobloxUserID: RobloxID })
            if (data) {
              await merits.findOneAndUpdate({ RobloxUserID: RobloxID }, { Merits: parseInt(data.Merits) + 1 })
            } else {
              await merits.create({
                RobloxUserID: RobloxID,
                Merits: 1
              })
            }
          }

          setTimeout(() => {
            talkedRecently.delete(message.author.id);
            console.log("Deleted cooldown")
          }, 240000);
        }
      }

    }
  }
  let filter = new Filter();
  let msg = message.content
  if (filter.isProfane(msg)) {
    let primaryGuild = client.guilds.cache.get('973253184137076806') as Guild
    await message.delete()
    let errorChannel = primaryGuild.channels.cache.get('973555709537042452') as TextChannel
    errorChannel.send({
      embeds: [new MessageEmbed()
        .setTitle('Auto-mod')
        .setDescription(`Profanity is detected and the message was deleted. \n Message: ${msg}`)
        .setColor('BLURPLE')
        .setFooter({ text: 'Vista Academy | Developed by Damien' })
        .setTimestamp()
      ]
    })
  }


})

client.on('messageDelete', message => {
  console.log(`A message by ${message.member?.user.username} was deleted, but we don't know by who yet.`);
  let primaryGuild = client.guilds.cache.get('973253184137076806') as Guild
  let channel = message.channel as TextChannel
  let channelName = channel.name
  let errorChannel = primaryGuild.channels.cache.get('973555709537042452') as TextChannel
  errorChannel.send({
    embeds: [new MessageEmbed()
      .setTitle('Message Deleted')
      .setDescription(`A message by ${message.member?.user.username} also known as ${message.member?.displayName} (<@${message.member?.id}>) was deleted in ${channelName} (<#${channel.id}>). \n\n ** Message Content: ** ${message.content}`)
      .setColor('RED')
      .setFooter({ text: 'Vista Academy | Developed by Damien' })
      .setTimestamp()
    ]
  })

});



app.listen(port, () => {
  console.log('App is online')
})

client.login(process.env.TOKEN)