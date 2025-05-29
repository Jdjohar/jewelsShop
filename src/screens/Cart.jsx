
import React from 'react';
import { useCart, useDispatchCart } from '../components/ContextReducer';
import { Link } from 'react-router-dom';

export default function Cart() {
  const data = useCart();
  const dispatch = useDispatchCart();

  if (data.length === 0) {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <h3 className="text-muted mb-3">Your Cart is Empty</h3>
          <Link to="/" className="btn btn-outline-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  const handleCheckOut = async () => {
    try {
      const userEmail = localStorage.getItem("userEmail");
      const response = await fetch("http://localhost:5000/api/auth/orderData", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          order_data: data,
          email: userEmail,
          order_date: new Date().toDateString()
        })
      });

      if (response.status === 200) {
        dispatch({ type: "DROP" });
      }
    } catch (error) {
      console.error("Checkout error:", error);
    }
  };

  const totalPrice = data.reduce((total, food) => total + food.price, 0);

  return (
    <div className="container-fluid py-5">
      <div className="row g-4">
        {/* Main Content */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3">
              <h4 className="mb-0 fw-bold">Shopping Cart ({data.length} items)</h4>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover m-0">
                  <thead className="bg-light">
                    <tr>
                      <th scope="col" className="py-3">#</th>
                      <th scope="col" className="py-3">Product</th>
                      <th scope="col" className="py-3">Quantity</th>
                      <th scope="col" className="py-3">Options</th>
                      <th scope="col" className="py-3">Price</th>
                      <th scope="col" className="py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((food, index) => (
                      <tr key={index} className="align-middle">
                        <td className="fw-medium">{index + 1}</td>
                        <td>{food.name}</td>
                        <td>{food.qty}</td>
                        <td>{food.size}</td>
                        <td className="fw-medium">${food.price.toFixed(2)}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => dispatch({ type: "REMOVE", index })}
                          >
                            X
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 sticky-top" style={{ top: '20px' }}>
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold">Order Summary</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Subtotal ({data.length} items)</span>
                <span className="fw-medium">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Shipping</span>
                <span className="fw-medium">Free</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-4">
                <span className="fw-bold">Total</span>
                <span className="fw-bold text-success">${totalPrice.toFixed(2)}</span>
              </div>
              <Link
                to="/cartpage"
                className="btn btn-primary w-100 py-2"
                
              >
                View Cart
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        .card {
          border-radius: 10px;
          overflow: hidden;
        }

        .table th,
        .table td {
          border-color: #e9ecef;
          vertical-align: middle;
        }

        .btn-primary {
 hogy           background-color: #007bff;
          border-color: #007bff;
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          background-color: #0056b3;
          border-color: #0056b3;
          transform: translateY(-2px);
        }

        .btn-outline-danger {
          transition: all 0.3s ease;
        }

        .btn-outline-danger:hover {
          background-color: #dc3545;
          color: white;
          transform: scale(1.1);
        }

        @media (max-width: 991px) {
          .sticky-top {
            position: static;
          }
          
          .card-body {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
