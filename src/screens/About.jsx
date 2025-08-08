import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Aboutimg from '../../public/about.png'

const About = () => {
  return (
    <>
    <Navbar />
    <section class="hero-section d-flex align-items-center">
            <div class="container text-center text-white">
                <h1 class="display-4">About Us</h1>
                <p class="lead">Learn more about our company and our mission</p>
            </div>
        </section>

        <section className='py-5'>
            <div class="container py-5">
                <div class="row align-items-center">
                <div className='col-md-4 col-12'>
                    <img src={Aboutimg} className='w-100' />
                </div>
                <div className='col-md-8 col-12'>
                    <div className='Content'>
                        <h3 className='fs-3 fw-bold text-uppercase'>About Trezoar</h3>
                        <p className='fs-5'>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Alias sunt sequi rem facere maiores labore, voluptas placeat. Doloremque id consectetur rerum, placeat explicabo, odit suscipit quidem cum fuga deserunt quo?</p>
                        <p className='fs-5'>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Alias sunt sequi rem facere maiores labore, voluptas placeat. Doloremque id consectetur rerum, placeat explicabo, odit suscipit quidem cum fuga deserunt quo? Lorem ipsum dolor sit, amet consectetur adipisicing elit. Alias sunt sequi rem facere maiores labore, voluptas placeat. Doloremque id consectetur rerum, placeat explicabo, odit suscipit quidem cum fuga deserunt quo?</p>

                    </div>
                </div>
                </div>
            </div>
        </section>
    <Footer />
    </>
  )
}

export default About