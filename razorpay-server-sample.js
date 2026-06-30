/*
  Razorpay backend sample for ConnectHer.

  Install:
    npm install express razorpay cors dotenv

  .env:
    RAZORPAY_KEY_ID=rzp_live_T7sluxkHPu57Wi
    RAZORPAY_KEY_SECRET=6nJJZawm0NjzvuixHkzlVpXS
    PORT=3000

  Run:
    node razorpay-server-sample.js

  Important:
    Keep RAZORPAY_KEY_SECRET only on the server. Never add it to frontend code.
*/

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Razorpay = require("razorpay");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const allowedPlans = {
  "Basic Access": 29900,
  "Plus Access": 39900,
  "Premium Access": 49900
};

app.post("/create-razorpay-order", async (req, res) => {
  try {
    const { plan, amount } = req.body;
    const expectedAmount = allowedPlans[plan];

    if (!expectedAmount || Number(amount) !== expectedAmount) {
      return res.status(400).json({ error: "Invalid plan amount" });
    }

    const order = await razorpay.orders.create({
      amount: expectedAmount,
      currency: "INR",
      receipt: `connecther_${Date.now()}`,
      notes: {
        plan,
        source: "ConnectHer landing page"
      }
    });

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to create Razorpay order" });
  }
});

app.listen(port, () => {
  console.log(`ConnectHer payment server running at http://localhost:${port}`);
});
