const targetUrl = "https://aadl3inscription2024.dz/";
const searchurl='*://aadl3inscription2024.dz';
const checkInterval = 6; // Check every 20 seconds

let countdown = checkInterval;
let autoReloadIntervalId = null;
let isRunning = false;

browser.runtime.onInstalled.addListener(() => {
  console.log("Auto Reload AADL extension installed.");
});

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startAutoReload") {
    startAutoReload();
    sendResponse({ success: true });
  } else if (message.action === "stopAutoReload") {
    stopAutoReload();
    browser.notifications.create({
        type: 'basic',
        iconUrl: 'AADL_logo.png', // Replace with the path to your extension's icon
        title: 'Auto Reload AADL',
        message: 'Auto-reload has been stopped.',
        priority: 2
      }, (notificationId) => {
        console.log('Notification shown with ID:', notificationId);
      });
    sendResponse({ success: true });
  } else if (message.action === "getAutoReloadStatus") {
    sendResponse({ isRunning });
  }
});

// browser.alarms.onAlarm.addListener((alarm) => {
//   if (alarm.name === "checkWebsite") {
//     checkWebsiteStatus();
//     updateBadge();
//   }
// });

function startAutoReload() {
  if (!autoReloadIntervalId) {
    autoReloadIntervalId = setInterval(() => {
      
      updateBadge();
    }, 1000); // Check every second; 
   // browser.alarms.create("checkWebsite", { periodInMinutes: checkInterval / 60 });
   checkWebsiteStatus();
    updateBadge();
    isRunning = true;
    saveAutoReloadStatus(true);
  }
}

function stopAutoReload() {
  if (autoReloadIntervalId) {
    clearInterval(autoReloadIntervalId);
    autoReloadIntervalId = null;
    isRunning = false;
    updateBadge();
    saveAutoReloadStatus(false);
  }
}

function saveAutoReloadStatus(status) {
  browser.storage.local.set({ autoReloadRunning: status }, () => {
    if (browser.runtime.lastError) {
      console.error("Error saving auto reload status:", browser.runtime.lastError);
    } else {
      console.log("Auto reload status saved successfully.");
    }
  });
}

function updateBadge() {
  browser.action.setBadgeText({ text: isRunning ? countdown.toString() : "" });
 if(isRunning) browser.action.setBadgeBackgroundColor({ color: isRunning ? "#FF0000" : "" });

  if (isRunning && countdown > 0) {
    countdown--;
  } else if (isRunning) {
    countdown = checkInterval;
    checkWebsiteStatus();
  }
}
// Event listener for tab load completion
browser.webNavigation.onCompleted.addListener(function(details) {
    console.log(`Tab ${details.tabId} loaded successfully.`);
  }, { url: [{ urlMatches: targetUrl+'*' }] });
  
  // Event listener for tab error occurrence
  browser.webNavigation.onErrorOccurred.addListener(function(details) {
    console.error(`Error detected in tab ${details.tabId}: ${details.url}`);

    countdown = checkInterval;
    reloadTab(details.tabId);
  }, { url: [{ urlMatches: targetUrl+'*'}] });
  
  // Function to check website status and initiate reload if necessary
  function checkWebsiteStatus() {
    console.log("Checking website status...");
    browser.tabs.query({ url: searchurl }, (tabs) => {
      if (tabs.length > 0) {
        tabs.forEach(tab => {
            console.log(tab);
          console.log(`Checking status of tab ${tab.tabId}`);
          // Optionally, you can add more specific checks here if needed
        });
      } else {
        console.log("No tabs found with the target URL.");
        browser.tabs.create({ url: targetUrl });
      }
    });
  }
  
  function reloadTab(tabId) {
  if(isRunning)  browser.tabs.reload(tabId, { bypassCache: true }, () => {
      console.log(`Tab ${tabId} reloaded.`);
    });
  }
  


