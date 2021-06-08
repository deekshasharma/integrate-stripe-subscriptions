import React from "react";
import ReactDOM from "react-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { BrowserRouter } from "react-router-dom";
import ElementDemos from "./components/ElementDemos";
import PaymentForm from "./components/demos/PaymentForm";
import "./styles.css";

// console.log(process.env.STRIPE_PUBLISHABLE_KEY);
const stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY);

const demos = [
  {
    path: "/payment",
    label: "PaymentForm",
    component: PaymentForm
  }
];

const App = () => {
  return (
    <BrowserRouter>
      <Elements stripe={stripePromise}>
        <ElementDemos demos={demos} />
      </Elements>
    </BrowserRouter>
  );
};

const rootElement = document.getElementById("root");

ReactDOM.render(<App />, rootElement);
