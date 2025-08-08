/* eslint-disable react/jsx-no-undef */

import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useCart } from './ContextReducer';
import Modal from '../Modal';
import Cart from '../screens/Cart';
import NotificationBar from './NotificationBar';
import logo from '../../public/logo.png';

export default function Navbar(props) {
  const [cartView, setCartView] = useState(false);
  localStorage.setItem('temp', "first");
  let navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

   useEffect(() => {
      const handleScroll = () => {
        setScrolled(window.scrollY > 0);
      };
  
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);
  
    
  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedSearchTerm = searchTerm.trim();
    if (trimmedSearchTerm) {
      navigate(`/search?q=${encodeURIComponent(trimmedSearchTerm)}`);
      setSearchTerm(""); // Clear search input after submission
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('temp');
    localStorage.removeItem('cart');

    navigate("/login");
  }

  const loadCart = () => {
    setCartView(true);
  }

  const items = useCart();

  return (
    <>
      <div className='home'>
        <NotificationBar />

        <nav className="navbar navbar-expand-lg navbar-light bg-white fixed-top shadow-sm">
          <div className="container">
            <Link className="navbar-brand fw-bold" to="/">
              <img src={logo} style={{ width: '35px', height: 'auto' }} /> Trezoar
              {/* <i className="bi bi-bag-heart-fill text-primary me-2"></i>ShopEase */}
            </Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <Link className="nav-link active" to="/">Home</Link>
                </li>
                <li className="nav-item dropdown">
                  <Link className="nav-link dropdown-toggle" to="/categories">
                    Categories
                  </Link>

                </li>

                {localStorage.getItem("token") && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/myorder">My Account</Link>
                  </li>
                )}
                <li className="nav-item">
                  <a className="nav-link" href="/contact">Contact</a>
                </li>
              </ul>
              <form className="d-flex me-3" onSubmit={handleSearch}>
                <div className="input-group">
                  <input
                    className="form-control"
                    type="search"
                    placeholder="Search products..."
                    aria-label="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="btn btn-outline-primary" type="submit">
                    <i className="bi bi-search"></i>
                  </button>
                </div>
              </form>

              {!localStorage.getItem("token") ? (
                <div className="d-flex">
                  <Link to="/login" className="nav-link me-3"><i className="bi bi-person-circle fs-4"></i></Link>
                  {/* <Link className="btn btn-outline-light mx-1" to="/login">Login</Link>
                            <Link className="btn btn-outline-light mx-1" to="/signup">Signup</Link> */}
                  <Link to="/cartpage" className="position-relative me-3 nav-link">
                    <i className="bi bi-cart fs-4"></i>
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger cart-count">  {items.length}</span>
                  </Link>
                </div>
              ) : (
                <div className="d-flex align-items-center">
                  <Link to="/cartpage" className="position-relative me-3 nav-link">
                    <i className="bi bi-cart fs-4"></i>
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger cart-count">  {items.length}</span>
                  </Link>
                  <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
                </div>
              )}

            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
