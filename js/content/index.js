// // Send the dom to the index.js of PopUp
const body = document.body

var port = chrome.runtime.connect({ name: "knockknock" })
port.postMessage({ body })
// port.onMessage.addListener(function (msg) {
//   if (msg.question === "Who's there?") port.postMessage({ answer: "Madame" })
//   else if (msg.question === "Madame who?")
//     port.postMessage({ answer: "Madame... Bovary" })
// })
