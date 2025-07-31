const express = require('express')
const User = require('../models/User')
const Order = require('../models/Orders')
const Products = require('../models/Product')
const Category = require('../models/Category')
const Brand = require('../models/Brands')
const Checkout = require('../models/CheckOut')
const mongoose = require('mongoose');
const path = require('path');
 const fs = require('fs');
const csv = require('csv-parser');
const stream = require('stream');
const StripeResponse = require('../models/StripeResponse')
require('dotenv').config();
const router = express.Router()
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken');
const axios = require('axios')
const fetch = require('../middleware/fetchdetails');
const jwtSecret = process.env.JWT_SECRET;
const multer = require('multer');

const nodemailer = require('nodemailer');
const crypto = require('crypto');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cloudinary = require('../cloudinaryConfig');

// Create a Multer storage configuration for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Set the destination folder for file uploads
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Set a unique filename for each uploaded file
  },
});

const upload = multer({ storage: storage });

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return next(); // Allow guest checkout
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};


// var foodItems= require('../index').foodData;
// require("../index")
//Creating a user and storing data to MongoDB Atlas, No Login Requiered
// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
  },
});

router.post('/createuser', [
  body('email').isEmail(),
  body('password').isLength({ min: 5 }),
  body('name').isLength({ min: 3 })
], async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }

  const salt = await bcrypt.genSalt(10);
  let securePass = await bcrypt.hash(req.body.password, salt);

  try {
    await User.create({
      name: req.body.name,
      password: securePass,
      email: req.body.email,
      // location: req.body.location
    }).then(user => {
      const data = {
        user: {
          id: user.id
        }
      };
      const authToken = jwt.sign(data, jwtSecret);
      success = true;

      // Send welcome email
      const mailOptions = {
        from: 'jdwebservices1@gmail.com', // Sender email
        to: req.body.email, // Recipient email
        subject: 'Welcome to Our Store!',
        html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <h1 style="color: #4CAF50;">Welcome to Ek Dastar, ${req.body.name}!</h1>
          <p>Thank you for joining <strong>Ek Dastar</strong>, where tradition meets elegance. We're honored to be part of your journey in finding authentic turbans, patkas, and dumala sahibs.</p>
      
          <p>As a valued member of Ek Dastar, you now have access to:</p>
          <ul>
            <li>Exclusive offers on premium turbans and accessories</li>
            <li>Personalized recommendations based on your unique style</li>
            <li>Guidance from our experts to help you choose the perfect fit and style</li>
          </ul>
      
          <p>We believe every turban and patka is a symbol of pride and identity, and we’re dedicated to providing high-quality materials and craftsmanship that honor this tradition.</p>
          
          <p>To get started, log in and explore our latest collections. We’re here to help you find the perfect piece that resonates with your style and heritage.</p>
          
          <p>If you have any questions or need assistance, feel free to reach out to us at <a href="mailto:support@ekDastar.com" style="color: #4CAF50;">support@ekDastar.com</a>. Our team is here to ensure your shopping experience is as seamless as possible.</p>
      
          <p>Welcome once again to the Ek Dastar family. We look forward to being a part of your journey.</p>
      
          <p>With respect and best wishes,<br>The Ek Dastar Team</p>
      
          <hr style="border: none; border-top: 1px solid #ccc;">
          <p style="font-size: 12px; color: #666;">You're receiving this email because you registered with Ek Dastar. If you didn’t sign up, please ignore this email or <a href="mailto:support@ekDastar.com" style="color: #666;">contact us</a>.</p>
        </div>
      `
      
      
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

      res.json({ success, authToken });
    })
    .catch(err => {
      console.log(err);
      res.json({ error: "Please enter a unique value." });
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});




//Get a Product
// Endpoint for fetching product details
router.get('/getproducts/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Products.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(
      {
        status: 'success',
        data: product
      }
    )

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Create a Product

router.post('/products', async (req, res) => {
  console.log("Products");

  try {
    console.log("start try");
    const newProduct = new Products(req.body);
    const savedProduct = await newProduct.save();
    res.json(savedProduct);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

})
// Search products by name
router.get('/products/search', async (req, res) => {
  try {
    const { name } = req.query;

    // Validate query parameter
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Name query parameter is required and must be a non-empty string' 
      });
    }

    // Perform case-insensitive search using regex
    const products = await Products.find({
      name: { $regex: name.trim(), $options: 'i' }
    }).select('name description CategoryName img featured inventory');

    // Check if any products were found
    if (products.length === 0) {
      return res.status(404).json({ 
        status: 'success', 
        message: 'No products found matching the search criteria', 
        data: [] 
      });
    }

    // Return found products
    res.status(200).json({
      status: 'success',
      count: products.length,
      data: products
    });

  } catch (error) {
    console.error('Error in product search:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Internal Server Error' 
    });
  }
});



// Authentication a User, No login Requiered
router.post('/login', [
  body('email', "Enter a Valid Email").isEmail(),
  body('password', "Password cannot be blank").exists(),
], async (req, res) => {
  let success = false
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });  //{email:email} === {email}
    if (!user) {
      return res.status(400).json({ success, error: "Try Logging in with correct credentials" });
    }

    const pwdCompare = await bcrypt.compare(password, user.password); // this return true false.
    if (!pwdCompare) {
      return res.status(400).json({ success, error: "Try Logging in with correct credentials" });
    }
    const data = {
      user: {
        id: user.id,
        role: user.role
      }
    }
    console.log(data, "data");
    success = true;
    const authToken = jwt.sign(data, jwtSecret);
    res.json({ success, userId: data.user.id, authToken, role: data.user.role })


  } catch (error) {
    console.error(error.message)
    res.send("Server Error")
  }
})

// Get logged in User details, Login Required.
router.post('/getuser', fetch, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password") // -password will not pick password from db.
    res.send(user)
  } catch (error) {
    console.error(error.message)
    res.send("Server Error")

  }
})
// Get logged in User details, Login Required.
router.post('/getlocation', async (req, res) => {
  try {
    let lat = req.body.latlong.lat
    let long = req.body.latlong.long
    console.log(lat, long)
    let location = await axios
      .get("https://api.opencagedata.com/geocode/v1/json?q=" + lat + "+" + long + "&key=74c89b3be64946ac96d777d08b878d43")
      .then(async res => {
        // console.log(`statusCode: ${res.status}`)
        console.log(res.data.results)
        // let response = stringify(res)
        // response = await JSON.parse(response)
        let response = res.data.results[0].components;
        console.log(response)
        let { village, county, state_district, state, postcode } = response
        return String(village + "," + county + "," + state_district + "," + state + "\n" + postcode)
      })
      .catch(error => {
        console.error(error)
      })
    res.send({ location })

  } catch (error) {
    console.error(error.message)
    res.send("Server Error")

  }
})
router.post('/foodData', async (req, res) => {
  try {
   const foodItems = await Products.find({});
        const foodCategories = await Category.find({});
        res.send([foodItems, foodCategories]);
    // res.send([global.foodData, global.foodCategory])

  } catch (error) {
    console.error(error.message)
    res.send("Server Error")

  }
})

// ✅ New route: only get featured products
router.get('/featured-products', async (req, res) => {
  try {
    const featuredProducts = await Products.find({ featured: true }).limit(6); // limit optional
    res.status(200).json({
      status: 'success',
      data: featuredProducts,
    });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/orderData', async (req, res) => {
  let data = req.body.order_data
  await data.splice(0, 0, { Order_date: req.body.order_date })
  console.log("1231242343242354", req.body.email)

  //if email not exisitng in db then create: else: InsertMany()
  let eId = await Order.findOne({ 'email': req.body.email })
  console.log(eId)
  if (eId === null) {
    try {
      console.log(data)
      console.log("1231242343242354", req.body.email)
      await Order.create({
        email: req.body.email,
        order_data: [data]
      }).then(() => {
        res.json({ success: true })
      })
    } catch (error) {
      console.log(error.message)
      res.send("Server Error", error.message)

    }
  }

  else {
    try {
      await Order.findOneAndUpdate({ email: req.body.email },
        { $push: { order_data: data } }).then(() => {
          res.json({ success: true })
        })
    } catch (error) {
      console.log(error.message)
      res.send("Server Error", error.message)
    }
  }
})


// Get all orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await Checkout.find().sort({ createdAt: -1 }); // Sorts orders in descending order
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server Error' });
  }
});



// Get order by ID
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await Checkout.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Update order (e.g., payment status)
router.put('/orders/:id', async (req, res) => {
  try {
    const { orderStatus, shippingMethod, shippingCost, paymentMethod, estimatedDelivery, trackingNumber } = req.body;

    // Find the order by ID
    const order = await Checkout.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Update fields if they are provided
    if (orderStatus) order.orderStatus = orderStatus;
    if (shippingMethod) order.shippingMethod = shippingMethod;
    if (shippingCost) order.shippingCost = shippingCost;
    if (paymentMethod) order.paymentMethod = paymentMethod;
    if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    // Save the updated order
    const updatedOrder = await order.save();

    // Check if orderStatus has been updated and send email notification
    if (orderStatus) {
      const customerMailOptions = {
        from: 'jdwebservices1@gmail.com',
        to: order.billingAddress.email, // Customer's email from the order
        subject: `Order #${order._id} Status Update: ${orderStatus}`,
        html: `
          <h2>Hello ${order.billingAddress.firstName},</h2>
          <p>We wanted to let you know that the status of your order has been updated.</p>
          <h3>Updated Order Details:</h3>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Status:</strong> ${orderStatus}</p>
          ${estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${estimatedDelivery}</p>` : ''}
          ${trackingNumber ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
          <p>Thank you for shopping with Ek Dastar!</p>
        `
      };

      // Send the email to the customer
      transporter.sendMail(customerMailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email to customer:', error);
        } else {
          console.log('Order status update email sent:', info.response);
        }
      });
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server Error' });
  }
});
// Delete an order by ID
router.delete('/orders/:id', async (req, res) => {
  try {
    const order = await Checkout.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Delete the order
    await order.remove();

    res.status(200).json({ msg: 'Order deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Get orders by user ID
router.get('/orders/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const orders = await Checkout.find({ userId }); // Find orders by userId
    if (!orders.length) {
      return res.status(404).json({ msg: 'No orders found for this user' });
    }
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server Error' });
  }
});

router.post('/userorders', async (req, res) => {
  const userId = req.body.userId; // Extract userId from the body

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    // Find all orders that match the provided userId
    const orders = await Checkout.find({ userId: userId });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this user' });
    }

    // Return the orders
    res.status(200).json(orders);
  } catch (error) {
    // Error handling
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
});


// Get orders by payment status
router.get('/orders/status/:status', async (req, res) => {
  try {
    const status = req.params.status;
    const orders = await Checkout.find({ paymentStatus: status }); // Find orders by paymentStatus
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server Error' });
  }
});
// Middleware to verify JWT (optional for guest checkout)


router.post('/payment', async (req, res) => {
    const { amount, description, userId, uemail, billingAddress, shippingAddress, customerId, paymentMethodId, orderId } = req.body;
    console.log(amount, description, userId, uemail, billingAddress, shippingAddress, customerId, paymentMethodId, orderId);

    try {
        // Validate required fields
        if (!amount || !billingAddress || !customerId || !paymentMethodId) {
            return res.status(400).json({ msg: 'Missing required fields: amount, billingAddress, customerId, or paymentMethodId' });
        }

        const email = uemail || billingAddress?.email || shippingAddress?.email;
        if (!email) {
            return res.status(400).json({ msg: 'Email is required' });
        }

        // Convert amount to integer cents
        const amountInCents = Math.round(amount * 100);

        let order = await Order.findById(orderId);
        if (!order && orderId) {
            return res.status(404).json({ msg: 'Order not found' });
        } else if (!order) {
            order = new Order({
                userId: userId,
                email: email,
                billingAddress: billingAddress.address,
                shippingAddress: shippingAddress.address,
                amount: amount, // Keep original amount in dollars
                currency: 'AUD',
                status: 'pending',
            });
            await order.save();
        }

        await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });

        const customer = await stripe.customers.retrieve(customerId);
        if (!customer.invoice_settings || !customer.invoice_settings.default_payment_method) {
            await stripe.customers.update(customerId, {
                invoice_settings: { default_payment_method: paymentMethodId },
            });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'AUD',
            payment_method_types: ['card'],
            payment_method: paymentMethodId,
            description: description || 'Payment for order',
            customer: customerId,
            shipping: {
                name: shippingAddress?.name || billingAddress?.name || 'Unknown',
                address: {
                    line1: shippingAddress?.address?.line1 || billingAddress?.address?.line1,
                    line2: shippingAddress?.address?.line2 || billingAddress?.address?.line2 || '',
                    city: shippingAddress?.address?.city || billingAddress?.address?.city,
                    postal_code: shippingAddress?.address?.postal_code || billingAddress?.address?.postal_code,
                    country: shippingAddress?.address?.country || billingAddress?.address?.country || 'AU',
                    state: shippingAddress?.address?.state || billingAddress?.address?.state,
                },
                phone: shippingAddress?.phone || billingAddress?.phone,
            },
            receipt_email: email,
            metadata: {
                email: email,
                customerId: customerId,
                orderId: order._id.toString(),
            },
            setup_future_usage: 'off_session',
        });

        // Save Stripe response to database
        const stripeResponse = new StripeResponse({
            type: 'payment_intent',
            eventType: 'payment_intent.created',
            data: paymentIntent,
            orderId: order._id,
            userEmail: email,
        });
        await stripeResponse.save();

        order.paymentIntentId = paymentIntent.id;
        await order.save();

        res.json({ clientSecret: paymentIntent.client_secret, orderId: order._id.toString() });
    } catch (error) {
        console.error('Payment processing failed:', error);
        res.status(500).json({ msg: 'Payment processing failed', error: error.message });
    }
});

router.post('/checkoutOrder', async (req, res) => {
    try {
      const {
        billingAddress,
        userId,
        orderId,
        userEmail,
        shippingAddress,
        orderItems,
        totalAmount,
        shippingMethod,
        shippingCost,
        paymentMethod,
        paymentStatus
      } = req.body;

      console.log(billingAddress,"billingAddress");
      

      // Validate request
      if (!billingAddress || !shippingAddress || !orderItems || !totalAmount || !shippingMethod || !paymentMethod) {
        return res.status(400).json({ msg: 'All required fields must be filled' });
      }

  // 🔑 Generate ObjectId manually
    const generatedId = orderId ? new mongoose.Types.ObjectId(orderId) : new mongoose.Types.ObjectId();


     const newOrder = new Checkout({
      _id: generatedId,
      orderId: generatedId.toString(), // same as _id
      userId,
      userEmail,
      billingAddress,
      shippingAddress,
      orderItems,
      totalAmount,
      paymentStatus,
      shippingMethod,
      shippingCost,
      paymentMethod
    });

    const order = await newOrder.save();

      // Email to Customer: Order Confirmation
      const customerMailOptions = {
        from: 'jdwebserviecs1@gmail.com',
        to: billingAddress.email, // Customer's email
        subject: 'Your Order with Ek Dastar has been Placed Successfully!',
        html: `
          <h2>Thank you for your order, ${billingAddress.firstName}!</h2>
          <p>Your order has been placed successfully and is now being processed.</p>
          <h3>Order Details:</h3>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Total Amount:</strong> $${(totalAmount / 100).toFixed(2)}</p>
          <p><strong>Shipping Method:</strong> ${shippingMethod}</p>
          <p><strong>Payment Method:</strong> ${paymentMethod}</p>
          <p>We will notify you once your order is shipped. Thank you for shopping with Ek Dastar!</p>
        `
      };

      // Email to Owner: New Order Notification
      const ownerMailOptions = {
        from: 'jdwebserviecs1@gmail.com',
        to: 'jdeep514@gmail.com', // Owner's email address
        subject: 'New Order Placed on Ek Dastar',
        html: `
          <h2>New Order Alert!</h2>
          <p>A new order has been placed on Ek Dastar.</p>
          <h3>Order Details:</h3>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Customer Name:</strong> ${billingAddress.firstName}</p>
          <p><strong>Customer Email:</strong> ${billingAddress.email}</p>
          <p><strong>Total Amount:</strong> $${(totalAmount / 100).toFixed(2)}</p>
          <p><strong>Shipping Method:</strong> ${shippingMethod}</p>
          <p><strong>Payment Status:</strong> ${paymentStatus}</p>
          <p>Please review the order in the admin panel for further details.</p>
        `
      };

      // Send customer email
      transporter.sendMail(customerMailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email to customer:', error);
        } else {
          console.log('Customer email sent:', info.response);
        }
      });

      // Send owner email
      transporter.sendMail(ownerMailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email to owner:', error);
        } else {
          console.log('Owner email sent:', info.response);
        }
      });

      res.status(200).json(order);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Server Error' });
    }
});
// Create or retrieve Stripe customer
router.post('/create-customer', auth, async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    let customer;
    if (req.user) {
      // Authenticated user
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      // Check if customer exists
      const existing = await stripe.customers.list({ email: user.email, limit: 1 });
      if (existing.data.length > 0) {
        customer = existing.data[0];
      } else {
        customer = await stripe.customers.create({
          email: user.email,
          name,
          phone,
          address,
          metadata: { userId: user._id.toString() },
        });
        // Update user with customer ID
        user.stripeCustomerId = customer.id;
        await user.save();
      }
    } else {
      // Guest user
      const existing = await stripe.customers.list({ email, limit: 1 });
      if (existing.data.length > 0) {
        customer = existing.data[0];
      } else {
        customer = await stripe.customers.create({ email, name, phone, address });
      }
    }
    res.json({ customerId: customer.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create customer' });
  }
});





// Create PaymentIntent endpoint
router.post('/create-intent', async (req, res) => {
    try {
        const { amount, currency, billing_details, shipping, description, customerId } = req.body;

        if (!amount || !currency || !billing_details) {
            return res.status(400).json({ msg: 'Missing required fields: amount, currency, or billing_details' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: currency || 'AUD',
            payment_method_types: ['card'],
            receipt_email: billing_details.email,
            description: description || 'Payment for order',
            customer: customerId,
            shipping: shipping ? {
                name: shipping.name || `${billing_details.firstName} ${billing_details.lastName || ''}`,
                address: {
                    line1: shipping.address?.line1 || billing_details.address?.line1,
                    city: shipping.address?.city || billing_details.address?.city,
                    postal_code: shipping.address?.postal_code || billing_details.address?.postal_code,
                    country: shipping.address?.country || billing_details.address?.country || 'AU',
                    state: shipping.address?.state || billing_details.address?.state,
                },
                phone: shipping.phone || billing_details.phone,
            } : null,
            metadata: {
                email: billing_details.email,
                customerId: customerId || 'N/A',
            },
        });

        // Save Stripe response to database
        const stripeResponse = new StripeResponse({
            type: 'payment_intent',
            eventType: 'payment_intent.created',
            data: paymentIntent,
            stripeCustomerId: customerId,
            userEmail: billing_details.email,
        });
        await stripeResponse.save();

        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creating PaymentIntent:', error);
        res.status(500).json({ error: error.message });
    }
});
router.put('/:id/paymentStatus', async (req, res) => {
  const { paymentStatus } = req.body;
  try {
    let order = await Checkout.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Check if the user making the request is the owner of the order
    if (order.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    order.paymentStatus = paymentStatus;  // Update the payment status

    // Save the updated order
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server Error' });
  }
});

router.post('/myOrderData', async (req, res) => {
  try {
    console.log(req.body.email)
    let eId = await Order.findOne({ 'email': req.body.email })
    //console.log(eId)
    res.json({ orderData: eId })
  } catch (error) {
    res.send("Error", error.message)
  }


});

router.get('/products/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Products.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
// ✅ Add a brand
router.post('/addbrand', upload.single('img'), async (req, res) => {
  try {
    const { name } = req.body;
    let imgUrl = '';

    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path, {
        upload_preset: 'employeeApp',
      });
      imgUrl = uploaded.secure_url;
    }

    const newBrand = new Brand({ name, img: imgUrl });
    const savedBrand = await newBrand.save();

    res.status(201).json({ status: 'success', data: savedBrand });
  } catch (err) {
    console.error('Error adding brand:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 📄 Get all brands
router.get('/brands', async (req, res) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    res.status(200).json({ status: 'success', data: brands });
  } catch (err) {
    console.error('Error fetching brands:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// 📄 Get a single brand by ID
router.get('/brand/:id', async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ status: 'error', message: 'Brand not found' });
    }

    res.status(200).json({ status: 'success', data: brand });
  } catch (error) {
    console.error('Error fetching brand:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});


// ✏️ Update a brand
router.put('/brand/:id', upload.single('img'), async (req, res) => {
  try {
    const { name } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path, {
        upload_preset: 'employeeApp',
      });
      updates.img = uploaded.secure_url;
    }

    const updatedBrand = await Brand.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    if (!updatedBrand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    res.status(200).json({ status: 'success', data: updatedBrand });
  } catch (err) {
    console.error('Error updating brand:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ❌ Delete a brand
router.delete('/brand/:id', async (req, res) => {
  try {
    const deleted = await Brand.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    res.status(200).json({ status: 'success', message: 'Brand deleted' });
  } catch (err) {
    console.error('Error deleting brand:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// Define a route to handle product creation with Cloudinary image upload
router.post('/addproducts', upload.single('img'), async (req, res) => {
  try {
    const {
      name,
      description,
      CategoryName,
      brandName,
      collection, // Men, Women, Unisex
      options,
      featured,
      quantity
    } = req.body;
    
    const validCollections = ['Men', 'Women', 'Unisex'];
  const cleanCollection = validCollections.includes(collection) ? collection : undefined;
    // Upload product image to Cloudinary
    const uploadedImg = await cloudinary.uploader.upload(req.file.path, {
      upload_preset: 'employeeApp',
    });

    // Find category by name
    const category = await Category.findOne({ CategoryName });
    if (!category) {
      return res.status(400).json({ error: 'Category not found' });
    }

    // Optional: Find or create brand
    let brand = null;
    if (brandName) {
      brand = await Brand.findOne({ name: brandName });
      if (!brand) {
        brand = await new Brand({ name: brandName }).save(); // Create if not found
      }
    }

    // Create new product
    const newProduct = new Products({
      name,
      description,
      CategoryName: category.CategoryName,
      brand: brand ? brand._id : undefined,
      collection,
      img: uploadedImg.secure_url,
      featured: featured === 'true' || featured === true,
      options: options ? JSON.parse(options) : [],
      inventory: {
        quantity: quantity || 0,
      },
    });

    const savedProduct = await newProduct.save();
    global.foodData.push(savedProduct); // Optional: update global cache

    res.status(201).json({
      status: 'success',
      data: savedProduct,
    });
  } catch (error) {
    console.error('Error in /addproducts:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// POST route to import products from CSV
router.post('/import-csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const filePath = path.resolve(req.file.path);

    console.log('Uploaded file path:', filePath);

    const results = [];
    const inserted = [];

    // Create read stream from uploaded file on disk
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        console.log('Parsed row:', row); // Debug each row
        results.push(row);
      })
      .on('error', (err) => {
        console.error('CSV parsing error:', err);
      })
      .on('end', async () => {
        console.log(`Total rows parsed: ${results.length}`);

        for (const row of results) {
          try {
            const {
              name,
              description,
              CategoryName,
              img,
              featured,
              quantity,
              options,
            } = row;

            const newProduct = new Products({
              name,
              description,
              CategoryName,
              img,
              featured: featured === 'true',
              inventory: { quantity: Number(quantity) || 0 },
              options: options ? JSON.parse(options) : {},
            });

            const savedProduct = await newProduct.save();
            inserted.push(savedProduct);
          } catch (err) {
            console.error('Error saving product:', err.message);
          }
        }

        res.status(201).json({
          message: 'CSV import complete',
          count: inserted.length,
          data: inserted,
        });
      });
  } catch (err) {
    console.error('CSV import error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/product', async (req, res) => {
    try {
        const { lowStock } = req.query;
        let query = {};

        if (lowStock === 'true') {
            query['inventory.quantity'] = { $lte: Products.schema.path('inventory.lowStockThreshold').defaultValue };
        }

        const products = await Products.find(query);
        res.set('Cache-Control', 'no-store'); // Prevent caching
        res.status(200).json({
            status: 'success',
            data: products,
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/product/:id', async (req, res) => {
    try {
        const product = await Products.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.set('Cache-Control', 'no-store'); // Prevent caching
        res.status(200).json({
            status: 'success',
            data: product,
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/product/:id', upload.single('img'), async (req, res) => {
  try {
    const { name, description, CategoryName, options, quantity } = req.body;
    let updatedProduct = {
      name,
      description,
      CategoryName,
      options: JSON.parse(options),
    };

    if (quantity !== undefined) {
      updatedProduct['inventory.quantity'] = quantity; // Update inventory quantity
    }

    if (req.file) {
      const uploadedImg = await cloudinary.uploader.upload(req.file.path, {
        upload_preset: 'employeeApp',
      });
      updatedProduct.img = uploadedImg.secure_url;
    }

    const product = await Products.findByIdAndUpdate(req.params.id, updatedProduct, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
// Update global.foodData
        global.foodData = global.foodData.map(item =>
            item._id.toString() === req.params.id ? product : item
        );
    res.status(200).json({
      status: 'success',
      data: product,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.patch('/product/:id/inventory', async (req, res) => {
  try {
    const { adjustment } = req.body; // Positive for restock, negative for sale
    if (typeof adjustment !== 'number') {
      return res.status(400).json({ error: 'Adjustment must be a number' });
    }

    const product = await Products.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const newQuantity = product.inventory.quantity + adjustment;
    if (newQuantity < 0) {
      return res.status(400).json({ error: 'Inventory cannot be negative' });
    }

    product.inventory.quantity = newQuantity;
    await product.save();

    res.status(200).json({
      status: 'success',
      data: product,
    });
  } catch (error) {
    console.error('Error adjusting inventory:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/product/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    // Find the product in the database
    const product = await Products.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Optionally, delete the image from Cloudinary
    const imagePublicId = product.img.split('/').pop().split('.')[0]; // Extract the public ID from the image URL
    await cloudinary.uploader.destroy(imagePublicId); // Delete image from Cloudinary

    // Remove product from the database
    await product.remove();

    // Remove product from global.foodData
    global.foodData = global.foodData.filter(item => item.id !== productId); // Adjust this line as necessary based on your foodData structure

    // Send success response
    res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/product/slug/:slug', async (req, res) => {
  try {
    const product = await Products.findOne({ slug: req.params.slug });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
router.get('/product/search', async (req, res) => {
  try {
    const searchTerm = req.query.q; // Query parameter for search term
    const products = await Products.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive name search
        { CategoryName: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive category search
      ],
    });

    res.status(200).json({
      status: 'success',
      data: products,
    });
  } catch (error) {
    console.error('Error searching for products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// POST /api/category/addcategory
router.post('/addcategory', upload.single('img'), async (req, res) => {
  try {
    const { CategoryName } = req.body;

    // Upload image to Cloudinary
    const uploadedImg = await cloudinary.uploader.upload(req.file.path, {
      upload_preset: 'employeeApp',
    });

    // Create new category
    const newCategory = new Category({
      CategoryName,
      img: uploadedImg.secure_url,
    });

    // Save to the database
    const savedCategory = await newCategory.save();
    global.foodCategory.push(savedCategory);
    res.status(201).json({
      status: 'success',
      data: savedCategory,
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



//get a list of Category
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find(); // Get all categories from MongoDB
    res.status(200).json({
      status: 'success',
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(200).json({
      status: 'success',
      data: category,
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.put('/categories/:id', upload.single('img'), async (req, res) => {
  try {
    const { CategoryName } = req.body;

    // Find the existing category
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if a new image is provided and upload to Cloudinary
    if (req.file) {
      const uploadedImg = await cloudinary.uploader.upload(req.file.path, {
        upload_preset: 'employeeApp',
      });
      category.img = uploadedImg.secure_url; // Update image URL
    }

    // Update the category name
    category.CategoryName = CategoryName || category.CategoryName;

    // Save the updated category
    const updatedCategory = await category.save();
    res.status(200).json({
      status: 'success',
      data: updatedCategory,
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /api/category/:id
router.delete('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(200).json({
      status: 'success',
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// routes/category.js (continuation)
// API to fetch products by categoryName
router.get('/products/category/:categoryName', async (req, res) => {
  try {
      const categoryName = req.params.categoryName;
      const products = await Products.find({ CategoryName: categoryName });

      if (products.length === 0) {
          return res.status(404).json({ message: 'No products found for this category' });
      }

      res.json(products);
  } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});


//forgotPassword api
const resetTokens = {};
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email exists in MongoDB
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email not found.' });
    }

    // Generate a unique reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Save the reset token and its expiry date in the database
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();


    // Send a password reset email to the user
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      secure: false,
      auth: {
       user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: 'jdwebservices1@gmail.com',
      to: email,
      subject: 'Password Reset',
      text: `Click the following link to reset your password: https://ekdastarstore.onrender.com/reset-password/${resetToken}`,
    };

    await transporter.sendMail(mailOptions);
    res.json({
      message: 'Password reset email sent. Check your inbox.',
      resetToken: resetToken
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while processing the request.' });
  }
});


// Reset password endpoint
router.post('/reset-password/:resetToken', async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  try {
    // Find user by reset token
    const user = await User.findOne({ resetToken, resetTokenExpiry: { $gt: Date.now() } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    const salt = await bcrypt.genSalt(10)
    let securePass = await bcrypt.hash(password, salt);

    // Update password and reset token
    user.password = securePass; // In a real-world scenario, remember to hash the password
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    // Save the updated user
    await user.save();

    return res.json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// Route to handle payments
// router.post('/payment', async (req, res) => {
//   const { amount } = req.body;

//   try {
//       const paymentIntent = await stripe.paymentIntents.create({
//           amount,
//           currency: 'inr',
//           automatic_payment_methods: {
//               enabled: true,
//               allow_redirects: 'never',
//           },
//           description
//       });

//       res.status(200).json({ clientSecret: paymentIntent.client_secret });
//   } catch (error) {
//       console.error('Error creating payment intent:', error.message);
//       res.status(500).json({ error: error.message });
//   }
// });




// POST /api/create-checkout-session
router.post('/create-checkout-session', async (req, res) => {
    try {
        const { lineItems, successUrl, cancelUrl, customerId, userEmail, orderId } = req.body;

        if (!lineItems || !successUrl || !cancelUrl) {
            return res.status(400).json({ msg: 'Missing required fields: lineItems, successUrl, or cancelUrl' });
        }

        if (!Array.isArray(lineItems) || lineItems.length === 0) {
            return res.status(400).json({ msg: 'lineItems must be a non-empty array' });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            customer: customerId || undefined,
            metadata: {
                userEmail: userEmail || 'N/A',
                orderId: orderId || 'N/A',
            },
        });

        // Save Stripe response to database
        const stripeResponse = new StripeResponse({
            type: 'checkout_session',
            eventType: 'checkout.session.created',
            data: session,
            orderId: orderId,
            userId: customerId,
            userEmail: userEmail,
        });
        await stripeResponse.save();

        res.json({ sessionId: session.id });
    } catch (error) {
        console.error('Error creating Checkout Session:', error);
        res.status(500).json({ error: 'Failed to create checkout session', details: error.message });
    }
});

// POST /api/stripe-webhook
// router.post('/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
//   const sig = req.headers['stripe-signature'];

//   let event;

//   try {
//     // Use the raw body and your webhook secret from environment variables
//     event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
//   } catch (err) {
//     console.error('Webhook Error:', err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   // Handle the event
//   switch (event.type) {
//     case 'checkout.session.completed':
//       const session = event.data.object;
//       console.log('Checkout Session completed:', session);
//       // TODO: Update your database (e.g., mark order as paid)
//       // Example: Update order status in your database
//       // await Order.findByIdAndUpdate(session.metadata.orderId, { status: 'paid' });
//       break;

//     case 'payment_intent.succeeded':
//       const paymentIntent = event.data.object;
//       console.log('PaymentIntent succeeded:', paymentIntent);
//       // TODO: Update your database (e.g., mark order as paid)
//       // Example: Update order status in your database
//       // await Order.findByIdAndUpdate(paymentIntent.metadata.orderId, { status: 'paid' });
//       break;

//     case 'payment_intent.payment_failed':
//       const paymentIntentFailed = event.data.object;
//       console.log('PaymentIntent failed:', paymentIntentFailed);
//       // TODO: Handle failed payment (e.g., notify user, update order status)
//       break;

//     default:
//       console.log(`Unhandled event type ${event.type}`);
//   }

//   // Return a response to acknowledge receipt of the event
//   res.json({ received: true });
// });

// Dashbaord api's
// 1. Total Products
router.get('/total-products', async (req, res) => {
  try {
    const totalProducts = await Products.countDocuments();
    res.json({ totalProducts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching total products', error });
  }
});

// 2. Total Categories
router.get('/total-categories', async (req, res) => {
  try {
    const totalCategories = await Category.countDocuments();
    res.json({ totalCategories });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching total categories', error });
  }
});

// 3. Total Featured Products
router.get('/total-featured-products', async (req, res) => {
  try {
    const totalFeaturedProducts = await Products.countDocuments({ featured: true });
    res.json({ totalFeaturedProducts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching featured products', error });
  }
});

// 4. Sales Overview (Monthly Sales Data)
router.get('/sales-overview', async (req, res) => {
  try {
    // Fetch orders (assuming this is the correct collection)
    const orders = await Order.find();
    console.log('Orders:', orders); // Debug: Verify the data

    const monthlySales = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Initialize monthly sales
    months.forEach(month => (monthlySales[month] = 0));

    // Process each order
    orders.forEach(order => {
      // Use orderDate if available, otherwise fallback to _id timestamp
      const orderDate = order.orderDate ? new Date(order.orderDate) : new Date(order._id.getTimestamp());
      const totalAmount = order.totalAmount || 0; // Use totalAmount if available

      const month = months[orderDate.getMonth()];
      monthlySales[month] += totalAmount;
    });
    console.log(orders,"or");
    

    const salesData = {
      labels: months,
      datasets: [
        {
          label: 'Sales',
          data: months.map(month => monthlySales[month]),
          backgroundColor: '#0d6efd',
          borderColor: '#0d6efd',
          borderWidth: 1,
        },
      ],
    };

    res.json(salesData);
  } catch (error) {
    console.error('Error in sales-overview:', error);
    res.status(500).json({ message: 'Error fetching sales overview', error });
  }
});
module.exports = router