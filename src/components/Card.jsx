import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatchCart, useCart } from './ContextReducer';

export default function Card(props) {
  let data = useCart();
  let navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState("");
  const [message, setMessage] = useState(null);
  const priceRef = useRef();

  let options = props.options;
  let priceOptions = Object.keys(options);
  let foodItem = props.item;
  const dispatch = useDispatchCart();

  const handleQty = (e) => {
    setQty(e.target.value);
  };

  const handleOptions = (e) => {
    setSize(e.target.value);
  };

  const handleAddToCart = async () => {
    let singleItemPrice = parseInt(options[size]);
    let food = data.find(item => item.id === foodItem._id && item.size === size);

    if (food) {
      await dispatch({
        type: "UPDATE",
        id: foodItem._id,
        price: singleItemPrice * qty,
        qty: qty,
        size: size
      });
    } else {
      await dispatch({
        type: "ADD",
        id: foodItem._id,
        name: foodItem.name,
        price: singleItemPrice * qty,
        qty: qty,
        size: size,
        img: props.ImgSrc
      });
    }

    setMessage("Product added to your cart!");

    setTimeout(() => setMessage(null), 3000);
  };

  useEffect(() => {
    setSize(priceRef.current.value);
  }, []);

  let finalPrice = qty * (options[size] ? parseInt(options[size]) : 0);

  return (
    <div className="">
      <div className="card product-card h-100">
      <div className="product-badge bg-danger text-white">-20%</div>
      <div className="product-wishlist">
              <button className="btn wishlist-btn"><i className="bi bi-heart"></i></button>
            </div>
            <div className="product-img-container">
              <img src={props.ImgSrc} className="card-img-top" alt="Smartwatch" />
            </div>
    
        <div className="card-body">
          <Link className='text-decoration-none' key={foodItem._id} to={`/viewproduct/${foodItem._id}`}>
         
          <h5 className="product-category text-muted small mb-1">{props.foodName}</h5>
          </Link>
          <p className="card-text text-muted">{props.CategoryName}</p>

          <div className="d-flex justify-content-between align-items-center mb-2">
            <select className="form-select w-auto me-2" onChange={handleQty}>
              {Array.from(Array(6), (e, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
            <select className="form-select w-auto" ref={priceRef} onChange={handleOptions}>
              {priceOptions.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>

          <h6 className="fw-bold mb-3">${finalPrice.toFixed(2)}</h6>

          <button className="btn btn-primary w-100 add-to-cart" onClick={handleAddToCart}>
            Add to Cart
          </button>

          {message && <div className="alert alert-success mt-2" role="alert">{message}</div>}
        </div>
      </div>
    </div>
  );
}
