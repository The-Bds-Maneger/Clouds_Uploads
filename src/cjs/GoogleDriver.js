const util = require("util");
const { google } = require("googleapis");
const { authorize } = require("./Auth/Google");

async function Uploadbackups(__buffer = "Backup.zip", FileName = "Backup.zip", FolderID = ""){
  if (!FileName) throw new Error("FileName is required");
  const drive_async = util.promisify((google.drive({version: "v3", auth: await authorize()})).files.create);
  const resource = {name: FileName};
  if (FolderID) resource.parents = [FolderID];
  const DriveFile = await drive_async({
    fields: "id",
    resource: resource,
    media: {
      mimeType: "application/octet-stream",
      body: __buffer
    }
  });
  console.log(`File URL: https://drive.google.com/file/d/${DriveFile.data.id}/`);
  return DriveFile.data;
};

module.exports = {
  Uploadbackups
}