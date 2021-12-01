const path = require("path");
const fs = require("fs");
const os = require("os");
const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");

// Config File
const ConfigFile = path.resolve(os.homedir(), ".BdsProjectAzure.json");
let Config = {
  Blob: {
    Account: "",
    AccountKey: "",
    Container: ""
  }
};
if (fs.existsSync(ConfigFile)) Config = JSON.parse(fs.readFileSync(ConfigFile, "utf8"));
else {
  fs.writeFileSync(ConfigFile, JSON.stringify(Config, null, 2));
  fs.watchFile(ConfigFile, (curr, prev) => {
    Config = JSON.parse(fs.readFileSync(ConfigFile, "utf8"));
  });
}

// Upload Function
async function Uploadbackups(__Buffer = Buffer.from("aa", "utf8"), ObjectName = "Backup.zip") {
  const { Account, AccountKey, Container } = Config.Blob;
  const sharedKeyCredential = new StorageSharedKeyCredential(Account, AccountKey);
  const blobClient = new BlobServiceClient(`https://${Account}.blob.core.windows.net`, sharedKeyCredential).getContainerClient(Container)
  if (!(blobClient.exists())) await blobClient.create();
  const containerClient = blobClient.getBlockBlobClient(path.resolve(ObjectName));
  const Reponse = await containerClient.uploadData(__Buffer, {
    blockSize: 4 * 1024 * 1024,
    concurrency: 20
  });
  return Reponse;
}

module.exports = {
  Uploadbackups
}