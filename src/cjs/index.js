const GoogleDriver = require("./GoogleDriver");
const Oracle = require("./OracleCI");
const Azure = require("./Azure");

class UploadFile {
  constructor(buffer = Buffer.from("list", "utf8"), file_name = "", GD = false, OCI = false, Az = false) {
    if (!file_name) throw new Error("File Name is required");
    if (!buffer) throw new Error("Buffer is required");
    if (!(Buffer.isBuffer(buffer))) throw new Error("Buffer is not a buffer");
    const ReturnFunction = {};
    ReturnFunction.upload = {
      GoogleDriver: true,
      OracleCloudInfrastructure: true,
      Azure: true
    };
    ReturnFunction.Result = {};
    ReturnFunction.CloudPath = {
      GoogleDriver: "",
      OracleCloudInfrastructure: "",
      Azure: ""
    };
    ReturnFunction.Start = async () => {
      // Upload to Google Driver
      if (ReturnFunction.upload.GoogleDriver) {
        try {
          ReturnFunction.Result.GoogleDriver = await GoogleDriver.Uploadbackups(buffer, ReturnFunction.CloudPath.GoogleDriver);
        } catch (err) {
          console.log(err);
          ReturnFunction.Result.GoogleDriver = String(err);
        }
      }
      // Upload to Oracle Cloud Infrastructure
      if (ReturnFunction.upload.OracleCloudInfrastructure) {
        try {
          ReturnFunction.Result.OracleCloudInfrastructure = await Oracle.Uploadbackups(buffer, ReturnFunction.CloudPath.OracleCloudInfrastructure);
        } catch (err) {
          console.log(err);
          ReturnFunction.Result.OracleCloudInfrastructure = String(err);
        }
      }
      // Upload to Azure
      if (ReturnFunction.upload.Azure) {
        try {
          ReturnFunction.Result.Azure = await Azure.Uploadbackups(buffer, ReturnFunction.CloudPath.Azure);
        } catch (err) {
          console.log(err);
          ReturnFunction.Result.Azure = String(err);
        }
      }

      // Return the result
      return ReturnFunction;
    }
    return ReturnFunction;
  }
}

module.exports = UploadFile;