const paymentButtons = document.querySelectorAll(".pay-now");
const RAZORPAY_KEY_ID = "rzp_live_T7sluxkHPu57Wi";
const CREATE_ORDER_URL = "/create-razorpay-order";

function normalizeAmount(amount) {
  const value = Number(amount);
  return value < 1000 ? value * 100 : value;
}

async function createOrder(plan) {
  const response = await fetch(CREATE_ORDER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      plan: plan.name,
      amount: plan.amount,
      currency: "INR"
    })
  });

  if (!response.ok) {
    throw new Error("Order creation failed");
  }

  return response.json();
}

async function openRazorpayCheckout(plan) {
  if (!window.Razorpay) {
    alert("Payment gateway is loading. Please check your internet connection and try again.");
    return;
  }

  let order;

  try {
    order = await createOrder(plan);
  } catch (error) {
    alert(
      "Payment setup is incomplete. Please connect the Razorpay backend order API first.\n\n" +
      "Use the sample file: razorpay-server-sample.js"
    );
    console.error(error);
    return;
  }

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency || "INR",
    name: "ConnectHer",
    description: plan.description,
    image: "./Image.png",
    order_id: order.id,

    handler(response) {
      alert(
        `Payment successful!\nPlan: ${plan.name}\nPayment ID: ${response.razorpay_payment_id}\nOrder ID: ${response.razorpay_order_id}`
      );
    },

    prefill: {
      name: "",
      email: "",
      contact: ""
    },

    notes: {
      plan: plan.name,
      source: "ConnectHer landing page"
    },

    theme: {
      color: "#e50078"
    },

    modal: {
      ondismiss() {
        console.log(`${plan.name} payment checkout closed`);
      }
    }
  };

  const checkout = new Razorpay(options);
  checkout.open();
}

paymentButtons.forEach((button) => {
  button.addEventListener("click", () => {
    openRazorpayCheckout({
      name: button.dataset.plan,
      description: button.dataset.description,
      amount: normalizeAmount(button.dataset.amount)
    });
  });
});
