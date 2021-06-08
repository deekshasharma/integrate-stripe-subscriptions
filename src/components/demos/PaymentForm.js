import React, {useMemo, useState} from "react";
import {CardElement, useElements, useStripe} from "@stripe/react-stripe-js";
import useResponsiveFontSize from "../../useResponsiveFontSize";
import Spinner from "./Spinner";
const useOptions = () => {
  const fontSize = useResponsiveFontSize();
  const options = useMemo(
    () => ({
      style: {
        base: {
          fontSize,
          color: "#424770",
          letterSpacing: "0.025em",
          fontFamily: "Source Code Pro, monospace",
          "::placeholder": {
            color: "#aab7c4"
          }
        },
        invalid: {
          color: "#9e2146"
        }
      }
    }),
    [fontSize]
  );

  return options;
};


const customerInfo = {
  name: "Dave Aspray", billingEmail: "dave@gmail.com"
}

const billingDetails = {
  "name": "Dave Aspray",
  "email": "dave@gmail.com",
  "address": {
    city: "San Francisco",
    country: "US",
    postal_code: "94587",
    state: "California",
    line1: "456 Market Street"
  }
}

// const particlePlan = 'particle';
const atomPlan = 'atom';


const PaymentForm = () => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const options = useOptions();

  const createCustomer = async (customer) => {
    const settings = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: customer.billingEmail,
        name: customer.name,
        address: customer.address,
        metadata: customer.metadata
      }),
    };
    try{
      const customer = await fetch('http://localhost:3000/api/stripe/customer', settings)
      return await customer.json();
    }catch(error) {
      return error
    }
  }

  //TODO: Show error to the user with reason or update the payment method to retry invoice payment (using invoiceId)
  const addPaymentMethod = async (billingDetails, customerId, planName, isPaymentRetry, invoiceId) => {
    // Set up payment method for recurring usage
    const paymentMethodObject = await stripe.createPaymentMethod({type: 'card', card: elements.getElement(CardElement), billing_details: billingDetails});
    setShowSpinner(true);
    // Create the subscription
    const subscriptionObject = await createSubscription(customerId, paymentMethodObject.paymentMethod.id, planName);
    return await subscriptionObject.json();
  }


  const createSubscription = async (customerId, paymentMethodId, planName) => {
    const config = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId: customerId,
        paymentMethodId: paymentMethodId,
        planName: planName
      }),
    };
    try{
      return await fetch('http://localhost:3000/api/stripe/subscriptions', config)
    }catch(error) {
      return error
    }
  }

  const handleSubmit = async event => {
    event.preventDefault();
    if (!stripe || !elements) return;
    const response = await createCustomer(customerInfo);
    const customerId = response.customer.id;
    const latestInvoicePaymentIntentStatus = localStorage.getItem('latestInvoicePaymentIntentStatus');
    const planName = atomPlan
    if (latestInvoicePaymentIntentStatus === 'requires_payment_method') {
      const invoiceId = localStorage.getItem('latestInvoiceId');
      const isPaymentRetry = true;
      await addPaymentMethod(billingDetails, customerId, planName, isPaymentRetry, invoiceId); // create new payment method & retry payment on invoice with new payment method
    } else {
      const subscription = await addPaymentMethod(billingDetails, customerId, planName, false, null ); // create new payment method & create subscription
      if(subscription) {
        setShowSpinner(false);
        setShowFeedback(true);
      }

    }
  };

  return (
      <>
        {showSpinner && !showFeedback && <Spinner>Setting up your subscription...</Spinner>}
        {showFeedback && !showSpinner && <Feedback planName={atomPlan.toUpperCase()} />}
      {!showFeedback && !showSpinner && <form onSubmit={handleSubmit}>
      <label>
        Enter Card details
        <CardElement
          options={options}
          onReady={() => {
            console.log("CardElement [ready]");
          }}
          onChange={event => {
            console.log("CardElement [change]", event);
          }}
          onBlur={() => {
            console.log("CardElement [blur]");
          }}
          onFocus={() => {
            console.log("CardElement [focus]");
          }}
        />
      </label>
      <button type="submit" disabled={!stripe} style={{backgroundColor: "#FACBCF", color: "#4D525B"}}>
        Submit and enable billing
      </button>
    </form>}
    </>
  )
}

export default PaymentForm;

const Feedback = ({planName}) => {
  return <div>
    <h1> This credit card is added for Dave Aspray in Stripe.</h1>
    <h2> Dave is assigned to {planName} plan subscription</h2>
    <h6> He will be charged $299+usage on the 1st of every month. Check your stripe dashboard -> customers -> subscription to confirm this action.</h6>
  </div>
}
