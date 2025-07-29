import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Aboutimg from '../../public/about.png'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet';

const Categories = () => {
    const [foodCat, setFoodCat] = useState([])
    const loadFoodItems = async () => {
        let response = await fetch("https://jewelsshop.onrender.com/api/auth/foodData", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        response = await response.json()
        console.log(response, "update");

        setFoodCat(response[1])
    }

    useEffect(() => {
        loadFoodItems()
    }, [])
    return (
        <>
         <Helmet>
          <title>Categories | Australia | Store name</title>
        </Helmet>

            <Navbar />

            {/* Category Section */}
                <section className="py-5">
                 <div className=" py-5 container">
                   <h2 className="text-center mb-4">Shop by Category</h2>
                       <div className="row g-4">
                         {foodCat.map((category) => (
                           <div className="col-lg-4" key={category._id}>
                            <div className='category-banner h-100'>
                            <img  src={category.img} className="img-fluid w-100 h-100 object-fit-cover rounded" alt="Electronics" />
                            <div className="category-banner-content">
              <h2 className="fw-bold text-white">{category.CategoryName}</h2>
             
              <Link to={`/products/${category.CategoryName}`} className="btn btn-light">Shop Now</Link>
            </div>
                            </div>
                           
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