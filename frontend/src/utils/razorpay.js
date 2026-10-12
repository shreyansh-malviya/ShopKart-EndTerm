const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

let loadingPromise = null;

// Loads Razorpay Standard Checkout once. Resolves to true/false instead of assuming
// window.Razorpay exists, so the UI can show a proper error if the script is blocked.
export const loadRazorpayScript = () => {
  if (window.Razorpay) return Promise.resolve(true);
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => {
      script.remove();
      loadingPromise = null; // allow a retry later
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return loadingPromise;
};
