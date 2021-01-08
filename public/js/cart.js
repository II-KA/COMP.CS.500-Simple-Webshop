const cartTemplate = document.querySelector('#cart-item-template');
const cartContainer = document.querySelector('#cart-container');

const loadCart = async () => {
    cartContainer.textContent = '';
    if (sessionStorage.length === 0) return;
    const json = await getJSON('/api/cart');
    json.forEach(product => {
        if (sessionStorage.getItem(product._id) === null) return;

        const clone = cartTemplate.content.cloneNode(true);

        clone.querySelector('.item-row').id = `product-${product._id}`;
        const productName = clone.querySelector('.product-name');
        productName.id = `name-${product._id}`;
        productName.textContent = product.name;
        const productPrice = clone.querySelector('.product-price');
        productPrice.id = `price-${product._id}`;
        productPrice.textContent = product.price;
        const productAmount = clone.querySelector('.product-amount');
        productAmount.id = `amount-${product._id}`;
        productAmount.textContent = `${sessionStorage.getItem(product._id)}x`;
        const productDescription = clone.querySelector('.product-description');
        productDescription.id = `description-${product._id}`;
        productDescription.textContent = product.description;
        productDescription.style.display = "none";
        const buttons = clone.querySelectorAll('.cart-minus-plus-button');
        buttons[0].id = `plus-${product._id}`;
        buttons[1].id = `minus-${product._id}`;

        cartContainer.appendChild(clone);
    });
    increaseOrDecreaseEventListener();
    placeOrderEventListener();
};

loadCart();

const increaseOrDecreaseEventListener = () => {
    document.querySelectorAll('.cart-minus-plus-button').forEach(button => {
        button.addEventListener('click', async e => {
            const id = e.target.id.split('-')[1];
            const name = document.querySelector(`#name-${id}`).textContent;
            const amount = parseInt(sessionStorage.getItem(id));
            if (button.id.split('-')[0] === 'plus') {
                sessionStorage.setItem(id, amount + 1);
                createNotification(`Added one ${name} to cart!`, 'notifications-container');
                updateCart(id);
                return;
            }    
            if (amount === 1) {
                sessionStorage.removeItem(id);
                createNotification(`Removed the product ${name} from cart.`, 'notifications-container');
                updateCart(id);
                return;
            }
            sessionStorage.setItem(id, amount - 1);
            createNotification(`Removed one ${name} from cart.`, 'notifications-container');
            updateCart(id);
        });
    });
};

const placeOrderEventListener = () => {
    document.querySelector('#place-order-button').addEventListener('click', async e => {
        if (cartContainer.textContent === '') return;

        const items = [];
        document.querySelectorAll('#cart-container>.item-row').forEach(row => {
            const product = {
                _id: row.id.split('-')[1],
                name: row.querySelector('.product-name').textContent,
                price: row.querySelector('.product-price').textContent,
                description: row.querySelector('.product-description').textContent
            };
            const quantity = row.querySelector('.product-amount').textContent.replace('x', '');
            items.push({ product, quantity });
        });
        const order = { items };
        postOrPutJSON('/api/orders', 'POST', order);

        createNotification('Successfully created an order!', 'notifications-container');
        sessionStorage.clear();
        document.querySelector('#cart-container').textContent = '';
    });
};

const updateCart = id => {
    if (sessionStorage.getItem(id) === null) removeElement('cart-container', `product-${id}`);
    else document.querySelector(`#amount-${id}`).textContent = `${sessionStorage.getItem(id)}x`;
};
