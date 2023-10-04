# A super simple web shop with vanilla HTML, CSS

## Feares
Non-logged-in:
- able to register as a new customer

Customers:
- able to add products to cart, modify amount of products in cart and make an order
- able to see their own orders

Admins:
- management of users & products (addition, deletion, modification)
- able to see all orders

## The project structure

Some of the project structure was provided by course staff. Below are the files our group was responsible for.

```
.
├── routes.js               --> process client request & respond accordingly
├── auth                    
│   └──  auth.js            --> user authorization
├── controllers             --> convert commands for models
│   ├── orders.js           --> controller for orders
│   ├── products.js         --> controller for products
│   └── users.js            --> controller for user
├── models                  --> mongoose models
│   ├── order.js            --> order schema
│   ├── product.js          --> product schema
│   └── user.js             --> user schema
├── public
│   ├── js
│   │  ├── adminUsers.js    --> users.html js
│   │  ├── cart.js          --> cart.html js
│   │  ├── orders.js        --> orders.html js
│   │  ├── products.js      --> products.html js
│   │  ├── register.js      --> register.html js
│   │  └── utils.js         --> utility functions for sending requests
│   ├── css                 
│   │  └── styles.css       --> CSS for the shop
│   ├── cart.html           --> viewing cart products & making orders
│   ├── orders.html         --> viewing customers own orders / all orders if 
│   │                           admin
│   ├── products.html       --> product listing & adding to cart. Additionally 
│   │                           management for admins (add, modify, delete) 
│   ├── register.html       --> new user registration
│   └── users.html          --> user listing / management for admins
├── utils                   --> utility functions for server side
│   ├── requestUtils.js     --> utility functions for request processing
│   └── responseUtils.js    --> utility functions for sending requests
├── test
│   └── own                 --> our UI tests, can be run with the command: 
npx mocha --require test/setup.test.js --exit --timeout 10000 test/own/ourOwnTests.js

```
