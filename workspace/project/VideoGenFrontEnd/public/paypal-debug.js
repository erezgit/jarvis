window.addEventListener("load", () => { console.log("PayPal Debug - Window Loaded", { windowPayPal: !!window.paypal, envVars: { sandbox: import.meta.env.VITE_PAYPAL_CLIENT_ID_SANDBOX } }); });
