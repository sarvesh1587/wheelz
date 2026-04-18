require("dotenv").config();
const Razorpay = require("razorpay");

console.log("Testing Razorpay connection...");
console.log("Key ID:", process.env.RAZORPAY_KEY_ID ? "✓ Present" : "✗ Missing");
console.log(
  "Key Secret:",
  process.env.RAZORPAY_KEY_SECRET ? "✓ Present" : "✗ Missing",
);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function testOrder() {
  try {
    const order = await razorpay.orders.create({
      amount: 10000, // ₹100 in paise
      currency: "INR",
      receipt: "test_receipt",
    });
    console.log("✅ Razorpay working! Order created:", order.id);
  } catch (error) {
    console.error("❌ Razorpay error:", error.message);
    console.error("Full error:", error);
  }
}

testOrder();
