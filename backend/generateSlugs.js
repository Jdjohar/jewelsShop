// generateSlugs.js

const mongoose = require('mongoose');
const slugify = require('slugify');
const Product = require('./models/Product'); // Adjust path if needed

// Replace with your MongoDB connection string
const MONGODB_URI = 'mongodb+srv://eshajdwebservices:jdweb123@cluster0.evzfn2i.mongodb.net/jewelshop?retryWrites=true&w=majority';

const run = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const products = await Product.find();

    for (const product of products) {
      if (!product.slug) {
        product.slug = slugify(product.name, { lower: true, strict: true });
        await product.save();
        console.log(`Updated: ${product.name} → ${product.slug}`);
      }
    }

    console.log('✅ Slug generation completed!');
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error generating slugs:', error);
  }
};

run();
