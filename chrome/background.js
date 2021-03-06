function hostname(url) {
    var parser = document.createElement('a');
    parser.href = url;
    return parser.hostname;
}

function inFilter(hostname) {
    try {
        var userSites = JSON.parse(localStorage.getItem("sites") || "")
    } catch (e) {
        var userSites = sites; // Use default
    };
    for (var i in userSites) {
        var site = userSites[i];
        var re = new RegExp("\\b" + site.replace(".","\\.") + "$");
        if (hostname.match(re))
            return true;
    }
    return false;
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (inFilter(hostname(tab.url))) {
        var whiteList;
        try {
            whiteList = JSON.parse(localStorage.getItem("whiteList") || "");
        } catch (e) {
            whiteList = {};
        }

        if (whiteList.hasOwnProperty(tab.url)) {
            var timestamp = (new Date()).getTime();
            var threshold = 10 * 60 * 1000; // Ten minutes
            if (timestamp - whiteList[tab.url] > threshold) {
                delete whiteList[tab.url];

                try {
                    localStorage.setItem("whiteList",JSON.stringify(whiteList));
                } catch (err) {
                    console.error(err);
                }
            }
        }

        if (!whiteList.hasOwnProperty(tab.url))
            chrome.tabs.update(tab.id, {url: "stop.html?to=" + encodeURIComponent(tab.url)});
    }
});
