import React, { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar2';

export default function MyOrder() {
    const [orderData, setOrderData] = useState([]);
    const [error, setError] = useState(null);
    const userId = localStorage.getItem("userId");

    const fetchUserOrders = async () => {
        if (!userId) {
            setError('User ID is not found in local storage.');
            return;
        }

        try {
            const response = await fetch('https://jewelsshop.onrender.com/api/auth/userorders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setOrderData(data);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchUserOrders();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount / 100);
    };

    return (
        <div>
            <Navbar />

            {/* Header Section */}
            <section className="page-header py-5 bg-primary text-white mt-5">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <h1 className="display-4 fw-bold text-white">My Orders</h1>
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <a href="/" className="text-white text-decoration-none">Home</a>
                                    </li>
                                    <li className="breadcrumb-item active text-white-50" aria-current="page">My Orders</li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
            </section>

            {/* Orders Section */}
            <section className="py-5">
                <div className="container">
                    {error && <div className="alert alert-danger">{error}</div>}

                    {/* Filters */}
                    <div className="row mb-4">
                        <div className="col-md-6 mb-3 mb-md-0">
                            <div className="input-group">
                                <input type="text" className="form-control" placeholder="Search orders..." />
                                <button className="btn btn-outline-primary" type="button">Search</button>
                            </div>
                        </div>
                        <div className="col-md-6 d-flex justify-content-md-end">
                            <select className="form-select" style={{ width: 'auto' }}>
                                <option>All Orders</option>
                                <option>Last 30 Days</option>
                                <option>Last 6 Months</option>
                                <option>2024</option>
                                <option>2023</option>
                            </select>
                        </div>
                    </div>

                    {/* Order List */}
                    <div className="card">
                        <div className="card-body p-0">
                            {orderData.length > 0 ? orderData.map((order, index) => (
                                <div key={order._id || index} className={`p-4 ${index !== orderData.length - 1 ? 'border-bottom' : ''}`}>
                                    <div className="row">
                                        <div className="col-md-3 mb-3 mb-md-0">
                                            <h6 className="text-muted mb-2">Order #{order._id.slice(-5).toUpperCase()}</h6>
                                            <span className="badge bg-success">Delivered</span>
                                            <p className="small text-muted mb-0">
                                                {new Date(order.orderDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="col-md-6 mb-3 mb-md-0">
                                            {console.log(order,"order.orderItems")}
                                            
                                            {order.orderItems.map(item => (
                                                <div key={item._id} className="d-flex align-items-center mb-2">
                                                    <img
                                                        src={item.img || "https://via.placeholder.com/60"}
                                                        alt={item.name}
                                                        className="img-fluid rounded"
                                                        width="60"
                                                    />
                                                    <div className="ms-3">
                                                        <h6 className="mb-1">{item.name}</h6>
                                                        <p className="text-muted mb-0">Qty: {item.qty}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="col-md-3 text-md-end">
                                            <h6 className="mb-2">{formatCurrency(order.totalAmount)}</h6>
                                            <div className="btn-group btn-group-sm">
                                                <button className="btn btn-outline-primary">Track Order</button>
                                                <button className="btn btn-outline-primary">View Details</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : <div className="p-4">No orders found.</div>}
                        </div>
                    </div>

                    {/* Pagination (Static for now) */}
                    <nav aria-label="Orders pagination" className="mt-4">
                        <ul className="pagination justify-content-center">
                            <li className="page-item disabled">
                                <a className="page-link" href="#">Previous</a>
                            </li>
                            <li className="page-item active"><a className="page-link" href="#">1</a></li>
                            <li className="page-item"><a className="page-link" href="#">2</a></li>
                            <li className="page-item"><a className="page-link" href="#">3</a></li>
                            <li className="page-item"><a className="page-link" href="#">Next</a></li>
                        </ul>
                    </nav>
                </div>
            </section>

            <Footer />
        </div>
    );
}
