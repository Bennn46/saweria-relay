const express = require("express");
const { createMiddleware } = require("saweria-webhook-express");

const app = express();
const verify = createMiddleware(process.env.STREAM_KEY, { camelCase: true });

let queue = [];
let seq = 0;

app.use(express.json());

app.post("/webhook", verify, (req, res) => {
  const b = req.body;
  if (b.type === "donation") {
    queue.push({
      id: ++seq,
      name: b.donatorName || "Anonymous",
      amount: b.amountRaw || 0,
      message: b.message || "",
    });
    if (queue.length > 200) queue.shift();
  }
  res.sendStatus(200);
});

app.get("/poll", (req, res) => {
  if (req.query.key !== process.env.ROBLOX_SECRET) return res.sendStatus(401);
  const after = Number(req.query.after) || 0;
  res.json(queue.filter((d) => d.id > after));
});

app.get("/", (_, res) => res.send("ok"));
app.listen(process.env.PORT || 8080);
