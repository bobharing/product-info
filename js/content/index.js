
var port = chrome.runtime.connect({ name: "knockknock" })

// TODO this is currently not active, but this approach might be the one we want to use because we want get what has been cached not a clean
chrome.runtime.onMessage.addListener((request) => {
    if (request.message === "GetDetails") {
        const requestUrlObject = createRequestUrl()

        requestContent(requestUrlObject.baseUrl + requestUrlObject.endpoint + requestUrlObject.query).then(data => {
            port.postMessage({ message: data.page })
        })
    }
})

const requestContent = async (url) => {
    try {
        const response = await fetch(url)
        return await response.json()
    } catch (error) {
        console.error("Product Info Extension", error)
    }
}

const createRequestUrl = () => {
    const pageUrl = document.URL
    const parser = document.createElement("a")
    parser.href = pageUrl

    const pagePath = encodeURIComponent(parser.pathname)

    return {
        endpoint: "/content",
        query: `?url=${pagePath}`,
        baseUrl: parser.origin
    }
}