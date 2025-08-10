import axios from "axios";
import variables from "../global/variables.js";

const INTERVAL_MINUTES = 10;

const pingServer = async () => {
  await axios.get(`${variables.SERVER_URL}/ping`);
  console.log(`Server pinged successfully at ${new Date().toString()}!`);
};

console.log(`🚀 Auto-pinger has been enabled`);

setInterval(pingServer, INTERVAL_MINUTES * 60 * 1000);
