import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart, useDispatchCart } from '../components/ContextReducer';
import Navbar from '../components/Navbar2';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

const CheckoutForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cardError, setCardError] = useState(null);
  const [cart, setCart] = useState([]);
  const [billingAddress, setBillingAddress] = useState({
    firstName: '',
    lastName: '',
    company: '',
    country: '',
    streetAddress: '',
    apartment: '',
    city: '',
    province: '',
    postalCode: '',
    phone: '',
    email: '',
  });
  const [shippingAddress, setShippingAddress] = useState({ ...billingAddress });
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatchCart();
  const navigate = useNavigate();
  const [shippingMethod, setShippingMethod] = useState('Free');
  const getShippingCost = () => {
    switch (shippingMethod) {
      case 'Standard': return 9.99;
      case 'OneDay': return 15.0;
      default: return 0;
    }
  };


  useEffect(() => {
    const getCart = localStorage.getItem('cart');
    const getCartJson = JSON.parse(getCart);
    if (getCartJson && Array.isArray(getCartJson)) {
      const cartWithImages = getCartJson.map(item => ({
        ...item,
        image: item.image || 'https://via.placeholder.com/80',
      }));
      setCart(cartWithImages);
    }
  }, []);

  const calculateTotal2 = () => {
    let total = 0;
    cart.forEach((item) => {
      total += item.price;
    });
    return total;
  };
  const calculateTotal = () => {
    const subtotal = cart.reduce((total, item) => total + item.price * item.qty, 0);
    const tax = subtotal * 0.1; // 10% tax
    const shipping = getShippingCost();
    return subtotal + tax + shipping;
  };

  const handleCardChange = (event) => {
    if (event.error) {
      setCardError(event.error.message);
    } else {
      setCardError(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError("Stripe.js has not loaded yet. Please try again.");
      setLoading(false);
      return;
    }

    if (!billingAddress.firstName || !billingAddress.email || !billingAddress.phone) {
      setError("Please fill in all required billing address fields.");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Create a Payment Method
      const cardElement = elements.getElement(CardElement);
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: `${billingAddress.firstName} ${billingAddress.lastName}`,
          email: billingAddress.email,
          phone: billingAddress.phone,
          address: {
            line1: billingAddress.streetAddress,
            line2: billingAddress.apartment || '',
            city: billingAddress.city,
            state: billingAddress.province,
            postal_code: billingAddress.postalCode,
            country: billingAddress.country,
          },
        },
      });

      if (paymentMethodError) {
        setError(paymentMethodError.message || "Failed to create payment method.");
        setLoading(false);
        return;
      }

      const paymentMethodId = paymentMethod.id;

      // Step 2: Create a customer
      const amount = calculateTotal() * 100;
      const customerResponse = await fetch('https://jewelsshop.onrender.com/api/auth/create-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${billingAddress.firstName} ${billingAddress.lastName}`,
          email: billingAddress.email,
          phone: billingAddress.phone,
          address: {
            line1: billingAddress.streetAddress,
            line2: billingAddress.apartment || '',
            city: billingAddress.city,
            state: billingAddress.province,
            postal_code: billingAddress.postalCode,
            country: billingAddress.country,
          },
        }),
      });

      if (!customerResponse.ok) {
        throw new Error("Failed to create customer.");
      }

      const customerData = await customerResponse.json();
      const customerId = customerData.customerId;

      // Step 3: Send the payment method ID to the /payment endpoint
      const response = await fetch('https://jewelsshop.onrender.com/api/auth/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          customerId,
          paymentMethodId, // Send the payment method ID
          billingAddress: {
            name: billingAddress.firstName,
            address: {
              line1: billingAddress.streetAddress,
              line2: billingAddress.apartment || '',
              city: billingAddress.city,
              state: billingAddress.province,
              postal_code: billingAddress.postalCode,
              country: billingAddress.country,
            },
            email: billingAddress.email,
            phone: billingAddress.phone,
          },
          shippingAddress: {
            name: shippingAddress.firstName,
            address: {
              line1: shippingAddress.streetAddress,
              line2: shippingAddress.apartment || '',
              city: shippingAddress.city,
              state: shippingAddress.province,
              postal_code: shippingAddress.postalCode,
              country: shippingAddress.country,
            },
            email: shippingAddress.email,
            phone: shippingAddress.phone,
          },
          description: 'Export of 100 cotton t-shirts, size M, color blue',
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment intent.");
      }

      const responseData = await response.json();
      const clientSecret = responseData.clientSecret;

      if (!clientSecret) {
        setError("Client secret not found. Please try again.");
        setLoading(false);
        return;
      }

      // Step 4: Confirm the PaymentIntent (if needed, e.g., for 3D Secure)
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodId, // Use the same payment method ID
      });

      if (paymentError) {
        setError(paymentError.message || "An error occurred during payment. Please check your card details.");
        setLoading(false);
        return;
      }

      const userid = localStorage.getItem('userId');
      const useremail = localStorage.getItem('userEmail');
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        const checkoutResponse = await fetch("https://jewelsshop.onrender.com/api/auth/checkoutOrder", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userid,
            userEmail: useremail || billingAddress.email,
            orderItems: cart,
            email: billingAddress.email,
            orderDate: new Date().toDateString(),
            billingAddress: billingAddress,
            shippingAddress: shippingAddress,
            paymentMethod: 'Stripe',
            orderStatus: "Processing",
            shippingCost: 0,
            paymentStatus: "paid",
            shippingMethod: 'ByPost',
            totalAmount: paymentIntent.amount,
          }),
        });

        const checkoutData = await checkoutResponse.json();

        if (checkoutResponse.status === 200) {

          dispatch({ type: "DROP" });
          navigate('/thankyou');
        } else {
          setError("Failed to place order. Please try again.");
        }
      } else {
        setError("Payment processing failed. Please try again.");
      }
    } catch (error) {
      setError(error.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingAddress((prevState) => ({ ...prevState, [name]: value }));
    if (sameAsBilling) {
      setShippingAddress((prevState) => ({ ...prevState, [name]: value }));
    }
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSameAsBilling = (e) => {
    setSameAsBilling(e.target.checked);
    if (e.target.checked) {
      setShippingAddress({ ...billingAddress });
    }
  };

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <h1 className="mb-5 py-5">Checkout</h1>
        <div className="row g-4">
          {/* Main Content - Billing and Shipping */}
          <div className="col-lg-8">
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white py-3">
                <h4 className="mb-0 fw-bold">Billing Address</h4>
              </div>
              <div className="card-body">
                <form className='checkoutForm'>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="First name"
                        name="firstName"
                        value={billingAddress.firstName}
                        onChange={handleBillingChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Last name"
                        name="lastName"
                        value={billingAddress.lastName}
                        onChange={handleBillingChange}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Company Name (optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Company name"
                        name="company"
                        value={billingAddress.company}
                        onChange={handleBillingChange}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Country</label>
                      <select
                        className="form-control"
                        name="country"
                        value={billingAddress.country}
                        onChange={handleBillingChange}
                        required
                      >
                        <option value="">Select Country</option>
                        <option value="AU">Australia</option>
                        <option value="CA">Canada</option>
                        {/* Add more countries as needed */}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Street Address</label>
                      <input
                        type="text"
                        className="form-control mb-3"
                        placeholder="House number and street name"
                        name="streetAddress"
                        value={billingAddress.streetAddress}
                        onChange={handleBillingChange}
                        required
                      />
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Apartment, suite, unit, etc. (optional)"
                        name="apartment"
                        value={billingAddress.apartment}
                        onChange={handleBillingChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="City"
                        name="city"
                        value={billingAddress.city}
                        onChange={handleBillingChange}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Province/State</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Province/State"
                        name="province"
                        value={billingAddress.province}
                        onChange={handleBillingChange}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Postal Code</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Postal Code"
                        name="postalCode"
                        value={billingAddress.postalCode}
                        onChange={handleBillingChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Phone</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Phone Number"
                        name="phone"
                        value={billingAddress.phone}
                        onChange={handleBillingChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Email Address"
                        name="email"
                        value={billingAddress.email}
                        onChange={handleBillingChange}
                        required
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <div className="card shadow-sm border-0">
              <div className="card-header bg-white py-3">
                <h4 className="mb-0 fw-bold">Shipping Address</h4>
              </div>
              <div className="card-body">
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="sameAsBilling"
                    checked={sameAsBilling}
                    onChange={handleSameAsBilling}
                  />
                  <label className="form-check-label" htmlFor="sameAsBilling">
                    Same as Billing Address
                  </label>
                </div>
                {!sameAsBilling && (
                  <form>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">First Name</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="First name"
                          name="firstName"
                          value={shippingAddress.firstName}
                          onChange={handleShippingChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Last Name</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Last name"
                          name="lastName"
                          value={shippingAddress.lastName}
                          onChange={handleShippingChange}
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Company Name (optional)</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Company name"
                          name="company"
                          value={shippingAddress.company}
                          onChange={handleShippingChange}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Country</label>
                        <select
                          className="form-control"
                          name="country"
                          value={shippingAddress.country}
                          onChange={handleShippingChange}
                          required
                        >
                          <option value="">Select Country</option>
                          <option value="AU">Australia</option>
                          <option value="CA">Canada</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label">Street Address</label>
                        <input
                          type="text"
                          className="form-control mb-3"
                          placeholder="House number and street name"
                          name="streetAddress"
                          value={shippingAddress.streetAddress}
                          onChange={handleShippingChange}
                          required
                        />
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Apartment, suite, unit, etc. (optional)"
                          name="apartment"
                          value={shippingAddress.apartment}
                          onChange={handleShippingChange}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">City</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="City"
                          name="city"
                          value={shippingAddress.city}
                          onChange={handleShippingChange}
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Province/State</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Province/State"
                          name="province"
                          value={shippingAddress.province}
                          onChange={handleShippingChange}
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Postal Code</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Postal Code"
                          name="postalCode"
                          value={shippingAddress.postalCode}
                          onChange={handleShippingChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Phone</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Phone Number"
                          name="phone"
                          value={shippingAddress.phone}
                          onChange={handleShippingChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="Email Address"
                          name="email"
                          value={shippingAddress.email}
                          onChange={handleShippingChange}
                          required
                        />
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Order Summary and Payment */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm end-0" >
              <div className="card-header bg-white py-3">
                <h5 className="mb-0 fw-bold">Order Summary ({cart.length})</h5>
              </div>
              <div className="card-body">
                {cart.map((item, index) => (
                  <div key={index} className="d-flex align-items-center mb-3">
                    <div className="me-3">
                      <img
                        src={item.img}
                        alt={item.name}
                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '5px' }}
                      />
                    </div>
                    <div className="flex-grow-1">
                      <p className="mb-1 fw-medium">{item.name}</p>
                      <p className="mb-0 text-muted small">Size: {item.size}</p>
                      <p className="mb-0 text-muted small">Qty: {item.qty}</p>
                    </div>
                    <div className="text-end">
                      <p className="mb-0 fw-medium">${item.price.toFixed(2) }</p>
                    </div>
                  </div>
                ))}
                <hr />
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <span>${cart.reduce((total, item) => total + item.price, 0).toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax (10%)</span>
                  <span>${(cart.reduce((total, item) => total + item.price, 0) * 0.1).toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping</span>
                  <span>${getShippingCost().toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between fw-bold border-top pt-2">
  <span>Total Amount</span>
  <span>
    ${(
      cart.reduce((total, item) => total + item.price, 0) + 
      cart.reduce((total, item) => total + item.price, 0) * 0.1 + 
      getShippingCost()
    ).toFixed(2)}
  </span>
</div>


                <h5 className="mb-3">Payment Details</h5>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <CardElement
                      onChange={handleCardChange}
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': {
                              color: '#aab7c4',
                            },
                          },
                          invalid: {
                            color: '#9e2146',
                          },
                        },
                      }}
                    />
                  </div>
                  {cardError && <div className="alert alert-warning mb-3">{cardError}</div>}
                  {error && <div className="alert alert-danger mb-3">{error}</div>}
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="termsCheck"
                      required
                    />
                    <label className="form-check-label small" htmlFor="termsCheck">
                      I agree with Terms & Conditions
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-dark rounded-pill w-100"
                    disabled={!stripe || loading || cardError}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    ) : null}
                    {loading ? 'Processing...' : 'Pay Now'}
                  </button>
                </form>
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Shipping Method</label>
                <select
                  className="form-select"
                  value={shippingMethod}
                  onChange={(e) => setShippingMethod(e.target.value)}
                >
                  <option value="Free">Free Shipping</option>
                  <option value="Standard">Standard - $9.99</option>
                  <option value="OneDay">One Day - $15.00</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Custom CSS */}
      <style jsx>{`
        .card {
          border-radius: 10px;
          overflow: hidden;
        }

        .form-control {
          border-radius: 5px;
          border: 1px solid #ced4da;
          transition: border-color 0.3s ease;
        }

        .form-control:focus {
          border-color: #007bff;
          box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
        }

        .btn-dark {
          background-color: #212529;
          border-color: #212529;
          transition: all 0.3s ease;
        }

        .btn-dark:hover {
          background-color: #343a40;
          border-color: #343a40;
        }

        .position-fixed {
          z-index: 1000;
        }

        @media (max-width: 991px) {
          .position-fixed {
            position: static;
            width: 100% !important;
          }
        }
      `}</style>
    </>
  );
};

export default CheckoutForm;