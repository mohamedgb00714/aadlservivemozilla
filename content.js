// Function to retrieve NIN and NSS from local storage

const getStoredValues = () => {
    return new Promise((resolve, reject) => {
      browser.storage.local.get(['nin', 'nss'], (data) => {
        if (browser.runtime.lastError) {
          reject(browser.runtime.lastError);
        } else {
          resolve(data);
        }
      });
    });
  };
  
  // Function to fill form fields if elements are detected
  const fillForm = async () => {
    try {
      const { nin, nss } = await getStoredValues();
      
      const ninElement = document.getElementById('A22');
      const nssElement = document.getElementById('A27');
      
      if (nin && nss && ninElement && nssElement) {
        ninElement.value = nin;
        nssElement.value = nss;
      }
    } catch (error) {
      console.error('Error retrieving values from local storage:', error);
    }
  };
  
  // Function to check auto-reload status and stop reloading if necessary
  const checkAutoReloadStatus = () => {
    browser.runtime.sendMessage({ action: "getAutoReloadStatus" }, (response) => {
      const { isRunning } = response;
      if (isRunning) {
        stopAutoReload();
      }
    });
  };
  
  // Mutation observer to watch for changes in the DOM
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        fillForm();
        checkAutoReloadStatus(); // Check auto-reload status on DOM changes
      }
    });
  });
  
  // Start observing the document body for changes
  observer.observe(document.body, { childList: true, subtree: true });function stopAutoReload() {
    browser.runtime.sendMessage({ action: "stopAutoReload" }, (res) => {
      console.log(res);
  
      // Create a notification to inform the user that auto-reload has stopped
      
    });
 
  }
  
  // Initial check in case elements are already present
  fillForm();
  checkAutoReloadStatus();
  