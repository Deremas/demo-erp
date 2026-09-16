"use strict";

const http = require("http");
const next = require("next");
const { startProcessWatchdog } = require("./lib/process-watchdog.js");

process.chdir(__dirname);

const dev = false;
const port = Number(process.env.PORT || 3000);

if (!port || Number.isNaN(port)) {
  throw new Error("PORT is not set or invalid. Check Passenger/Node.js Selector.");
}

const app = next({
  dev,
  dir: __dirname,
  hostname: "0.0.0.0",
  port,
});

const handle = app.getRequestHandler();

startProcessWatchdog();

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    handle(req, res);
  });

  server.listen(port, "0.0.0.0", () => {
    console.log(`Next.js app is running on port ${port}`);
  });
}).catch((err) => {
  console.error("Failed to start Next.js app:", err);
  process.exit(1);
});
