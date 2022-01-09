const pageEl = document.querySelector("#js-page-url")
const button = document.querySelector("#js-button")

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0]

    getProductInfoView(activeTab?.url)

    button.addEventListener("click", () => {
        pageEl.innerText = ""
        // TODO here until we know for sure this approach can be removed, see the /content/index.js TODO note
        // chrome.tabs.sendMessage(tabs[0].id, {
        //     message: "GetDetails"
        // })
        getProductInfoView(activeTab?.url)
    })
})

const getProductInfoView = url => {
    const requestUrlObject = createRequestUrl(url)

    requestContent(requestUrlObject.baseUrl+requestUrlObject.endpoint+requestUrlObject.query).then(data => {
        console.log(data.page)
        pageEl.appendChild(createListElement(data.page))
    })
}

const createListElement = (page) => {
    const listEl = document.createElement("ul")
    
    for (const property in page) {
        const listItemEl = document.createElement("li")
        listItemEl.innerText = `${property}_____${page[property]}`
        listEl.appendChild(listItemEl)
    }

    return listEl
}

const requestContent = async (url) => {
    try {
        const response = await fetch(url)
        return await response.json()
    } catch (error) {
        console.error("Product Info Extension", error)
    }
}

const createRequestUrl = url => {
    const pageUrl = url
    const parser = document.createElement("a")
    parser.href = pageUrl

    const pagePath = encodeURIComponent(parser.pathname)

    return {
        endpoint: "/content",
        query: `?url=${pagePath}`,
        baseUrl: parser.origin
    }
}