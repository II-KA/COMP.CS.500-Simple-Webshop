const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
      type: Number,
      required: true,
      validate: {
          validator: (num) => { return num > 0; },
          message: 'Price should be greater than 0.'
      }
  },
  image: {
      type: String
      // TODO: check that format is in uri
  },
  description: {
      type: String
  }
});

// Omit the version key when serialized to JSON
productSchema.set('toJSON', { virtuals: false, versionKey: false });

const Product = new mongoose.model('Product', productSchema);
module.exports = Product;
