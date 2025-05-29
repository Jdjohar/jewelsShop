/* eslint-disable react/jsx-no-undef */
import React from 'react';
import { Link, useNavigate } from "react-router-dom";

export default function AdminNavbar(props) {
 let navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('temp');
    localStorage.removeItem('cart');

    navigate("/login");
}


  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div
        className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark"
        style={{ width: '250px', height: '100vh', position: 'fixed' }}
      >
        <Link
          to="/admin"
          className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none"
        >
          <span className="fs-4">Admin Panel</span>
        </Link>
        <hr />
        <ul className="nav nav-pills flex-column mb-auto">
          <li className="nav-item">
            <Link to="/admin/dashboard" className="nav-link text-white">
              <i className="bi bi-speedometer2 me-2"></i> Dashboard
            </Link>
          </li>
          <li>
            <a
              className="nav-link text-white dropdown-toggle"
              href="#"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-box-seam me-2"></i> Products
            </a>
            <ul className="dropdown-menu dropdown-menu-dark">
              <li>
                <Link className="dropdown-item" to="/admin/addproducts">
                  Add Products
                </Link>
              </li>
              <li>
                <Link className="dropdown-item" to="/admin/productlist">
                  Product List
                </Link>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
             
            </ul>
          </li>
          <li>
            <a
              className="nav-link text-white dropdown-toggle"
              href="#"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-tags me-2"></i> Categories
            </a>
            <ul className="dropdown-menu dropdown-menu-dark">
              <li>
                <Link className="dropdown-item" to="/admin/addcategory">
                  Add Category
                </Link>
              </li>
              <li>
                <Link className="dropdown-item" to="/admin/categoryList">
                  Category List
                </Link>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              
            </ul>
          </li>
          <li>
            <a
              className="nav-link text-white dropdown-toggle"
              href="#"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-cart me-2"></i> Orders
            </a>
            <ul className="dropdown-menu dropdown-menu-dark">
              <li>
                <Link className="dropdown-item" to="/admin/orderList">
                  Order List
                </Link>
              </li>
             
              <li>
                <hr className="dropdown-divider" />
              </li>
             
            </ul>
          </li>
        </ul>
        <hr />
        <div className="dropdown">
          <a
            href="#"
            className="d-flex align-items-center text-white text-decoration-none dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i className="bi bi-person-circle me-2"></i>
            <strong>Admin</strong>
          </a>
          <ul className="dropdown-menu dropdown-menu-dark text-small shadow">
            <li>
              <a className="dropdown-item" href="#">
                Profile
              </a>
            </li>
            <li>
              <a className="dropdown-item" href="#">
                Settings
              </a>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
            <button className=" dropdown-item btn btn-danger" onClick={handleLogout}>Logout</button>
            </li>
          </ul>
        </div>
      </div>

      {/* Top Navbar */}
      <div className="flex-grow-1" style={{ marginLeft: '250px' }}>
        <nav className="navbar navbar-expand-lg bg-light">
          <div className="container-fluid">
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarTopContent"
              aria-controls="navbarTopContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarTopContent">
              <form className="d-flex ms-auto" role="search">
                <input
                  className="form-control me-2"
                  type="search"
                  placeholder="Search"
                  aria-label="Search"
                />
                <button className="btn btn-outline-success" type="submit">
                  Search
                </button>
              </form>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}