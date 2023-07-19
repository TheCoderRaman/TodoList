/**
 * Export given data object to json file.
 *
 * @param Object dataToWrite
 * @param String fileName
 * @return void
 */
export const exportToJson = (dataToWrite = {}, fileName = "example.json") => {
  let contentType = "application/json;charset=utf-8;";

  if (!(window.navigator && window.navigator.msSaveOrOpenBlob)) {
    let a = document.createElement("a");

    a.target = "_blank";
    a.download = fileName;

    a.href = convertToDataUrl(
      contentType,dataToWrite
    );

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    return;
  }

  let blob = new Blob([decodeURIComponent(
      encodeURI(JSON.stringify(dataToWrite, undefined, 2))),
    ],{
        type: contentType,
    }
  );

  navigator.msSaveOrOpenBlob(blob, fileName);
};

/**
 * Convert given type and data to data url.
 * 
 * @param String contentType 
 * @param Object dataToWrite 
 * @return String
 */
const convertToDataUrl = (contentType,dataToWrite) => {
  return ("data:" + contentType + "," + 
      encodeURIComponent(JSON.stringify(dataToWrite, undefined, 2))
  );
};