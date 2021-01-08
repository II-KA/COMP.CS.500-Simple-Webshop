const orderTemplate = document.querySelector('#order-template');
const productTemplate = document.querySelector('#product-template');

const loadOrders = async () => {
    document.querySelector('#orders-container').textContent = '';
    const userRole = await getJSON('/api/currentUserRole');
    if (userRole === 'customer') document.querySelector('h1').textContent = 'Your orders';
    const json = await getJSON('/api/orders');
    if (json.length <= 0) {
        document.querySelector('#orders-container').textContent = 'No orders have been made.';
    }
    json.forEach(async order => {
        const orderClone = orderTemplate.content.cloneNode(true);
        if (userRole === 'admin') {
            const user = await getJSON(`/api/users/${order.customerId}`);
            orderClone.querySelector('.user-name').id = `name-${user._id}`;
            orderClone.querySelector('.user-name').textContent = user.name;
            orderClone.querySelector('.user-email').id = `email-${user._id}`;
            orderClone.querySelector('.user-email').textContent = user.email;
        }
        let priceSum = 0;
        order.items.forEach(item => {
            const clone = productTemplate.content.cloneNode(true);
            priceSum += parseInt(item.quantity) * parseFloat(item.product.price);
            
            clone.querySelector('.product-row').id = `product-${item.product._id}`;
            clone.querySelector('.product-qantityAndName').id = `name-${item.product._id}`;
            clone.querySelector('.product-qantityAndName').textContent = `${item.quantity}x ${item.product.name}`;
            clone.querySelector('.product-description').id = `description-${item.product._id}`;
            clone.querySelector('.product-description').textContent = item.product.description;
            clone.querySelector('.product-price').id = `price-${item.product._id}`;
            clone.querySelector('.product-price').textContent = item.product.price;

            orderClone.querySelector('#products-container').appendChild(clone);
        });
        orderClone.querySelector('.order-sum>h4').textContent += priceSum.toFixed(2);
        document.querySelector('#orders-container').appendChild(orderClone);
    });
};

loadOrders();