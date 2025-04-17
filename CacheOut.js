/**
 * Universal Browser Diagnostics Tool
 * A comprehensive browser diagnostics tool for general troubleshooting
 */
(async () => {
  const results = {
    browserInfo: {},
    storageInfo: {},
    networkInfo: {},
    performanceInfo: {},
    fixes: []
  };
  
  try {
    console.log("🔍 Starting browser diagnostics...");
    
    // Create diagnostics panel
    const panel = document.createElement('div');
    panel.id = 'diagnostics-panel';
    panel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 400px;
      max-height: 80vh;
      overflow-y: auto;
      background: white;
      border: 1px solid #ccc;
      border-radius: 5px;
      box-shadow: 0 0 10px rgba(0,0,0,0.2);
      z-index: 999999;
      font-family: Arial, sans-serif;
      font-size: 14px;
      padding: 15px;
    `;
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: #f0f0f0;
      border: none;
      border-radius: 3px;
      padding: 5px 10px;
      cursor: pointer;
    `;
    closeBtn.onclick = () => document.body.removeChild(panel);
    panel.appendChild(closeBtn);
    
    // Create screenshot button
    const screenshotBtn = document.createElement('button');
    screenshotBtn.textContent = 'Take Screenshot';
    screenshotBtn.style.cssText = `
      position: absolute;
      top: 10px;
      right: 85px;
      background: #f0f0f0;
      border: none;
      border-radius: 3px;
      padding: 5px 10px;
      cursor: pointer;
    `;
    panel.appendChild(screenshotBtn);
    
    // Title
    const title = document.createElement('h2');
    title.textContent = 'Browser Diagnostics Tool';
    title.style.margin = '0 0 15px 0';
    panel.appendChild(title);
    
    // Content container
    const content = document.createElement('div');
    panel.appendChild(content);
    
    function addSection(title) {
      const section = document.createElement('div');
      section.style.cssText = 'margin-bottom: 15px;';
      
      const heading = document.createElement('h3');
      heading.textContent = title;
      heading.style.cssText = 'margin: 0 0 5px 0; padding-bottom: 5px; border-bottom: 1px solid #eee;';
      heading.addEventListener('click', () => {
        details.style.display = details.style.display === 'none' ? 'block' : 'none';
        heading.style.opacity = details.style.display === 'none' ? '0.7' : '1';
      });
      heading.style.cursor = 'pointer';
      section.appendChild(heading);
      
      const details = document.createElement('div');
      details.style.cssText = 'padding-left: 10px;';
      section.appendChild(details);
      
      content.appendChild(section);
      return details;
    }
    
    function addDetail(container, label, value, isError = false) {
      const item = document.createElement('div');
      item.style.cssText = 'margin: 5px 0; display: flex;';
      
      const labelEl = document.createElement('strong');
      labelEl.textContent = label + ': ';
      labelEl.style.cssText = 'flex: 0 0 40%;';
      item.appendChild(labelEl);
      
      const valueEl = document.createElement('span');
      valueEl.textContent = value;
      if (isError) valueEl.style.color = '#ea4335';
      item.appendChild(valueEl);
      
      container.appendChild(item);
      return item;
    }
    
    function addMessage(container, message, type = 'info') {
      const item = document.createElement('div');
      item.textContent = message;
      item.style.cssText = 'margin: 5px 0; padding-left: 10px; border-left: 3px solid ' + 
        (type === 'error' ? '#ea4335' : type === 'success' ? '#34a853' : '#4285f4') + ';';
      item.className = type; // Add class for finding items by type later
      container.appendChild(item);
      return item;
    }
    
    // 1. Basic Browser Information
    const browserSection = addSection('Browser Information');
    
    const userAgent = navigator.userAgent;
    results.browserInfo.userAgent = userAgent;
    addDetail(browserSection, 'User Agent', userAgent);
    
    const browserName = (() => {
      if (userAgent.includes('Firefox')) return 'Firefox';
      if (userAgent.includes('Edg')) return 'Microsoft Edge';
      if (userAgent.includes('Chrome')) return 'Chrome';
      if (userAgent.includes('Safari')) return 'Safari';
      return 'Unknown';
    })();
    results.browserInfo.name = browserName;
    addDetail(browserSection, 'Browser', browserName);
    
    // Better incognito detection
    let isIncognito = false;
    try {
      const quota = await navigator.storage.estimate();
      isIncognito = quota.quota < 120000000; // Less than ~120MB is often incognito
    } catch (e) {
      // Fallback detection method
      try {
        localStorage.setItem('test_incognito', 'test');
        localStorage.removeItem('test_incognito');
        isIncognito = false;
      } catch (e) {
        isIncognito = true;
      }
    }
    results.browserInfo.incognito = isIncognito;
    addDetail(browserSection, 'Incognito Mode', isIncognito ? 'Yes' : 'No');
    
    const doNotTrack = navigator.doNotTrack || window.doNotTrack;
    results.browserInfo.doNotTrack = doNotTrack;
    addDetail(browserSection, 'Do Not Track', doNotTrack ? 'Enabled' : 'Disabled');
    
    // Browser language and timezone
    const language = navigator.language || navigator.userLanguage;
    results.browserInfo.language = language;
    addDetail(browserSection, 'Language', language);
    
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    results.browserInfo.timezone = timezone;
    addDetail(browserSection, 'Timezone', timezone);
    
    // 2. Current Site Information
    const siteSection = addSection('Site Information');
    
    const currentDomain = window.location.hostname;
    results.siteInfo = { domain: currentDomain };
    addDetail(siteSection, 'Domain', currentDomain);
    addDetail(siteSection, 'URL', window.location.href);
    addDetail(siteSection, 'Protocol', window.location.protocol);
    
    // 3. Storage Information
    const storageSection = addSection('Storage Information');
    
    try {
      results.storageInfo.localStorage = {
        available: !!window.localStorage,
        itemCount: localStorage.length
      };
      addDetail(storageSection, 'localStorage Items', localStorage.length.toString());
    } catch (e) {
      results.storageInfo.localStorage = { error: e.message };
      addDetail(storageSection, 'localStorage', 'Error: ' + e.message, true);
    }
    
    try {
      results.storageInfo.sessionStorage = {
        available: !!window.sessionStorage,
        itemCount: sessionStorage.length
      };
      addDetail(storageSection, 'sessionStorage Items', sessionStorage.length.toString());
    } catch (e) {
      results.storageInfo.sessionStorage = { error: e.message };
      addDetail(storageSection, 'sessionStorage', 'Error: ' + e.message, true);
    }
    
    try {
      const cookies = document.cookie.split(';').filter(c => c.trim()).length;
      results.storageInfo.cookies = { count: cookies };
      addDetail(storageSection, 'Cookies', cookies.toString());
    } catch (e) {
      results.storageInfo.cookies = { error: e.message };
      addDetail(storageSection, 'Cookies', 'Error: ' + e.message, true);
    }
    
    try {
      if (window.indexedDB) {
        const dbs = await indexedDB.databases();
        results.storageInfo.indexedDB = { available: true, databases: dbs.length };
        addDetail(storageSection, 'IndexedDB Databases', dbs.length.toString());
      } else {
        results.storageInfo.indexedDB = { available: false };
        addDetail(storageSection, 'IndexedDB', 'Not available');
      }
    } catch (e) {
      results.storageInfo.indexedDB = { error: e.message };
      addDetail(storageSection, 'IndexedDB', 'Error: ' + e.message, true);
    }
    
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        results.storageInfo.serviceWorkers = { available: true, count: registrations.length };
        addDetail(storageSection, 'Service Workers', registrations.length.toString());
      } else {
        results.storageInfo.serviceWorkers = { available: false };
        addDetail(storageSection, 'Service Workers', 'Not available');
      }
    } catch (e) {
      results.storageInfo.serviceWorkers = { error: e.message };
      addDetail(storageSection, 'Service Workers', 'Error: ' + e.message, true);
    }
    
    // 4. Storage Estimate
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        const usedMB = Math.round(estimate.usage / 1024 / 1024);
        const quotaMB = Math.round(estimate.quota / 1024 / 1024);
        const percentUsed = Math.round((estimate.usage / estimate.quota) * 100);
        
        results.storageInfo.estimate = { used: usedMB, quota: quotaMB, percent: percentUsed };
        
        addDetail(storageSection, 'Storage Used', `${usedMB} MB of ${quotaMB} MB (${percentUsed}%)`);
        if (percentUsed > 90) {
          addMessage(storageSection, 'Storage is nearly full! This can cause errors.', 'error');
        }
      }
    } catch (e) {
      results.storageInfo.estimate = { error: e.message };
    }
    
    // 5. Network Information
    const networkSection = addSection('Network & Performance');
    
    try {
      if ('connection' in navigator) {
        const connection = navigator.connection;
        results.networkInfo.connection = {
          type: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        };
        
        addDetail(networkSection, 'Connection Type', connection.effectiveType || 'Unknown');
        addDetail(networkSection, 'Downlink Speed', (connection.downlink || '?') + ' Mbps');
        addDetail(networkSection, 'Round Trip Time', (connection.rtt || '?') + ' ms');
        
        if (connection.rtt > 500) {
          addMessage(networkSection, 'High latency detected! This might cause timeouts.', 'error');
        }
        
        if (connection.saveData) {
          addMessage(networkSection, 'Data Saver is enabled. This might limit functionality.', 'info');
        }
      } else {
        results.networkInfo.connection = { available: false };
        addDetail(networkSection, 'Connection Info', 'Not available');
      }
    } catch (e) {
      results.networkInfo.connection = { error: e.message };
    }
    
    // 6. Performance metrics
    try {
      if (window.performance) {
        const navTiming = performance.getEntriesByType('navigation')[0];
        if (navTiming) {
          const loadTime = Math.round(navTiming.loadEventEnd - navTiming.startTime);
          const domContentLoaded = Math.round(navTiming.domContentLoadedEventEnd - navTiming.startTime);
          const ttfb = Math.round(navTiming.responseStart - navTiming.requestStart);
          
          results.performanceInfo = {
            loadTime,
            domContentLoaded,
            ttfb
          };
          
          addDetail(networkSection, 'Page Load Time', loadTime + ' ms');
          addDetail(networkSection, 'DOM Content Loaded', domContentLoaded + ' ms');
          addDetail(networkSection, 'Time to First Byte', ttfb + ' ms');
          
          if (ttfb > 500) {
            addMessage(networkSection, 'Slow server response time detected!', 'error');
          }
          
          if (loadTime > 5000) {
            addMessage(networkSection, 'Slow page load time detected!', 'error');
          }
        }
      }
    } catch (e) {
      results.performanceInfo.error = e.message;
    }
    
    // 7. System Information
    const systemSection = addSection('System Information');
    
    const platform = navigator.platform;
    results.systemInfo = { platform };
    addDetail(systemSection, 'Platform', platform);
    
    const screenRes = `${window.screen.width} × ${window.screen.height}`;
    results.systemInfo.screen = screenRes;
    addDetail(systemSection, 'Screen Resolution', screenRes);
    
    const windowSize = `${window.innerWidth} × ${window.innerHeight}`;
    results.systemInfo.windowSize = windowSize;
    addDetail(systemSection, 'Window Size', windowSize);
    
    const pixelRatio = window.devicePixelRatio;
    results.systemInfo.pixelRatio = pixelRatio;
    addDetail(systemSection, 'Device Pixel Ratio', pixelRatio.toString());
    
    // 8. Check for common issues
    const issuesSection = addSection('Detected Issues & Recommendations');
    let issuesFound = false;
    
    // Check for cookies blocking
    try {
      const testCookie = 'testcookie_' + Math.random();
      document.cookie = `${testCookie}=1; path=/`;
      if (!document.cookie.includes(testCookie)) {
        issuesFound = true;
        addMessage(issuesSection, 'Cookies appear to be blocked. This will cause login issues.', 'error');
      }
    } catch (e) {
      issuesFound = true;
      addMessage(issuesSection, 'Cookie access error: ' + e.message, 'error');
    }
    
    // Check for localStorage blocking
    try {
      const testKey = 'test_' + Math.random();
      localStorage.setItem(testKey, '1');
      if (localStorage.getItem(testKey) !== '1') {
        issuesFound = true;
        addMessage(issuesSection, 'localStorage appears to be blocked.', 'error');
      }
      localStorage.removeItem(testKey);
    } catch (e) {
      issuesFound = true;
      addMessage(issuesSection, 'localStorage access error: ' + e.message, 'error');
    }
    
    // Check for service worker issues
    if (results.storageInfo.serviceWorkers && results.storageInfo.serviceWorkers.count > 0) {
      addMessage(issuesSection, 'Active service workers detected. These can sometimes cause caching issues.', 'info');
    }
    
    // Storage quota issues
    if (results.storageInfo.estimate && results.storageInfo.estimate.percent > 90) {
      issuesFound = true;
      addMessage(issuesSection, 'Browser storage is nearly full. This can cause errors.', 'error');
    }
    
    // Check for CORS issues
    const corsIssue = performance.getEntriesByType('resource').some(r => 
      r.name.includes(currentDomain) && r.duration === 0
    );
    
    if (corsIssue) {
      issuesFound = true;
      addMessage(issuesSection, 'Potential CORS issues detected with some resources.', 'error');
    }
    
    // Check for extension interference
    if ((browserName.includes('Chrome') || browserName.includes('Edge')) && !isIncognito) {
      addMessage(issuesSection, 'Browser extensions might be interfering with this site. Try incognito mode to verify.', 'info');
    }
    
    // Check for content blockers (common in Safari/Firefox)
    try {
      const testDiv = document.createElement('div');
      testDiv.id = 'ads_test_div';
      testDiv.style.display = 'none';
      document.body.appendChild(testDiv);
      
      if (!document.getElementById('ads_test_div')) {
        issuesFound = true;
        addMessage(issuesSection, 'Content/ad blocker detected that might interfere with site functionality.', 'error');
      }
      
      if (document.getElementById('ads_test_div')) {
        document.body.removeChild(testDiv);
      }
    } catch (e) {
      // Silent catch
    }
    
    // Check for HTTP vs HTTPS issues
    if (window.location.protocol === 'http:') {
      issuesFound = true;
      addMessage(issuesSection, 'Site is using insecure HTTP protocol. This can cause issues with modern browsers.', 'error');
    }
    
    // Check for private browsing/incognito storage limitations
    if (isIncognito || results.storageInfo.estimate && results.storageInfo.estimate.quota < 120000000) {
      addMessage(issuesSection, 'Detected limited storage quota, possibly due to private/incognito browsing.', 'info');
    }
    
    // Check for browser compatibility issues
    if (browserName === 'Safari' && !userAgent.includes('Version/16') && !userAgent.includes('Version/17')) {
      addMessage(issuesSection, 'Using older Safari version which may have compatibility issues with modern websites.', 'info');
    }
    
    // Check for outdated browsers - FIXED VERSION
    const chromeVersion = userAgent.match(/Chrome\/([0-9]+)/);
    const firefoxVersion = userAgent.match(/Firefox\/([0-9]+)/);
    const edgeVersion = userAgent.match(/Edg\/([0-9]+)/);
    
    if ((browserName === 'Chrome' && (!chromeVersion || parseInt(chromeVersion[1]) < 100)) ||
        (browserName === 'Firefox' && (!firefoxVersion || parseInt(firefoxVersion[1]) < 100)) ||
        (browserName === 'Edge' && (!edgeVersion || parseInt(edgeVersion[1]) < 100))) {
      issuesFound = true;
      addMessage(issuesSection, 'Using an outdated browser version which may cause compatibility issues.', 'error');
    }
    
    // 9. Try to capture any existing error messages on the page
    const errorCapture = () => {
      // Look for common error message containers
      const errorElements = [
        ...document.querySelectorAll('.error, .alert, .notification, [role="alert"], .message, .toast'),
        ...document.querySelectorAll('*[class*="error"], *[class*="alert"], *[id*="error"], *[id*="alert"]'),
        ...document.querySelectorAll('div.text-red, span.text-red, p.text-red')
      ];
      
      let errorMessages = [];
      
      errorElements.forEach(el => {
        if (el.textContent && el.textContent.trim() && 
            (el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0)) {
          const text = el.textContent.trim();
          
          // Look for error-like content
          if (/error|fail|invalid|denied|sorry|problem|issue|incorrect|oops|wrong/i.test(text)) {
            errorMessages.push(text);
          }
        }
      });
      
      // Check for error info in URL
      const url = new URL(window.location.href);
      const errorParams = ['error', 'err', 'message', 'msg', 'problem', 'issue'];
      errorParams.forEach(param => {
        if (url.searchParams.has(param)) {
          errorMessages.push(`URL Error Param: ${param}=${url.searchParams.get(param)}`);
        }
      });
      
      // Store errors globally so they can be included in reports
      if (errorMessages.length > 0) {
        window.lastErrorMessage = errorMessages.join('\n');
        return errorMessages;
      }
      
      return null;
    };
    
    // Look for visible errors on the page
    const visibleErrors = errorCapture();
    if (visibleErrors && visibleErrors.length > 0) {
      const errorSection = addSection('Detected Error Messages');
      visibleErrors.forEach(error => {
        addMessage(errorSection, error, 'error');
      });
    }
    
    // 10. Add action buttons
    const buttons = document.createElement('div');
    buttons.style.cssText = 'margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap;';
    panel.appendChild(buttons);
    
    // Clean button
    const cleanBtn = document.createElement('button');
    cleanBtn.textContent = 'Clean Storage';
    cleanBtn.style.cssText = `
      background: #4285f4;
      color: white;
      border: none;
      border-radius: 3px;
      padding: 8px 15px;
      cursor: pointer;
      margin-bottom: 5px;
    `;
    buttons.appendChild(cleanBtn);
    
    // Refresh button
    const refreshBtn = document.createElement('button');
    refreshBtn.textContent = 'Refresh Page';
    refreshBtn.style.cssText = `
      background: #34a853;
      color: white;
      border: none;
      border-radius: 3px;
      padding: 8px 15px;
      cursor: pointer;
      margin-bottom: 5px;
    `;
    refreshBtn.onclick = () => location.reload();
    buttons.appendChild(refreshBtn);
    
    // Copy logs button
    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy Report';
    copyBtn.style.cssText = `
      background: #fbbc05;
      color: white;
      border: none;
      border-radius: 3px;
      padding: 8px 15px;
      cursor: pointer;
      margin-bottom: 5px;
    `;
    buttons.appendChild(copyBtn);
    
    // Open Incognito button
    const incognitoBtn = document.createElement('button');
    incognitoBtn.textContent = 'Try in Incognito';
    incognitoBtn.style.cssText = `
      background: #673ab7;
      color: white;
      border: none;
      border-radius: 3px;
      padding: 8px 15px;
      cursor: pointer;
      margin-bottom: 5px;
    `;
    incognitoBtn.onclick = () => {
      // Generate incognito instructions based on browser
      let instructions = "Please open a ";
      if (browserName.includes("Chrome") || browserName.includes("Edge")) {
        instructions += "new incognito window (Ctrl+Shift+N) ";
      } else if (browserName.includes("Firefox")) {
        instructions += "new private window (Ctrl+Shift+P) ";
      } else if (browserName.includes("Safari")) {
        instructions += "new private window (Command+Shift+N) ";
      } else {
        instructions += "private/incognito window ";
      }
      instructions += `and navigate to ${window.location.href}`;
      
      alert(instructions);
    };
    buttons.appendChild(incognitoBtn);
    
    // Error log export button
    const errorLogBtn = document.createElement('button');
    errorLogBtn.textContent = 'Export Console Logs';
    errorLogBtn.style.cssText = `
      background: #ea4335;
      color: white;
      border: none;
      border-radius: 3px;
      padding: 8px 15px;
      cursor: pointer;
      margin-bottom: 5px;
    `;
    errorLogBtn.onclick = () => {
      // We can't directly access console logs, but we can set up a listener
      alert("To export console logs, please:\n\n1. Open DevTools (F12 or right-click > Inspect)\n2. Go to the Console tab\n3. Right-click in the console\n4. Select 'Save as...' to save all console messages");
    };
    buttons.appendChild(errorLogBtn);
    
    // Network test button
    const networkTestBtn = document.createElement('button');
    networkTestBtn.textContent = 'Test Network';
    networkTestBtn.style.cssText = `
      background: #0277bd;
      color: white;
      border: none;
      border-radius: 3px;
      padding: 8px 15px;
      cursor: pointer;
      margin-bottom: 5px;
    `;
    buttons.appendChild(networkTestBtn);

    // Dark mode toggle
    const darkModeBtn = document.createElement('button');
    darkModeBtn.textContent = 'Toggle Dark Mode';
    darkModeBtn.style.cssText = `
      background: #333;
      color: white;
      border: none;
      border-radius: 3px;
      padding: 8px 15px;
      cursor: pointer;
      margin-bottom: 5px;
    `;
    darkModeBtn.onclick = () => {
      const isDark = panel.style.backgroundColor === 'rgb(40, 40, 40)';
      
      if (isDark) {
        // Switch to light mode
        panel.style.backgroundColor = 'white';
        panel.style.color = 'black';
        
        // Update section headers
        const headers = panel.querySelectorAll('h3');
        headers.forEach(h => h.style.borderBottomColor = '#eee');
        
        darkModeBtn.style.backgroundColor = '#333';
        darkModeBtn.style.color = 'white';
        darkModeBtn.textContent = 'Toggle Dark Mode';
      } else {
        // Switch to dark mode
        panel.style.backgroundColor = 'rgb(40, 40, 40)';
        panel.style.color = 'rgb(220, 220, 220)';
        
        // Update section headers
        const headers = panel.querySelectorAll('h3');
        headers.forEach(h => h.style.borderBottomColor = '#555');
        
        darkModeBtn.style.backgroundColor = '#ccc';
        darkModeBtn.style.color = 'black';
        darkModeBtn.textContent = 'Toggle Light Mode';
      }
    };
    buttons.appendChild(darkModeBtn);
    
    // Add the panel to the document
    document.body.appendChild(panel);
    
    // Clean Storage functionality
    cleanBtn.addEventListener('click', async function() {
      const cleanSection = addSection('Storage Cleaning');
      
      try {
        // Show progress status
        const progressMsg = addMessage(cleanSection, 'Cleaning storage... Please wait.', 'info');
        
        // Clear localStorage
        const lsCount = localStorage.length;
        localStorage.clear();
        addMessage(cleanSection, `localStorage cleared (${lsCount} items)`, 'success');
        
        // Clear sessionStorage
        const ssCount = sessionStorage.length;
        sessionStorage.clear();
        addMessage(cleanSection, `sessionStorage cleared (${ssCount} items)`, 'success');
        
        // Clear cookies for this domain
        const cookies = document.cookie.split(';');
        if (cookies.length > 0 && cookies[0] !== '') {
          for (let cookie of cookies) {
            const cookieName = cookie.split('=')[0].trim();
            if (cookieName) {
              document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${currentDomain}`;
              document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            }
          }
          addMessage(cleanSection, `Cookies cleared (${cookies.length} cookies)`, 'success');
        } else {
          addMessage(cleanSection, 'No cookies found to clear', 'info');
        }
        
        // Update progress
        progressMsg.textContent = 'Cleaning storage... (50% complete)';
        
        // Clear IndexedDB
        if (window.indexedDB) {
          const dbs = await indexedDB.databases();
          if (dbs && dbs.length) {
            for (const db of dbs) {
              if (db.name) {
                indexedDB.deleteDatabase(db.name);
                addMessage(cleanSection, `IndexedDB "${db.name}" deleted`, 'success');
              }
            }
          } else {
            addMessage(cleanSection, 'No IndexedDB databases found', 'info');
          }
        }
        
        // Clear Service Workers
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          if (registrations.length) {
            for (const registration of registrations) {
              await registration.unregister();
              addMessage(cleanSection, 'Service worker unregistered', 'success');
            }
          } else {
            addMessage(cleanSection, 'No service workers found', 'info');
          }
        }
        
        // Update progress
        progressMsg.textContent = 'Cleaning storage... (75% complete)';
        
        // Clear Cache Storage
        if ('caches' in window) {
          const cacheKeys = await caches.keys();
          if (cacheKeys.length) {
            for (const key of cacheKeys) {
              await caches.delete(key);
              addMessage(cleanSection, `Cache "${key}" deleted`, 'success');
            }
          } else {
            addMessage(cleanSection, 'No caches found', 'info');
          }
        }
        
        // Remove the progress message
        cleanSection.removeChild(progressMsg);
        addMessage(cleanSection, '✅ Cleanup complete! Please refresh the page to test.', 'success');
        
      } catch (err) {
        addMessage(cleanSection, `Error during cleanup: ${err.message}`, 'error');
      }
    });
    
    // Copy logs functionality
    copyBtn.addEventListener('click', function() {
      try {
        // Format results as text
        let report = "BROWSER DIAGNOSTICS REPORT\n";
        report += "==========================\n\n";
        
        report += "Browser Information:\n";
        report += `-----------------\n`;
        report += `Browser: ${results.browserInfo.name}\n`;
        report += `User Agent: ${results.browserInfo.userAgent}\n`;
        report += `Incognito Mode: ${results.browserInfo.incognito ? 'Yes' : 'No'}\n`;
        if (results.browserInfo.timezone) {
          report += `Timezone: ${results.browserInfo.timezone}\n`;
        }
        if (results.browserInfo.language) {
          report += `Language: ${results.browserInfo.language}\n`;
        }
        report += `Do Not Track: ${results.browserInfo.doNotTrack ? 'Enabled' : 'Disabled'}\n\n`;
        
        report += "Site Information:\n";
        report += `-----------------\n`;
        report += `Domain: ${currentDomain}\n`;
        report += `URL: ${window.location.href}\n`;
        report += `Protocol: ${window.location.protocol}\n\n`;
        
        report += "Storage Information:\n";
        report += `-------------------\n`;
        if (results.storageInfo.localStorage) {
          report += `localStorage: ${results.storageInfo.localStorage.itemCount} items\n`;
        }
        if (results.storageInfo.sessionStorage) {
          report += `sessionStorage: ${results.storageInfo.sessionStorage.itemCount} items\n`;
        }
        if (results.storageInfo.cookies) {
          report += `Cookies: ${results.storageInfo.cookies.count}\n`;
        }
        if (results.storageInfo.indexedDB) {
          report += `IndexedDB: ${results.storageInfo.indexedDB.databases} databases\n`;
        }
        if (results.storageInfo.serviceWorkers) {
          report += `Service Workers: ${results.storageInfo.serviceWorkers.count}\n`;
        }
        if (results.storageInfo.estimate) {
          report += `Storage Used: ${results.storageInfo.estimate.used} MB of ${results.storageInfo.estimate.quota} MB (${results.storageInfo.estimate.percent}%)\n`;
        }
        
        report += "\nNetwork Information:\n";
        report += `-------------------\n`;
        if (results.networkInfo && results.networkInfo.connection) {
          const conn = results.networkInfo.connection;
          if (conn.type) report += `Connection Type: ${conn.type}\n`;
          if (conn.downlink) report += `Downlink Speed: ${conn.downlink} Mbps\n`;
          if (conn.rtt) report += `Round Trip Time: ${conn.rtt} ms\n`;
          if (conn.saveData !== undefined) report += `Data Saver: ${conn.saveData ? 'Enabled' : 'Disabled'}\n`;
        }
        
        report += "\nPerformance Information:\n";
        report += `----------------------\n`;
        if (results.performanceInfo) {
          if (results.performanceInfo.loadTime) report += `Page Load Time: ${results.performanceInfo.loadTime} ms\n`;
          if (results.performanceInfo.domContentLoaded) report += `DOM Content Loaded: ${results.performanceInfo.domContentLoaded} ms\n`;
          if (results.performanceInfo.ttfb) report += `Time to First Byte: ${results.performanceInfo.ttfb} ms\n`;
        }
        
        // Add system information
        report += "\nSystem Information:\n";
        report += `------------------\n`;
        report += `Screen Resolution: ${window.screen.width}x${window.screen.height}\n`;
        report += `Window Size: ${window.innerWidth}x${window.innerHeight}\n`;
        report += `Device Pixel Ratio: ${window.devicePixelRatio}\n`;
        report += `Platform: ${navigator.platform}\n`;
        
        // Add error info if available
        if (window.lastErrorMessage) {
          report += "\nDetected Error Messages:\n";
          report += `--------------------\n`;
          report += window.lastErrorMessage + "\n";
        }
        
        report += "\nReport generated at: " + new Date().toLocaleString();
        
        // Copy to clipboard
        navigator.clipboard.writeText(report).then(() => {
          alert("Diagnostic report copied to clipboard!");
        }).catch(err => {
          console.error("Failed to copy report: ", err);
          
          // Fallback method
          const textarea = document.createElement('textarea');
          textarea.value = report;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          alert("Diagnostic report copied to clipboard!");
        });
      } catch (e) {
        console.error("Error generating report: ", e);
        alert("Error generating report: " + e.message);
      }
    });
    
    // Screenshot functionality
    screenshotBtn.addEventListener('click', async function() {
      try {
        // Hide our panel before taking screenshot
        panel.style.display = 'none';
        
        // Small delay to ensure panel is hidden
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Create feedback text
        const feedback = document.createElement('div');
        feedback.textContent = 'Taking screenshot...';
        feedback.style.cssText = `
          position: fixed;
          top: 10px;
          right: 10px;
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 10px;
          border-radius: 5px;
          z-index: 999999;
        `;
        document.body.appendChild(feedback);
        
        // Force the browser to capture a screenshot via canvas (this is the best we can do from JS)
        try {
          // Use html2canvas if available
          if (typeof html2canvas === 'function') {
            html2canvas(document.body).then(canvas => {
              const link = document.createElement('a');
              link.download = `${currentDomain.replace(/\./g, '-')}-screenshot-${Date.now()}.png`;
              link.href = canvas.toDataURL('image/png');
              link.click();
              
              // Cleanup
              document.body.removeChild(feedback);
              panel.style.display = 'block';
            });
          } else {
            // Otherwise, use a workaround
            feedback.textContent = 'Screenshot functionality requires html2canvas library. Please use browser screenshot tools (F12 > screenshot).';
            setTimeout(() => {
              document.body.removeChild(feedback);
              panel.style.display = 'block';
            }, 3000);
          }
        } catch (e) {
          console.error('Screenshot error:', e);
          feedback.textContent = 'Cannot take screenshot. Please use your browser tools.';
          setTimeout(() => {
            document.body.removeChild(feedback);
            panel.style.display = 'block';
          }, 3000);
        }
      } catch (e) {
        console.error('Screenshot error:', e);
        panel.style.display = 'block';
      }
    });
    
    // Network test functionality
    networkTestBtn.addEventListener('click', async function() {
      const testSection = addSection('Network Test Results');
      addMessage(testSection, 'Running network tests...', 'info');
      
      // Add a status indicator
      const statusIndicator = document.createElement('div');
      statusIndicator.style.cssText = `
        margin: 10px 0;
        padding: 8px;
        background: #f0f0f0;
        border-radius: 4px;
        text-align: center;
      `;
      statusIndicator.textContent = 'Testing... (0/3)';
      testSection.appendChild(statusIndicator);
      
      // Hide the button during testing to prevent multiple clicks
      networkTestBtn.disabled = true;
      networkTestBtn.textContent = 'Testing...';
      
      try {
        // Test sequence
        const testEndpoints = [
          { name: 'Main Domain', url: window.location.origin, timeout: 5000 },
          { name: 'Google DNS', url: 'https://dns.google.com', timeout: 5000 },
          { name: 'Cloudflare', url: 'https://1.1.1.1', timeout: 5000 }
        ];
        
        let testCount = 0;
        
        for (const endpoint of testEndpoints) {
          try {
            addMessage(testSection, `Testing ${endpoint.name}...`, 'info');
            
            const startTime = performance.now();
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), endpoint.timeout);
            
            try {
              const response = await fetch(endpoint.url, { 
                method: 'HEAD',
                mode: 'no-cors',
                cache: 'no-store',
                signal: controller.signal
              });
              
              clearTimeout(timeoutId);
              const endTime = performance.now();
              const duration = Math.round(endTime - startTime);
              
              addMessage(testSection, `✅ ${endpoint.name}: ${duration}ms`, 'success');
            } catch (e) {
              clearTimeout(timeoutId);
              const endTime = performance.now();
              const duration = Math.round(endTime - startTime);
              
              if (e.name === 'AbortError') {
                addMessage(testSection, `❌ ${endpoint.name}: Timeout after ${endpoint.timeout}ms`, 'error');
              } else {
                addMessage(testSection, `❌ ${endpoint.name}: ${e.message} (${duration}ms)`, 'error');
              }
            }
            
            // Update status
            testCount++;
            statusIndicator.textContent = `Testing... (${testCount}/3)`;
          } catch (error) {
            addMessage(testSection, `❌ ${endpoint.name}: ${error.message}`, 'error');
          }
          
          // Small delay between tests
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Update status when complete
        statusIndicator.style.background = '#34a853';
        statusIndicator.style.color = 'white';
        statusIndicator.textContent = 'Testing complete!';
        
        // Get final conclusion
        const hasErrors = testSection.querySelectorAll('.error').length > 0;
        if (hasErrors) {
          addMessage(testSection, 'Network issues detected. This may be affecting your connection to the site.', 'error');
        } else {
          addMessage(testSection, 'Network appears to be working correctly!', 'success');
        }
      } catch (e) {
        addMessage(testSection, `Error during network test: ${e.message}`, 'error');
        statusIndicator.style.background = '#ea4335';
        statusIndicator.style.color = 'white';
        statusIndicator.textContent = 'Testing failed!';
      } finally {
        networkTestBtn.disabled = false;
        networkTestBtn.textContent = 'Test Network';
      }
    });
    
    // Generate recommendation section
    const recommendationsSection = addSection('Recommendations');
    
    if (!issuesFound) {
      addMessage(recommendationsSection, 'No critical issues detected. If you are still experiencing problems:', 'success');
    }
    
    addMessage(recommendationsSection, '1. Try clearing browser storage by clicking "Clean Storage" below', 'info');
    addMessage(recommendationsSection, '2. Refresh the page after cleaning storage', 'info');
    
    if ((browserName.includes('Chrome') || browserName.includes('Edge')) && !isIncognito) {
      addMessage(recommendationsSection, '3. Try using incognito mode to rule out extension interference', 'info');
    }
    
    addMessage(recommendationsSection, '4. If problems persist, try using a different browser', 'info');
    addMessage(recommendationsSection, '5. Consider copying this diagnostic report to share with technical support', 'info');
    
    // Add collapsible sections functionality
    document.querySelectorAll('#diagnostics-panel h3').forEach(header => {
      header.style.cursor = 'pointer';
      header.innerHTML += ' <span style="float:right">▼</span>';
      header.onclick = function() {
        const content = this.nextElementSibling;
        const arrow = this.querySelector('span');
        
        if (content.style.display === 'none') {
          content.style.display = 'block';
          arrow.textContent = '▼';
        } else {
          content.style.display = 'none';
          arrow.textContent = '▶';
        }
      };
    });
    
    console.log("✅ Browser diagnostics complete!");
    
  } catch (err) {
    console.error("❌ Error during diagnostics:", err);
  }
})();
