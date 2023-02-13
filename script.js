const {ipcRenderer} = require('electron');

// send message
let sendMessageElement = document.getElementById("messageInput1");
let sendChannelIDElement = document.getElementById("channelIDInput1");

// delete message
let deleteMessageElement = document.getElementById("messageInput2")
let deleteChannelIDElement = document.getElementById("channelIDInput2")

function sendMessageToMain() {
    var data = {
        message: sendMessageElement.value,
        channelID: sendChannelIDElement.value
    }
    ipcRenderer.send('messageSend', data);
}

function deleteMessageToMain() {
    var data = {
        message: deleteMessageElement.value,
        channelID: deleteChannelIDElement.value
    }
    deleteMessageElement.value = "";
    ipcRenderer.send('messageDelete', data);
}