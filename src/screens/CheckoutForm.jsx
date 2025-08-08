import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart, useDispatchCart } from '../components/ContextReducer';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

// Australian address data (simplified for demonstration)
const australianStates = [
  { code: 'NSW', name: 'New South Wales', postalRange: ['2000', '2999'] },
  { code: 'VIC', name: 'Victoria', postalRange: ['3000', '3999'] },
  { code: 'QLD', name: 'Queensland', postalRange: ['4000', '4999'] },
  { code: 'WA', name: 'Western Australia', postalRange: ['6000', '6999'] },
  { code: 'SA', name: 'South Australia', postalRange: ['5000', '5999'] },
  { code: 'TAS', name: 'Tasmania', postalRange: ['7000', '7999'] },
  { code: 'ACT', name: 'Australian Capital Territory', postalRange: ['2600', '2699'] },
  { code: 'NT', name: 'Northern Territory', postalRange: ['0800', '0999'] },
];

// Sample cities by state (extend for production)
const australianCities = {
  NSW: ['Sydney', 'Newcastle', 'Wollongong'],
  VIC: ['Melbourne', 'Geelong', 'Ballarat'],
  QLD: ['Brisbane', 'Gold Coast', 'Cairns'],
  WA: ['Perth', 'Fremantle', 'Broome'],
  SA: ['Adelaide', 'Mount Gambier', 'Whyalla'],
  TAS: ['Hobart', 'Launceston', 'Devonport'],
  ACT: ['Canberra'],
  NT: ['Darwin', 'Alice Springs'],
};

// 🔹 Shipping options (new)
const SHIPPING_OPTIONS = [
  { id: 'economy', name: 'Economy', price: 6, days: 25, label: '$6 - 25 days' },
  { id: 'priority', name: 'Priority', price: 15, days: 15, label: '$15 - 15 days' },
  { id: 'Free', name: 'Free', price: 0, days: 15, label: '$0 - 35 days' },
];

const CheckoutForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cardError, setCardError] = useState(null);
  const [cart, setCart] = useState([]);

  // Geo lists + flags
  const [countries, setCountries] = useState([]); // [{name, code}]
  const [geoLoading, setGeoLoading] = useState({
    countries: false,
    billingStates: false,
    billingCities: false,
    shippingStates: false,
    shippingCities: false,
  });
  const [billingStatesList, setBillingStatesList] = useState([]); // generic (non-AU)
  const [billingCitiesList, setBillingCitiesList] = useState([]);
  const [shippingStatesList, setShippingStatesList] = useState([]);
  const [shippingCitiesList, setShippingCitiesList] = useState([]);

  const [billingAddress, setBillingAddress] = useState({
    firstName: '',
    lastName: '',
    company: '',
    country: '',      // ISO-2 (e.g., "AU")
    countryName: '',  // Human name (e.g., "Australia")
    streetAddress: '',
    apartment: '',
    city: '',
    province: '',
    postalCode: '',
    phone: '',
    email: '',
  });
  const [shippingAddress, setShippingAddress] = useState({ 
    firstName: '',
    lastName: '',
    company: '',
    country: '',
    countryName: '',
    streetAddress: '',
    apartment: '',
    city: '',
    province: '',
    postalCode: '',
    phone: '',
    email: '',
  });

  const [sameAsBilling, setSameAsBilling] = useState(true);

  // 🔹 Selected shipping option (new)
  const [shippingOption, setShippingOption] = useState(SHIPPING_OPTIONS[0].id);

  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatchCart();
  const [billingErrors, setBillingErrors] = useState({});
  const [shippingErrors, setShippingErrors] = useState({});
  const navigate = useNavigate();

  const getShippingCost = () => {
    const opt = SHIPPING_OPTIONS.find(o => o.id === shippingOption);
    return opt ? opt.price : 0;
  };

  const getEstimatedDays = () => {
    const opt = SHIPPING_OPTIONS.find(o => o.id === shippingOption);
    return opt ? opt.days : null;
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + parseFloat(item.price), 0);
  };

  const userid = localStorage.getItem('userId');

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

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = subtotal * 0.1; // 10% GST
    const shipping = getShippingCost();
    return parseFloat((subtotal + tax + shipping).toFixed(2));
  };

  // Load countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setGeoLoading(s => ({ ...s, countries: true }));
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2');
        const data = await res.json();
        const list = data
          .map(c => ({ name: c?.name?.common, code: c?.cca2 }))
          .filter(c => c.name && c.code)
          .sort((a, b) => a.name.localeCompare(b.name));
        setCountries(list);
      } catch (e) {
        console.error('Countries load failed', e);
      } finally {
        setGeoLoading(s => ({ ...s, countries: false }));
      }
    };
    fetchCountries();
  }, []);

  // States/cities helpers
  const fetchStates = async (countryName, isBilling = true) => {
    if (!countryName) return;
    const key = isBilling ? 'billingStates' : 'shippingStates';
    try {
      setGeoLoading(s => ({ ...s, [key]: true }));
      const res = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: countryName })
      });
      const json = await res.json();
      const states = json?.data?.states?.map(s => s?.name).filter(Boolean) || [];
      if (isBilling) setBillingStatesList(states);
      else setShippingStatesList(states);
    } catch (e) {
      console.error('States load failed', e);
      if (isBilling) setBillingStatesList([]);
      else setShippingStatesList([]);
    } finally {
      setGeoLoading(s => ({ ...s, [key]: false }));
    }
  };

  const fetchCities = async (countryName, stateName, isBilling = true) => {
    if (!countryName || !stateName) return;
    const key = isBilling ? 'billingCities' : 'shippingCities';
    try {
      setGeoLoading(s => ({ ...s, [key]: true }));
      const res = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: countryName, state: stateName })
      });
      const json = await res.json();
      const cities = Array.isArray(json?.data) ? json.data : [];
      if (isBilling) setBillingCitiesList(cities);
      else setShippingCitiesList(cities);
    } catch (e) {
      console.error('Cities load failed', e);
      if (isBilling) setBillingCitiesList([]);
      else setShippingCitiesList([]);
    } finally {
      setGeoLoading(s => ({ ...s, [key]: false }));
    }
  };

  const handleCardChange = (event) => {
    if (event.error) setCardError(event.error.message);
    else setCardError(null);
  };

  const validateAustralianAddress = (address, isBilling = true) => {
    const errors = {};
    if (address.country === 'AU') {
      if (!australianStates.some(s => s.code === address.province)) {
        errors.province = 'Please select a valid Australian state/territory.';
      }
      if (!australianCities[address.province]?.includes(address.city)) {
        errors.city = 'Please select a valid city for the selected state.';
      }
      const postalCode = address.postalCode;
      const state = australianStates.find(s => s.code === address.province);
      if (
        !postalCode.match(/^\d{4}$/) ||
        !state ||
        parseInt(postalCode, 10) < parseInt(state.postalRange[0], 10) ||
        parseInt(postalCode, 10) > parseInt(state.postalRange[1], 10)
      ) {
        errors.postalCode = `Please enter a valid 4-digit postal code for ${state?.name || 'the selected state'}.`;
      }
    }
    isBilling ? setBillingErrors(errors) : setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAddress = (address) => {
    return (
      address.firstName &&
      address.lastName &&
      address.email &&
      address.phone &&
      address.streetAddress &&
      address.city &&
      address.province &&
      address.postalCode &&
      address.country
    );
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

    if (!validateAddress(billingAddress)) {
      setError("Please fill in all required billing address fields.");
      setLoading(false);
      return;
    }

    if (!sameAsBilling && !validateAddress(shippingAddress)) {
      setError("Please fill in all required shipping address fields.");
      setLoading(false);
      return;
    }

    if (billingAddress.country === 'AU' && !validateAustralianAddress(billingAddress, true)) {
      setError("Please correct the billing address errors.");
      setLoading(false);
      return;
    }

    if (!sameAsBilling && shippingAddress.country === 'AU' && !validateAustralianAddress(shippingAddress, false)) {
      setError("Please correct the shipping address errors.");
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
      const amount = calculateTotal();

      const customerResponse = await fetch('https://jewelsshop.onrender.com/api/auth/create-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      if (!customerResponse.ok) throw new Error("Failed to create customer.");

      const customerData = await customerResponse.json();
      const customerId = customerData.customerId;

      // Step 3: Payment intent
      const response = await fetch('https://jewelsshop.onrender.com/api/auth/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          customerId,
          uemail: billingAddress.email,
          paymentMethodId,
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
            name: (sameAsBilling ? billingAddress.firstName : shippingAddress.firstName),
            address: {
              line1: (sameAsBilling ? billingAddress.streetAddress : shippingAddress.streetAddress),
              line2: (sameAsBilling ? billingAddress.apartment : shippingAddress.apartment) || '',
              city: (sameAsBilling ? billingAddress.city : shippingAddress.city),
              state: (sameAsBilling ? billingAddress.province : shippingAddress.province),
              postal_code: (sameAsBilling ? billingAddress.postalCode : shippingAddress.postalCode),
              country: (sameAsBilling ? billingAddress.country : shippingAddress.country),
            },
            email: (sameAsBilling ? billingAddress.email : shippingAddress.email),
            phone: (sameAsBilling ? billingAddress.phone : shippingAddress.phone),
          },
          description: 'Trezoar Payment',
        }),
      });

      if (!response.ok) throw new Error("Failed to create payment intent.");

      const responseData = await response.json();
      const clientSecret = responseData.clientSecret;

      if (!clientSecret) {
        setError("Client secret not found. Please try again.");
        setLoading(false);
        return;
      }

      // Step 4: Confirm
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodId,
      });

      if (paymentError) {
        setError(paymentError.message || "An error occurred during payment. Please check your card details.");
        setLoading(false);
        return;
      }

      const useremail = localStorage.getItem('userEmail');
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        const chosen = SHIPPING_OPTIONS.find(o => o.id === shippingOption);

        const checkoutResponse = await fetch("https://jewelsshop.onrender.com/api/auth/checkoutOrder", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userid,
            userEmail: billingAddress.email || useremail,
            orderItems: cart,
            orderId: responseData.orderId,
            email: billingAddress.email,
            orderDate: new Date().toDateString(),
            billingAddress: billingAddress,
            shippingAddress: sameAsBilling ? billingAddress : shippingAddress,
            paymentMethod: 'Stripe',
            orderStatus: "Pending",
            shippingCost: getShippingCost(),
            paymentStatus: "pending",
            // 🔹 include the chosen method details
            shippingMethod: chosen?.name || 'Economy',
            estimatedDays: chosen?.days || 25,
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

  // Smart change handlers that also fetch states/cities
  const handleBillingChange = (e) => {
    const { name, value } = e.target;

    if (name === 'country') {
      const selected = countries.find(c => c.code === value);
      const countryName = selected?.name || '';
      const updated = {
        ...billingAddress,
        country: value,
        countryName,
        province: '',
        city: '',
        postalCode: '',
      };
      setBillingAddress(updated);
      setBillingStatesList([]);
      setBillingCitiesList([]);

      if (sameAsBilling) {
        setShippingAddress(prev => ({
          ...prev,
          country: value,
          countryName,
          province: '',
          city: '',
          postalCode: '',
        }));
        setShippingStatesList([]);
        setShippingCitiesList([]);
      }

      if (value !== 'AU' && countryName) fetchStates(countryName, true);
      return;
    }

    if (name === 'province') {
      const updated = { ...billingAddress, province: value, city: '' };
      setBillingAddress(updated);
      if (billingAddress.country !== 'AU' && billingAddress.countryName && value) {
        setBillingCitiesList([]);
        fetchCities(billingAddress.countryName, value, true);
      }
      if (sameAsBilling) {
        setShippingAddress(prev => ({ ...prev, province: value, city: '' }));
        if (billingAddress.country !== 'AU' && billingAddress.countryName && value) {
          setShippingCitiesList([]);
          fetchCities(billingAddress.countryName, value, false);
        }
      }
      return;
    }

    setBillingAddress((prevState) => ({ ...prevState, [name]: value }));
    if (sameAsBilling) {
      setShippingAddress((prevState) => ({ ...prevState, [name]: value }));
    }
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;

    if (name === 'country') {
      const selected = countries.find(c => c.code === value);
      const countryName = selected?.name || '';
      setShippingAddress(prev => ({
        ...prev,
        country: value,
        countryName,
        province: '',
        city: '',
        postalCode: '',
      }));
      setShippingStatesList([]);
      setShippingCitiesList([]);
      if (value !== 'AU' && countryName) fetchStates(countryName, false);
      return;
    }

    if (name === 'province') {
      setShippingAddress(prev => ({ ...prev, province: value, city: '' }));
      if (shippingAddress.country !== 'AU' && shippingAddress.countryName && value) {
        setShippingCitiesList([]);
        fetchCities(shippingAddress.countryName, value, false);
      }
      return;
    }

    setShippingAddress((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSameAsBilling = (e) => {
    setSameAsBilling(e.target.checked);
    if (e.target.checked) {
      setShippingAddress({ ...billingAddress });
      setShippingStatesList(billingStatesList);
      setShippingCitiesList(billingCitiesList);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <h1 className="mb-5 py-5">Checkout</h1>
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white py-3">
                <h4 className="mb-0 fw-bold">Billing Address</h4>
              </div>
              <div className="card-body">
                <form className="checkoutForm">
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
                        <option value="">
                          {geoLoading.countries ? 'Loading countries…' : 'Select Country'}
                        </option>
                        {countries.map((c) => (
                          <option key={c.code} value={c.code}>{c.name}</option>
                        ))}
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
                      <label className="form-label">Province/State</label>
                      {billingAddress.country === 'AU' ? (
                        <select
                          className="form-control"
                          name="province"
                          value={billingAddress.province}
                          onChange={handleBillingChange}
                          required
                        >
                          <option value="">Select State/Territory</option>
                          {australianStates.map((state) => (
                            <option key={state.code} value={state.code}>
                              {state.name}
                            </option>
                          ))}
                        </select>
                      ) : billingStatesList.length > 0 ? (
                        <select
                          className="form-control"
                          name="province"
                          value={billingAddress.province}
                          onChange={handleBillingChange}
                          required
                        >
                          <option value="">
                            {geoLoading.billingStates ? 'Loading states…' : 'Select State/Province'}
                          </option>
                          {billingStatesList.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Province/State"
                          name="province"
                          value={billingAddress.province}
                          onChange={handleBillingChange}
                          required
                        />
                      )}
                      {billingErrors.province && (
                        <div className="text-danger small">{billingErrors.province}</div>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">City</label>
                      {billingAddress.country === 'AU' && billingAddress.province ? (
                        <select
                          className="form-control"
                          name="city"
                          value={billingAddress.city}
                          onChange={handleBillingChange}
                          required
                        >
                          <option value="">Select City</option>
                          {australianCities[billingAddress.province]?.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                      ) : billingCitiesList.length > 0 ? (
                        <select
                          className="form-control"
                          name="city"
                          value={billingAddress.city}
                          onChange={handleBillingChange}
                          required
                        >
                          <option value="">
                            {geoLoading.billingCities ? 'Loading cities…' : 'Select City'}
                          </option>
                          {billingCitiesList.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          className="form-control"
                          placeholder="City"
                          name="city"
                          value={billingAddress.city}
                          onChange={handleBillingChange}
                          required
                        />
                      )}
                      {billingErrors.city && (
                        <div className="text-danger small">{billingErrors.city}</div>
                      )}
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
                      {billingErrors.postalCode && (
                        <div className="text-danger small">{billingErrors.postalCode}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
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
                          <option value="">
                            {geoLoading.countries ? 'Loading countries…' : 'Select Country'}
                          </option>
                          {countries.map((c) => (
                            <option key={c.code} value={c.code}>{c.name}</option>
                          ))}
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
                        <label className="form-label">Province/State</label>
                        {shippingAddress.country === 'AU' ? (
                          <select
                            className="form-control"
                            name="province"
                            value={shippingAddress.province}
                            onChange={handleShippingChange}
                            required
                          >
                            <option value="">Select State/Territory</option>
                            {australianStates.map((state) => (
                              <option key={state.code} value={state.code}>
                                {state.name}
                              </option>
                            ))}
                          </select>
                        ) : shippingStatesList.length > 0 ? (
                          <select
                            className="form-control"
                            name="province"
                            value={shippingAddress.province}
                            onChange={handleShippingChange}
                            required
                          >
                            <option value="">
                              {geoLoading.shippingStates ? 'Loading states…' : 'Select State/Province'}
                            </option>
                            {shippingStatesList.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Province/State"
                            name="province"
                            value={shippingAddress.province}
                            onChange={handleShippingChange}
                            required
                          />
                        )}
                        {shippingErrors.province && (
                          <div className="text-danger small">{shippingErrors.province}</div>
                        )}
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">City</label>
                        {shippingAddress.country === 'AU' && shippingAddress.province ? (
                          <select
                            className="form-control"
                            name="city"
                            value={shippingAddress.city}
                            onChange={handleShippingChange}
                            required
                          >
                            <option value="">Select City</option>
                            {australianCities[shippingAddress.province]?.map((city) => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                            ))}
                          </select>
                        ) : shippingCitiesList.length > 0 ? (
                          <select
                            className="form-control"
                            name="city"
                            value={shippingAddress.city}
                            onChange={handleShippingChange}
                            required
                          >
                            <option value="">
                              {geoLoading.shippingCities ? 'Loading cities…' : 'Select City'}
                            </option>
                            {shippingCitiesList.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            className="form-control"
                            placeholder="City"
                            name="city"
                            value={shippingAddress.city}
                            onChange={handleShippingChange}
                            required
                          />
                        )}
                        {shippingErrors.city && (
                          <div className="text-danger small">{shippingErrors.city}</div>
                        )}
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
                        {shippingErrors.postalCode && (
                          <div className="text-danger small">{shippingErrors.postalCode}</div>
                        )}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Phone</label>
                        <input
                          type="tel"
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

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm">
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
                      <p className="mb-0 fw-medium">${parseFloat(item.price).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                <hr />
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax (10%)</span>
                  <span>${(calculateSubtotal() * 0.1).toFixed(2)}</span>
                </div>

                {/* 🔹 Shipping options (radio buttons) */}
                <div className="mt-3">
                  <label className="form-label fw-bold">Shipping Method</label>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="shippingOption"
                      id="shipEconomy"
                      value="economy"
                      checked={shippingOption === 'economy'}
                      onChange={(e) => setShippingOption(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="shipEconomy">
                      {SHIPPING_OPTIONS[0].label}
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="shippingOption"
                      id="shipPriority"
                      value="priority"
                      checked={shippingOption === 'priority'}
                      onChange={(e) => setShippingOption(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="shipPriority">
                      {SHIPPING_OPTIONS[1].label}
                    </label>
                  </div>
                  <small className="text-muted">
                    Estimated delivery: ~{getEstimatedDays()} days
                  </small>
                </div>

                <div className="d-flex justify-content-between mb-2 mt-3">
                  <span>Shipping</span>
                  <span>${getShippingCost().toFixed(2)}</span>
                </div>

                <div className="d-flex justify-content-between fw-bold border-top pt-2">
                  <span>Total Amount</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>

                <h5 className="mt-4 mb-3">Payment Details</h5>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <CardElement
                      onChange={handleCardChange}
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': { color: '#aab7c4' },
                          },
                          invalid: { color: '#9e2146' },
                        },
                      }}
                    />
                  </div>
                  {cardError && <div className="alert alert-warning mb-3">{cardError}</div>}
                  {error && <div className="alert alert-danger mb-3">{error}</div>}
                  <div className="form-check mb-3">
                    <input className="form-check-input" type="checkbox" id="termsCheck" required />
                    <label className="form-check-label small" htmlFor="termsCheck">
                      I agree with Terms & Conditions
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-dark rounded-pill w-100"
                    disabled={!stripe || loading || cardError || cart.length === 0}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    ) : null}
                    {loading ? 'Processing...' : 'Pay Now'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Custom CSS */}
      <style jsx>{`
        .card { border-radius: 10px; overflow: hidden; }
        .form-control { border-radius: 5px; border: 1px solid #ced4da; transition: border-color 0.3s ease; }
        .form-control:focus { border-color: #007bff; box-shadow: 0 0 5px rgba(0, 123, 255, 0.3); }
        .btn-dark { background-color: #212529; border-color: #212529; transition: all 0.3s ease; }
        .btn-dark:hover { background-color: #343a40; border-color: #343a40; }
        .position-fixed { z-index: 1000; }
        @media (max-width: 991px) {
          .position-fixed { position: static; width: 100% !important; }
        }
      `}</style>
    </>
  );
};

export default CheckoutForm;
