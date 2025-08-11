import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Aboutimg from '../../public/about.png'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet';
import ShimmerCard from '../components/ShimmerCard'
const Categories = () => {
    const [foodCat, setFoodCat] = useState([])
      const [loading, setLoading] = useState(true);
    const loadFoodItems = async () => {
        let response = await fetch("http://localhost:5000/api/auth/foodData", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        response = await response.json()
        console.log(response, "update");

        setFoodCat(response[1])
        setLoading(false)
    }

    useEffect(() => {
        loadFoodItems()
    }, [])
    return (
        <>
         <Helmet>
          <title>Categories | Trezoar</title>
        </Helmet>

            <Navbar />

            {/* Category Section */}
                <section className="py-5">
                 <div className=" py-5 container">
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
            <Footer />
        </>
    )
}


export default Categories