const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderedItemSchema = new Schema({
    product: {
        type: Object,
        required: true,
        _id: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
            validate: {
                validator: (num) => { return num > 0; },
                message: 'Price should be greater than 0.'
            }
        },
        description: { type: String }
    },
    quantity: {
        type: Number,
        required: true,
        validate: {
            validator: (num) => { return num > 0; },
            message: 'There should be at least 1 ordered item.'
        }
    }
});

const orderSchema = new Schema({
  customerId: {
      type: String,
      required: true
  },
  items: {
      type: [orderedItemSchema],
      required: true,
      validate: {
          validator: (arr) => {
              return arr.length > 0; 
            },
          message: 'Order should contain products'
      }
  }
});

// Omit the version key when serialized to JSON
orderSchema.set('toJSON', { virtuals: false, versionKey: false });

const Order = new mongoose.model('Order', orderSchema);
module.exports = Order;