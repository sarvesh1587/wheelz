// frontend/src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleReCaptchaProvider } from "@google-recaptcha/react";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <GoogleReCaptchaProvider
      type="v3"
      siteKey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
      language="en"
    >
      <App />
    </GoogleReCaptchaProvider>
  </React.StrictMode>,
);
