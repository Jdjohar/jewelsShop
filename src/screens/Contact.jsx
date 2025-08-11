import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const Contact = () => {
  const openLiveChat = () => {
    alert('Live chat coming soon!');
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | Trezoar</title>
      </Helmet>

      <Navbar />

      {/* Header */}
      <section className="page-header py-5 bg-primary text-white mt-5">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1 className="display-4 text-white fw-bold">Contact Us</h1>
              <p className="lead mb-0">We'd love to hear from you. Get in touch with our team.</p>
              <nav aria-label="breadcrumb" className="mt-3">
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to="/" className="text-white text-decoration-none">Home</Link>
                  </li>
                  <li className="breadcrumb-item active text-white-50" aria-current="page">Contact</li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-5">
        <div className="container">
          <div className="row g-4 mb-5">
            {/* Visit Store */}
            <div className="col-lg-4 col-md-6">
              <div className="card h-100 text-center border-0 shadow-sm">
                <div className="card-body p-4">
                  <div
                    className="contact-icon rounded-circle bg-primary-subtle p-3 mx-auto mb-3"
                    style={{ width: '80px', height: '80px' }}
                  >
                    <i className="bi bi-geo-alt fs-1 text-primary"></i>
                  </div>
                  <h5 className="card-title">Visit Our Store</h5>
                  <p className="card-text text-muted">
                    1234 Market Street<br />
                    San Francisco, CA 94102<br />
                    United States
                  </p>
                  <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">Get Directions</a>
                </div>
              </div>
            </div>

            {/* Call Us */}
            <div className="col-lg-4 col-md-6">
              <div className="card h-100 text-center border-0 shadow-sm">
                <div className="card-body p-4">
                  <div
                    className="contact-icon rounded-circle bg-primary-subtle p-3 mx-auto mb-3"
                    style={{ width: '80px', height: '80px' }}
                  >
                    <i className="bi bi-telephone fs-1 text-primary"></i>
                  </div>
                  <h5 className="card-title">Call Us</h5>
                  <p className="card-text text-muted">
                    Customer Service<br />
                    <strong>(123) 456-7890</strong><br />
                    Mon-Fri: 9AM - 6PM PST
                  </p>
                  <a href="tel:+11234567890" className="btn btn-outline-primary btn-sm">Call Now</a>
                </div>
              </div>
            </div>

            {/* Email Us */}
            <div className="col-lg-4 col-md-6">
              <div className="card h-100 text-center border-0 shadow-sm">
                <div className="card-body p-4">
                  <div
                    className="contact-icon rounded-circle bg-primary-subtle p-3 mx-auto mb-3"
                    style={{ width: '80px', height: '80px' }}
                  >
                    <i className="bi bi-envelope fs-1 text-primary"></i>
                  </div>
                  <h5 className="card-title">Email Us</h5>
                  <p className="card-text text-muted">
                    General Inquiries<br />
                    <strong>- Ekdastar@gmail.com</strong><br />
                    We'll respond within 24 hours
                  </p>
                  <a href="mailto:-Ekdastar@gmail.com" className="btn btn-outline-primary btn-sm">Send Email</a>
                </div>
              </div>
            </div>

            {/* Live Chat */}
            {/* <div className="col-lg-3 col-md-6">
              <div className="card h-100 text-center border-0 shadow-sm">
                <div className="card-body p-4">
                  <div
                    className="contact-icon rounded-circle bg-primary-subtle p-3 mx-auto mb-3"
                    style={{ width: '80px', height: '80px' }}
                  >
                    <i className="bi bi-chat-dots fs-1 text-primary"></i>
                  </div>
                  <h5 className="card-title">Live Chat</h5>
                  <p className="card-text text-muted">
                    Instant Support<br />
                    <strong>Available 24/7</strong><br />
                    Get help right away
                  </p>
                  <button className="btn btn-outline-primary btn-sm" onClick={openLiveChat}>Start Chat</button>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold">Frequently Asked Questions</h2>
            <p className="lead text-muted">Quick answers to common questions</p>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="accordion" id="faqAccordion">

                {/* FAQ Item 1 */}
                <div className="accordion-item">
                  <h2 className="accordion-header" id="faq1">
                    <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#faqCollapse1" aria-expanded="true" aria-controls="faqCollapse1">
                      What are your shipping options and delivery times?
                    </button>
                  </h2>
                  <div id="faqCollapse1" className="accordion-collapse collapse show" aria-labelledby="faq1" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                    We offer Standard Shipping at a flat rate of $6 with delivery in approximately 25 days, or Expedited Shipping at $15 with delivery in approximately 15 days.
                    </div>
                  </div>
                </div>

                {/* FAQ Item 2 */}
                <div className="accordion-item">
                  <h2 className="accordion-header" id="faq2">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faqCollapse2" aria-expanded="false" aria-controls="faqCollapse2">
                      What is your return policy?
                    </button>
                  </h2>
                  <div id="faqCollapse2" className="accordion-collapse collapse" aria-labelledby="faq2" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                    We currently do not accept returns. Please ensure you review product details and sizing carefully before placing an order. If you receive a damaged or incorrect item, please contact our support team for assistance.
                    </div>
                  </div>
                </div>

                {/* FAQ Item 3 */}
                <div className="accordion-item">
                  <h2 className="accordion-header" id="faq3">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faqCollapse3" aria-expanded="false" aria-controls="faqCollapse3">
                      How can I track my order?
                    </button>
                  </h2>
                  <div id="faqCollapse3" className="accordion-collapse collapse" aria-labelledby="faq3" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                     All orders are shipped via Australia Post. Once your order has been dispatched, you’ll receive a tracking number via email so you can monitor the delivery progress.
                    </div>
                  </div>
                </div>

                {/* FAQ Item 4 */}
                <div className="accordion-item">
                  <h2 className="accordion-header" id="faq4">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faqCollapse4" aria-expanded="false" aria-controls="faqCollapse4">
                      Do you offer international shipping?
                    </button>
                  </h2>
                  <div id="faqCollapse4" className="accordion-collapse collapse" aria-labelledby="faq4" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      No, at this time we do not offer international shipping. We only ship within Australia.
                    </div>
                  </div>
                </div>

                {/* FAQ Item 5 */}
                <div className="accordion-item">
                  <h2 className="accordion-header" id="faq5">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faqCollapse5" aria-expanded="false" aria-controls="faqCollapse5">
                      What payment methods do you accept?
                    </button>
                  </h2>
                  <div id="faqCollapse5" className="accordion-collapse collapse" aria-labelledby="faq5" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                     We accept Debit and Credit Cards through the Stripe payment gateway, ensuring secure and seamless transactions.
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Contact;
