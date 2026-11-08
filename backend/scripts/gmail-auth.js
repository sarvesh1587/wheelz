// One-time helper: get a Gmail API refresh token for the account that should
// send Wheelz emails.
//
//   1. Google Cloud console → APIs & Services → enable "Gmail API".
//   2. Credentials → Create OAuth client ID → type "Desktop app".
//   3. OAuth consent screen → publish the app ("In production"), otherwise
//      Google expires the refresh token after 7 days.
//   4. GMAIL_CLIENT_ID=... GMAIL_CLIENT_SECRET=... node scripts/gmail-auth.js
//   5. Open the printed link, sign in as the sender account, allow access.
//   6. Copy the printed GMAIL_REFRESH_TOKEN into Render's environment.
require("dotenv").config();
const http = require("http");
const { OAuth2Client } = require("google-auth-library");

const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET } = process.env;
if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET) {
  console.error("Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET first.");
  process.exit(1);
}

const PORT = 5055;
const redirectUri = `http://localhost:${PORT}/oauth2callback`;
const client = new OAuth2Client(GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, redirectUri);

const url = client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: ["https://www.googleapis.com/auth/gmail.send"],
});

const server = http.createServer(async (req, res) => {
  const { pathname, searchParams } = new URL(req.url, redirectUri);
  if (pathname !== "/oauth2callback") return res.end();
  try {
    const { tokens } = await client.getToken(searchParams.get("code"));
    res.end("Done. You can close this tab and go back to the terminal.");
    if (!tokens.refresh_token) {
      console.error("\nNo refresh token returned. Remove the app's access at https://myaccount.google.com/permissions and run again.");
    } else {
      console.log(`\nGMAIL_REFRESH_TOKEN=${tokens.refresh_token}\n`);
    }
  } catch (err) {
    res.end("Failed, see the terminal.");
    console.error(err.message);
  } finally {
    server.close();
  }
});

server.listen(PORT, () => {
  console.log("Open this link and sign in with the account that should send emails:\n");
  console.log(url);
});
