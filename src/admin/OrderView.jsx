import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminNavbar from './components/AdminNavbar';
//import 'bootstrap/dist/css/bootstrap.min.css';
const OrderView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [orderStatus, setOrderStatus] = useState('');
  const [shippingMethod, setShippingMethod] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/auth/orders/${id}`);
        if (!response.ok) throw new Error('Failed to fetch order details');
        const data = await response.json();
        console.log(data, "data");
        
        setOrder(data);
        setOrderStatus(data.orderStatus || 'Processing');
        setShippingMethod(data.shippingMethod || '');
        setShippingCost(data.shippingCost || 0);
        setPaymentMethod(data.paymentMethod || '');
        setTrackingNumber(data.trackingNumber || '');
        setEstimatedDelivery(data.estimatedDelivery || '');
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const updatedData = {
      orderStatus,
      shippingMethod,
      shippingCost: Number(shippingCost),
      paymentMethod,
      trackingNumber,
      estimatedDelivery,
    };

    try {
      const response = await fetch(`http://localhost:5000/api/auth/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error('Failed to update order');
      const updatedOrder = await response.json();
      setOrder(updatedOrder);
      alert('Order updated successfully!');
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ marginLeft: '250px', padding: '20px' }}>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ marginLeft: '250px', padding: '20px' }}>
        <div className="alert alert-danger text-center">{error}</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ marginLeft: '250px', padding: '20px' }}>
        <div className="alert alert-warning text-center">Order not found</div>
      </div>
    );
  }

  const { billingAddress, shippingAddress, orderItems, totalAmount, paymentStatus, orderDate } = order;

  return (
    <>
      <AdminNavbar />
      <div style={{ marginLeft: '250px', padding: '20px', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <div className="container py-4">
          <h2 className="mb-4">Order Details</h2>

          {/* Order Summary */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <h5 className="card-title">Order #{order._id.slice(-6)}</h5>
              <p><strong>Date:</strong> {new Date(orderDate).toLocaleDateString()}</p>
              <p><strong>Total:</strong> ${(totalAmount / 100).toFixed(2)}</p>
              <p>
                <strong>Payment Status:</strong>{' '}
                <span className={`badge ${paymentStatus === 'paid' ? 'bg-success' : 'bg-warning'}`}>
                  {paymentStatus}
                </span>
              </p>
            </div>
          </div>

          {/* Addresses */}
          <div className="row g-4 mb-4">
            <div className="col-md-6">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <h5 className="card-title">Billing Address</h5>
                  <p><strong>Name:</strong> {billingAddress.firstName} {billingAddress.lastName}</p>
                  <p><strong>Address:</strong> {billingAddress.streetAddress}{billingAddress.apartment ? `, ${billingAddress.apartment}` : ''}</p>
                  <p><strong>Location:</strong> {billingAddress.province}, {billingAddress.country} {billingAddress.postalCode}</p>
                  <p><strong>Phone:</strong> {billingAddress.phone}</p>
                  <p><strong>Email:</strong> {billingAddress.email}</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <h5 className="card-title">Shipping Address</h5>
                  <p><strong>Name:</strong> {shippingAddress.firstName} {shippingAddress.lastName}</p>
                  <p><strong>Address:</strong> {shippingAddress.streetAddress}{shippingAddress.apartment ? `, ${shippingAddress.apartment}` : ''}</p>
                  <p><strong>Location:</strong> {shippingAddress.province}, {shippingAddress.country} {shippingAddress.postalCode}</p>
                  <p><strong>Phone:</strong> {shippingAddress.phone}</p>
                  <p><strong>Email:</strong> {shippingAddress.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <h5 className="card-title">Order Items</h5>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Item Name</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item) => (
                      <tr key={item._id}>
                        <td>{item.name}</td>
                        <td>{item.qty}</td>
                        <td>${(item.price / item.qty).toFixed(2)}</td>
                        <td>${item.price.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Update Form */}
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title">Update Order</h5>
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="orderStatus" className="form-label fw-bold">Order Status</label>
                    <select
                      id="orderStatus"
                      className="form-select"
                      value={orderStatus}
                      onChange={(e) => setOrderStatus(e.target.value)}
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="shippingMethod" className="form-label fw-bold">Shipping Method</label>
                    <input
                      type="text"
                      id="shippingMethod"
                      className="form-control"
                      value={shippingMethod}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      placeholder="e.g., Standard Shipping"
                      
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="shippingCost" className="form-label fw-bold">Shipping Cost</label>
                    <input
                      type="number"
                      id="shippingCost"
                      className="form-control"
                      value={shippingCost}
                      onChange={(e) => setShippingCost(e.target.value)}
                      min="0"
                      step="0.01"
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="paymentMethod" className="form-label fw-bold">Payment Method</label>
                    <input
                      type="text"
                      id="paymentMethod"
                      className="form-control"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      placeholder="e.g., Credit Card"
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="trackingNumber" className="form-label fw-bold">Tracking Number</label>
                    <input
                      type="text"
                      id="trackingNumber"
                      className="form-control"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g., 1Z9999W999999999"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="estimatedDelivery" className="form-label fw-bold">Estimated Delivery</label>
                    <input
                      type="date"
                      id="estimatedDelivery"
                      className="form-control"
                      value={estimatedDelivery}
                      onChange={(e) => setEstimatedDelivery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="d-flex justify-content-between mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/admin/ordersList')}
                  >
                    Back to Orders
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Updating...
                      </>
                    ) : (
                      'Update Order'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderView;