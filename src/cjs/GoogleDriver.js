const { promisify } = require("util");
const { google } = require("googleapis");
const { authorize } = require("./Auth/Google");

async function Uploadbackups(__buffer = "Backup.zip", file_name = "Backup.zip", FolderID = ""){
  const auth = await authorize();
  const drive = google.drive({version: "v3", auth: auth});
  const drive_async = promisify(drive.files.create);
  const __ids = [];
  if (FolderID) __ids.push(FolderID);
  const DriveFile = await drive_async({
    resource: {
      name: file_name,
      parents: __ids
    },
    media: {
      mimeType: "application/octet-stream",
      body: __buffer
    },
    fields: "id"
  })
  console.log(`File URL: https://drive.google.com/file/d/${DriveFile.data.id}/`);
  return DriveFile.data;
};

module.exports = {
  Uploadbackups
}