document.addEventListener('DOMContentLoaded', () => {
    // Function to retrieve stored values from local storage
    const getStoredValues = () => {
      return new Promise((resolve, reject) => {
        browser.storage.local.get(['nin', 'nss', 'autoReloadRunning'], (data) => {
          if (browser.runtime.lastError) {
            reject(browser.runtime.lastError);
          } else {
            resolve(data);
          }
        });
      });
    };
  
    // Function to start auto-reload process
    const startAutoReload = async () => {
      let { nin, nss } = await getStoredValues();
      nin = document.getElementById('nin').value || nin;
      nss = document.getElementById('nss').value || nss;
  
      // Store the values in local storage (in case they've been updated)
      browser.storage.local.set({ nin, nss });
  
      // Send message to background.js to start auto reload
      browser.runtime.sendMessage({ action: "startAutoReload" });
  
      // Update UI
      updateUI();
    };
  
    // Function to stop auto-reload process
    const stopAutoReload = () => {
      // Send message to background.js to stop auto reload
      browser.runtime.sendMessage({ action: "stopAutoReload" });
  
      // Update UI
      updateUI();
    };
  
    // Function to update UI based on auto-reload status
    const updateUI = async () => {
      const { autoReloadRunning } = await getStoredValues();
      const toggleButton = document.getElementById('toggleButton');
      const status = document.getElementById('status');
  
      if (autoReloadRunning) {
        toggleButton.textContent = 'Stop';
        toggleButton.classList.add('stop'); // Add 'stop' class for red background
        status.textContent = 'Status: Running';
      } else {
        toggleButton.textContent = 'Start';
        toggleButton.classList.remove('stop'); // Remove 'stop' class for green background
        status.textContent = 'Status: Not Running';
      }
    };
  
    // Add event listener to toggleButton
    document.getElementById('toggleButton').addEventListener('click', () => {
      browser.runtime.sendMessage({ action: "getAutoReloadStatus" }, (response) => {
        const { isRunning } = response;
  
        if (isRunning) {
          stopAutoReload();
        } else {
          startAutoReload();
        }
      });
    });
  
    // Populate inputs and initialize UI based on current state
    getStoredValues().then(({ nin, nss }) => {
      document.getElementById('nin').value = nin || '';
      document.getElementById('nss').value = nss || '';
  
      updateUI(); // Initialize UI based on auto-reload status
    }).catch((error) => {
      console.error('Error retrieving values from local storage:', error);
    });
  });
  