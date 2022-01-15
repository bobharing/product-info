chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log("updated")
})

chrome.tabs.onActivated.addListener(activeInfo => {
    console.log("active")
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(window.__INITIAL_STATE__)

    fetch(document.URL).then(response => {
       return response.text()
    }).then(html => {
        console.log(html)
    })

    let responseMessage = null
    // if (request.message === "GetPageData") {
    //     responseMessage = document.querySelector("script[type='application/ld+json']")
    //     console.log(responseMessage.innerText)
    // }
    sendResponse({message: responseMessage})
})