export const getCurrentTab = () => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({
      active: true,
      currentWindow: true,
    }, (tabs) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      }

      resolve(tabs[0])
    })  
  })
}

export const updateCurrentTabURL = async newURL => {
  try {
    const currentTab = await getCurrentTab()

    const updatedTab = await new Promise((resolve, reject) => {
      chrome.tabs.update(currentTab.id, {
        url: newURL,
      }, (tab) => {
        if (chrome.runtime.lastError) {
          const err = chrome.runtime.lastError
          reject(err)
        }
  
        resolve(tab)
      })
    })

    return updatedTab
  } catch (err)  {
    console.error(err)
    console.error('Failed to update current tab url.')
  }
}


export const sendMessage = async (messageData) => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(messageData, async (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      }

      resolve(response)
    })
  })
}

export const sendMessageToCurrentTab = async (messageData) => {
  try {
    const currentTab = await getCurrentTab()

    const answer = await new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(currentTab.id, messageData, async (response) => {
        if (chrome.runtime.lastError) {
          console.error({ err: chrome.runtime.lastError })
          reject(chrome.runtime.lastError)
        }

        resolve(response)
      })
    })

    return answer
  } catch (err)  {
    console.error(err)
    console.error('Failed to update current tab url.')
  }
}

export const listenForMessage = ({ messageKey, callback}) => {
  chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.messageKey === messageKey) {
      await callback(request, sender, sendResponse)
    }
  })  
}
