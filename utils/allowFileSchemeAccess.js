const checkFileSchemeAccessAndOpenOptionsPage = () => {
    chrome.extension.isAllowedFileSchemeAccess((isAllowed) => {
        if (!isAllowed) {
            chrome.runtime.openOptionsPage();
        }
    });
};

checkFileSchemeAccessAndOpenOptionsPage();

