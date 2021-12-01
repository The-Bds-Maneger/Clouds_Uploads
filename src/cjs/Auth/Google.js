const fs = require("fs");
const os = require("os");
const GoogleCertificate = require("../../Certificates/Google.json");
const { join } = require("path")
const { randomUUID } = require("crypto");
const { google } = require("googleapis");
const __open = require("open");

// Express middleware's and Express
const express = require("express");
const body_parser = require("body-parser");
const express_rate_limit = require("express-rate-limit");
const cors = require("cors");

// Sessions
const GoogleAuthSession = {};
const PathToToken = join(os.homedir(), ".BdsProjectGoogle.json");

function LoadExpress(app = express(), closer = app.listen(1221)){
  return new Promise(((resolve_promise, reject_promise) => {
    app.get(["/request", "/"], (req, res) => {
      const { client_id, client_secret } = GoogleCertificate.installed;
      const SessionCode = randomUUID().replace(/-/g, "");
      const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, `${req.protocol}://${req.headers.host || "localhost"}/save/${SessionCode}`);
      const RedirectUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: [
          "https://www.googleapis.com/auth/drive"
        ]
      });
      GoogleAuthSession[SessionCode] = oAuth2Client;
      return res.redirect(RedirectUrl);
    });
    app.get("/save/:SessionCode", (req, res) => {
      const { code } = req.query;
      const { SessionCode } = req.params;
      const oAuth2Client = GoogleAuthSession[SessionCode];
      
      // http://localhost:6899/save?code=********************************************************************&scope=https://www.googleapis.com/auth/drive
      oAuth2Client.getToken(code, (err, save_token) => {
        if (err) {
          console.error("Error accessing keys and saving, Error:", err);
          return reject_promise(closer());
        }
        // Save Token File
        fs.writeFile(PathToToken, JSON.stringify(save_token, null, 4), function (err){
          if (err) {
            console.error("We were unable to save json, please try again later");
            return reject_promise(closer());
          }
          res.json({
            "token": save_token,
            status: "success"
          })
          resolve_promise(closer.close());
        });
      });
    });
    app.all("*", ({res}) => res.redirect("/request"));
  }));
}

function RandomPort(){
  let Port = parseInt(Math.random().toString().replace(/[01]\./, "").slice(0, 4));
  if (Port > 1024 && Port < 2542) return Port;
  else return RandomPort();
}

async function authorize() {
  const { client_id, client_secret } = GoogleCertificate.installed;
  if (!(fs.existsSync(PathToToken))) {
    const port = RandomPort();
    const app = express();
    app.use(body_parser.json());
    app.use(body_parser.urlencoded({ extended: true }));
    app.use(express_rate_limit({windowMs: 1 * 60 * 1000, max: 100}));
    app.use(cors());
    console.log("Open Google API get Tokens on port:", port);
    if (process.stdout.isTTY) __open(`http://localhost:${port}/`);
    await LoadExpress(app, app.listen(port));
  }
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, "http://localhost:1932/SaveToken");
  oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(PathToToken, "utf8")));
  return oAuth2Client;
}

module.exports = {
  authorize
}