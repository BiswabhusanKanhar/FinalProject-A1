import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const PaymentPage = () => {
  const [method, setMethod] = useState("card");
  const [name, setName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePayment = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      alert("Payment successful! 🎉 Welcome to SmartPrep Premium");
      navigate("/");
    }, 1500);
  };

  return (
    <div className="container py-5">
        <div className="d-flex justify-content-end">
            <button
                className="btn btn-outline-secondary mb-3"
                onClick={() => navigate("/")}
            >
                 ⬅ Back to Home
            </button>
        </div>

      <div className="card shadow-lg p-4 mx-auto" style={{ maxWidth: "520px" }}>
        <h2 className="text-center text-primary mb-3">Upgrade to SmartPrep Premium</h2>
        <p className="text-center">Choose a payment method below – ₹199/month 📚</p>

        <div className="btn-group w-100 mb-4" role="group">
          <button
            type="button"
            className={`btn ${method === "card" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setMethod("card")}
          >
            Card
          </button>
          <button
            type="button"
            className={`btn ${method === "upi" ? "btn-success" : "btn-outline-success"}`}
            onClick={() => setMethod("upi")}
          >
            UPI
          </button>
        </div>

        <form onSubmit={handlePayment}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Priya Patel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {method === "card" ? (
            <>
              <div className="mb-3">
                <label className="form-label">Card Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  required
                  maxLength={19}
                />
              </div>

              <div className="row mb-3">
                <div className="col">
                  <label className="form-label">Expiry</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    required
                    maxLength={5}
                  />
                </div>
                <div className="col">
                  <label className="form-label">CVV</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="***"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    required
                    maxLength={3}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="mb-3">
              <label className="form-label">UPI ID</label>
              <input
                type="text"
                className="form-control"
                placeholder="example@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                required
              />
            </div>
          )}

          <button
            type="submit"
            className={`btn w-100 ${method === "card" ? "btn-primary" : "btn-success"}`}
            disabled={loading}
          >
            {loading ? "Processing..." : `Pay ₹199 via ${method.toUpperCase()}`}
          </button>
        </form>

        <div className="text-center text-muted mt-3">
          <small>This is a demo screen. No actual payment is processed.</small>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
