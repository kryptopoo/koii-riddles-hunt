const { default: axios } = require('axios');

const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const getJSONFromCID = async (
  cid,
  fileName,
  maxRetries = 10,
  retryDelay = 3000,
) => {
  let url = `https://${cid}.ipfs.sphn.link/${fileName}`;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.get(url);
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.log(
        `Attempt connecting IPFS ${attempt} failed: ${error.message}`,
      );
      if (attempt < maxRetries) {
        console.log(
          `Waiting for ${retryDelay / 1000} seconds before retrying...`,
        );
        await sleep(retryDelay);
      } else {
        return false; // Rethrow the last error
      }
    }
  }
};

module.exports = { getJSONFromCID };
