chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'VERIFY_LISTING') {
    console.log("[StayVerify Background] Received VERIFY_LISTING for:", message.data.title);
    (async () => {
      try {
        const response = await fetch('http://localhost:3000/api/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(message.data)
        });

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();
        console.log("[StayVerify Background] Success response from server:", data);
        sendResponse({ success: true, data });
      } catch (error) {
        console.error("[StayVerify Background] Error verifying listing:", error);
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true; // Keep channel open for async response
  }
});
