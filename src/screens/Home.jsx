import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import slider from '../../public/slide.avif';
import slider2 from '../../public/slide2.avif';
import { Link } from 'react-router-dom';
import { Truck, DollarSign, Clock } from 'lucide-react';
import { Helmet } from 'react-helmet';
import ShimmerCard from '../components/ShimmerCard'

export default function Home() {
  const [foodCat, setFoodCat] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  // const loadFoodItems = async () => {
  //   let response = await fetch('http://localhost:5000/api/auth/foodData', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //   });
  //   response = await response.json();
  //   setFoodItems(response[0]);
  //   setFoodCat(response[1]);
  // };
  const loadHomeData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('http://localhost:5000/api/auth/featured-products'),
        fetch('http://localhost:5000/api/auth/categories'),
      ]);

      const featuredData = await productsRes.json();
      const categoryData = await categoriesRes.json();
      console.log(featuredData, categoryData, "categoryData");
      setFoodItems(featuredData.data); // only featured items
      setFoodCat(categoryData.data);
      setLoading(false)

    } catch (error) {
      console.error("Error loading home data:", error);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  const featuredItems = foodItems.filter((item) => item.featured === true);

  return (
    <div>
      <Helmet>
        <title>All Fashion Store | Trezoar</title>
      </Helmet>
      <Navbar />


      <section className="hero-section mt-5">
        <div id="heroCarousel" className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-indicators">
            <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
            <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="1" aria-label="Slide 2"></button>
            {/* <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="2" aria-label="Slide 3"></button> */}
          </div>
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img loading="lazy" src={slider} className="d-block w-100 carousel-img" alt="Slide 1" />
            </div>
            <div className="carousel-item">
              <img loading="lazy" src={slider2} className="d-block w-100 carousel-img" alt="Slide 2" />
            </div>
            {/* <div className="carousel-item">
              <img loading="lazy" src ={slider3} className="d-block w-100 carousel-img" alt="Slide 3" />
            </div> */}
          </div>
          <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </section>


      {/* Category Section */}
      <section className="py-5">
        <div className="container">
          <h2 className="text-center mb-4">Shop by Category</h2>
          <div className="row g-4">
            {loading
              ? Array(4).fill().map((_, i) => (
                <div className="col-6 col-md-3 col-sm-6" key={i}>
                  <ShimmerCard />
                </div>
              ))
              : foodCat.map((category) => (
                <div className="col-6 col-md-3 col-sm-6" key={category._id}>
                  <Link to={`/products/${category.CategoryName}`} className="text-decoration-none">
                    <div className="card category-card h-100">
                      <div className="category-img-container">
                        <img src={category.img} className="card-img-top" alt={category.CategoryName} />
                      </div>
                      <div className="card-body text-center">
                        <h5 className="card-title">{category.CategoryName}</h5>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
          </div>
        </div>
      </section>


      {/* Featured Products Section */}

      <section className="py-5 bg-light">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Featured Products</h2>
            {/* <a href="pages/products.html" className="btn btn-outline-primary">View All</a> */}
          </div>
          <div className="row">
            {loading
              ? Array(4).fill().map((_, i) => (
                <div key={i} className="col-6 col-md-6 col-lg-3 mb-4">
                  <ShimmerCard />
                </div>
              ))
              : featuredItems.length > 0
                ? featuredItems.map((item) => (
                  <div key={item._id} className="col-6 col-md-6 col-lg-3 mb-4">
                    <Card
                      foodName={item.name}
                      CategoryName={item.CategoryName}
                      item={item}
                      options={item.options[0]}
                      ImgSrc={item.img}
                      slug={item.slug}
                    />
                  </div>
                ))
                : <p className="text-center">No featured products available</p>
            }
          </div>
        </div>
      </section>
      {/* <!-- Benefits Section --> */}
      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-6 col-md-3 col-sm-6">
              <div className="benefit-item text-center">
                <div className="benefit-icon rounded-circle bg-primary-subtle p-3 mx-auto mb-3">
                  <i className="bi bi-truck fs-2 text-primary"></i>
                </div>
                <h5>Free Shipping</h5>
                <p className="text-muted">On orders over $99</p>
              </div>
            </div>
            <div className="col-6 col-md-3 col-sm-6">
              <div className="benefit-item text-center">
                <div className="benefit-icon rounded-circle bg-primary-subtle p-3 mx-auto mb-3">
                  <i className="bi bi-arrow-repeat fs-2 text-primary"></i>
                </div>
                <h5>Easy Returns</h5>
                <p className="text-muted">5-7 day return policy</p>
              </div>
            </div>
            <div className="col-6 col-md-3 col-sm-6">
              <div className="benefit-item text-center">
                <div className="benefit-icon rounded-circle bg-primary-subtle p-3 mx-auto mb-3">
                  <i className="bi bi-shield-check fs-2 text-primary"></i>
                </div>
                <h5>Secure Payment</h5>
                <p className="text-muted">Protected checkout</p>
              </div>
            </div>
            <div className="col-6 col-md-3 col-sm-6">
              <div className="benefit-item text-center">
                <div className="benefit-icon rounded-circle bg-primary-subtle p-3 mx-auto mb-3">
                  <i className="bi bi-headset fs-2 text-primary"></i>
                </div>
                <h5>Email Support</h5>
                <p className="text-muted"><a className='text-decoration-none text-muted' href="mailto:Ekdastar@gmail.com">Ekdastar@gmail.com</a></p>
              </div>
            </div>
          </div>
        </div>
      </section>



      <Footer />
    </div>
  );
}