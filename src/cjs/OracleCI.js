const fs = require("fs");
const path = require("path");
const os = require("os");
const oci_storage = require("oci-objectstorage");
const oci_common = require("oci-common");

const ConfigFile = path.resolve(os.homedir(), ".BdsProjectOCI.json");
let Config = {
  bucket: ""
};
if (fs.existsSync(ConfigFile)) Config = JSON.parse(fs.readFileSync(ConfigFile, "utf8"));
else {
  fs.writeFileSync(ConfigFile, JSON.stringify(Config, null, 2));
  fs.watchFile(ConfigFile, (curr, prev) => {
    Config = JSON.parse(fs.readFileSync(ConfigFile, "utf8"));
  });
}

async function Uploadbackups(__Buffer = Buffer.from("aa", "utf8"), ObjectName = "Backup.zip"){
  const provider = new oci_common.ConfigFileAuthenticationDetailsProvider();
  const client = new oci_storage.ObjectStorageClient({authenticationDetailsProvider: provider});
  const ClientNamespace = await client.getNamespace({});
  const putObjectResponse = await client.putObject({
    namespaceName: ClientNamespace.value,
    objectName: ObjectName,
    bucketName: Config.bucket,
    putObjectBody: __Buffer,
    contentLength: __Buffer.length
  });
  return putObjectResponse;
}

module.exports = {
  Uploadbackups,
}