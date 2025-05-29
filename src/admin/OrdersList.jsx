import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './components/AdminNavbar';
//import 'bootstrap/dist/css/bootstrap.min.css';


const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const ordersPerPage = 6; // Number of orders per page
  const navigate = useNavigate();

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://jewelsshop.onrender.com/api/auth/orders');
        let result = await response.json();
        console.log(result, "Result");
    
        // Sort the orders in descending order by createdAt
        result = result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
        setOrders(result); // Assuming result is an array of orders
      } catch (error) {
        console.error('Error fetching orders:', error.message);
        alert('Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };
    

    fetchOrders();
  }, []);

  // Filter orders based on search term
  const filteredOrders = orders.filter(order =>
    order.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle delete action
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this order?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`https://jewelsshop.onrender.com/api/auth/orders/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setOrders(orders.filter((order) => order._id !== id));
        console.log('Order deleted successfully');
        // Reset page if necessary
        const filtered = orders.filter((order) => order._id !== id).filter((order) =>
          order.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (Math.ceil(filtered.length / ordersPerPage) < currentPage) {
          setCurrentPage(1);
        }
      } else {
        console.error('Failed to delete order:', response.statusText);
        alert('Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error.message);
      alert('An error occurred');
    }
  };

  // Handle edit action
  const handleEdit = (id) => {
    navigate(`/admin/orderView/${id}`);
  };

  return (
    <>
      <AdminNavbar />
      <div style={{ marginLeft: '250px', padding: '20px', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <div className="container py-4">
          <h2 className="mb-4">All Orders</h2>

          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <p className="text-center text-muted">
              {searchTerm ? 'No orders match your search.' : 'No orders found.'}
            </p>
          ) : (
            <>
              {/* Orders Card Grid */}
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {currentOrders.map((order) => (
                  <div key={order._id} className="col">
                    <div className="card h-100 shadow-sm border-0">
                      <div className="card-body">
                        <h5 className="card-title">Order #{order._id.slice(-6)}</h5>
                        <p className="card-text">
                          <strong>Email:</strong> {order.userEmail}
                        </p>
                        <p className="card-text">
                          <strong>Total:</strong> ${(order.totalAmount / 100).toFixed(2)}
                        </p>
                        <p className="card-text">
                          <strong>Status:</strong>{' '}
                          <span className={`badge ${order.paymentStatus === 'paid' ? 'bg-success' : 'bg-warning'}`}>
                            {order.paymentStatus}
                          </span>
                        </p>
                        <p className="card-text">
                          <strong>Method:</strong> {order.paymentMethod}
                        </p>
                        <p className="card-text">
                          <strong>Shipping:</strong> {order.shippingMethod}
                        </p>
                        <p className="card-text">
                          <strong>Date:</strong> {new Date(order.orderDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="card-footer bg-transparent border-0">
                        <button
                          className="btn btn-outline-primary btn-sm me-2"
                          onClick={() => handleEdit(order._id)}
                        >
                          View/Edit
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(order._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav aria-label="Order pagination" className="mt-4">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                    </li>
                    {[...Array(totalPages)].map((_, index) => (
                      <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(index + 1)}>
                          {index + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default OrdersList;