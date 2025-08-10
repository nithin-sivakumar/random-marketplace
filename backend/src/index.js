import http from "http";
import app from "./app.js";
import variables from "./global/variables.js";
import connectToDb from "./connections/db.js";
import "./jobs/autopost.js";

const server = http.createServer(app);

const PORT = variables.PORT;

connectToDb().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running on: http://localhost:${PORT}`);
  });
});
