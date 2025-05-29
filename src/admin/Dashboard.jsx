import React, { useState, useEffect } from 'react';
import AdminNavbar from './components/AdminNavbar';
//import 'bootstrap/dist/css/bootstrap.min.css';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalFeaturedProducts, setTotalFeaturedProducts] = useState(0);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  // Chart options (same as before)
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Monthly Sales Overview' },
    },
    scales: {
      x: { type: 'category' },
      y: { beginAtZero: true },
    },
  };

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Total Products
        const productsRes = await fetch('https://jewelsshop.onrender.com/api/auth/total-products');
        const productsData = await productsRes.json();
        setTotalProducts(productsData.totalProducts);

        // Fetch Total Categories
        const categoriesRes = await fetch('https://jewelsshop.onrender.com/api/auth/total-categories');
        const categoriesData = await categoriesRes.json();
        setTotalCategories(categoriesData.totalCategories);

        // Fetch Total Featured Products
        const featuredRes = await fetch('https://jewelsshop.onrender.com/api/auth/total-featured-products');
        const featuredData = await featuredRes.json();
        setTotalFeaturedProducts(featuredData.totalFeaturedProducts);

        // Fetch Sales Overview
        const salesRes = await fetch('https://jewelsshop.onrender.com/api/auth/sales-overview');
        const salesData = await salesRes.json();
        setChartData(salesData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <AdminNavbar />
      <div style={{ marginLeft: '250px', padding: '20px', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <div className="container-fluid py-4">
          <h3 className="mb-4">Admin Dashboard</h3>

          {/* Stats Cards */}
          <div className="row g-4 mb-5">
            <div className="col-md-6 col-lg-3">
              <div className="card shadow-sm border-0 text-center h-100">
                <div className="card-body">
                  <h5 className="card-title text-muted">Total Products</h5>
                  <h2 className="text-primary">{totalProducts}</h2>
                  <p className="text-muted mb-0">Active products in store</p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="card shadow-sm border-0 text-center h-100">
                <div className="card-body">
                  <h5 className="card-title text-muted">Total Categories</h5>
                  <h2 className="text-success">{totalCategories}</h2>
                  <p className="text-muted mb-0">Product categories</p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="card shadow-sm border-0 text-center h-100">
                <div className="card-body">
                  <h5 className="card-title text-muted">Featured Products</h5>
                  <h2 className="text-warning">{totalFeaturedProducts}</h2>
                  <p className="text-muted mb-0">Highlighted items</p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="card shadow-sm border-0 text-center h-100">
                <div className="card-body">
                  <h5 className="card-title text-muted">Pending Actions</h5>
                  <h2 className="text-danger">3</h2> {/* Static for now */}
                  <p className="text-muted mb-0">Tasks to review</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity (Static for now) */}
          <div className="row mb-5">
            <div className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <h5 className="card-title mb-3">Recent Activity</h5>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Action</th>
                          <th>Item</th>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Added Product</td>
                          <td>Blue T-Shirt</td>
                          <td>Mar 24, 2025</td>
                          <td><span className="badge bg-success">Completed</span></td>
                        </tr>
                        
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts and Quick Links */}
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <h5 className="card-title mb-3">Sales Overview</h5>
                  {chartData.labels.length > 0 && <Bar data={chartData} options={chartOptions} />}
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <h5 className="card-title mb-3">Quick Links</h5>
                  <ul className="list-unstyled">
                    <li><a href="/admin/addproducts" className="text-decoration-none">Add New Product</a></li>
                    <li><a href="/admin/addcategory" className="text-decoration-none">Add New Category</a></li>
                    <li><a href="/admin/productlist" className="text-decoration-none">View Products</a></li>
                    <li><a href="/admin/categoryList" className="text-decoration-none">View Categories</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}