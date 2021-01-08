const productTemplate = document.querySelector('#product-template');
const productsContainer = document.querySelector('#products-container');

const loadProducts = async () => {
    productsContainer.textContent = '';

    const json = await getJSON('/api/products');
    json.forEach(product => {
        const clone = productTemplate.content.cloneNode(true);

        clone.querySelector('.item-row').id = `product-${product._id}`;
        const productName = clone.querySelector('.product-name');
        productName.id = `name-${product._id}`;
        productName.textContent = product.name;
        const productDescription = clone.querySelector('.product-description');
        productDescription.id = `description-${product._id}`;
        productDescription.textContent = product.description;
        const productPrice = clone.querySelector('.product-price');
        productPrice.id = `price-${product._id}`;
        productPrice.textContent = product.price;

        productsContainer.appendChild(clone);
    });
    addButtons();
};

loadProducts();

const addButtons = async () => {
    const userRole = await getJSON('/api/currentUserRole');
    if (userRole === 'admin') {
        const adminButtons = document.querySelector('#buttons-admin');

        if (document.querySelector('#add-button-container').innerHTML === '') {
            const btn = document.createElement("BUTTON");
            btn.innerText = 'Add a product';
            btn.className = 'add-product-button'
            document.querySelector('#add-button-container').appendChild(btn);
            addProductEventListener();
        }
        // add modify & delete -buttons to products
        document.querySelectorAll('.item-row').forEach(item => {
            const clone = adminButtons.content.cloneNode(true);
            const id = item.id.split('-')[1];
            clone.querySelector('.modify-button').id = `modify-${id}`;
            clone.querySelector('.delete-button').id = `delete-${id}`;
            item.querySelector('#buttons-container').appendChild(clone);
        });
        modifyEventListener();
        deleteEventListener();
    }
    if (userRole === 'customer') {
        const customerButtons = document.querySelector('#buttons-customer');
        // add 'add to cart' -button to products
        document.querySelectorAll('.item-row').forEach(item => {
            const clone = customerButtons.content.cloneNode(true);
            const id = item.id.split('-')[1];
            clone.querySelector('.add-button').id = `add-to-cart-${id}`;
            item.querySelector('#buttons-container').appendChild(clone);
        });
        addToCartEventListener();
    }
};

const addToCartEventListener = () => {
    document.querySelectorAll('.add-button').forEach(button => {
        button.addEventListener('click', async e => {
            const id = e.target.id.split('-')[3];
            createNotification(`Added ${document.querySelector(`#name-${id}`).textContent} to cart!`, 'notifications-container');
            const amount = sessionStorage.getItem(id);
            if (amount === null) sessionStorage.setItem(id, 1);
            else sessionStorage.setItem(id, parseInt(amount) + 1);
        });
    });
};

const addProductEventListener = () => {
    const addTemplate = document.querySelector('#add-product-form-template');
    
    document.querySelector('.add-product-button').addEventListener('click', e => {
            removeElement('forms-container', 'edit-product-form');
            removeElement('forms-container', 'add-product-form');

            const clone = addTemplate.content.cloneNode(true);
            document.querySelector('#forms-container').appendChild(clone);
            document.querySelector('#add-product-form').addEventListener('submit', addProduct);
    });
};

const addProduct = e => {
    e.preventDefault();
    const form = document.querySelector('#add-product-form');
    const name = form.elements['name-input'].value;
    const product = {
        name: name,
        price: form.elements['price-input'].value,
        description: form.elements['description-input'].value
    };
    removeElement('forms-container', 'add-product-form');
    postOrPutJSON('/api/products', 'POST', product);
    createNotification(`Added product ${name}`, 'notifications-container');
    loadProducts();
};

const modifyEventListener = () => {
    const editTemplate = document.querySelector('#edit-product-form-template');

    document.querySelectorAll('.modify-button').forEach(button => {
        button.addEventListener('click', async e => {
            removeElement('forms-container', 'edit-product-form');
            removeElement('forms-container', 'add-product-form');

            const id = e.target.id.split('-')[1];
            const clone = editTemplate.content.cloneNode(true);
            const product = await getJSON(`/api/products/${id}`);
            clone.querySelector('h2').textContent = `Modify product ${product.name}`;
            clone.querySelector('#id-input').value = product._id;
            clone.querySelector('#name-input').value = product.name;
            clone.querySelector('#price-input').value = product.price;
            clone.querySelector('#description-input').value = product.description;

            document.querySelector('#forms-container').appendChild(clone);
            document.querySelector('#edit-product-form').addEventListener('submit', updateProduct);
        });
    });
};

const updateProduct = e => {
    e.preventDefault();
    const form = document.querySelector('#edit-product-form');
    const id = form.elements['id-input'].value;
    const name = form.elements['name-input'].value;
    const product = {
        name: name,
        price: form.elements['price-input'].value,
        description: form.elements['description-input'].value
    };
    removeElement('forms-container', 'edit-product-form');
    postOrPutJSON(`/api/products/${id}`, 'PUT', product);
    createNotification(`Updated product ${name}`, 'notifications-container');
    loadProducts();
};

document.querySelectorAll('.modify-button').forEach(button => {
    button.addEventListener('click', async e => {
        removeElement('modify-user', 'edit-user-form');
        removeElement('forms-container', 'add-product-form');

        const id = e.target.id.split('-')[1];
        const clone = formTemplate.content.cloneNode(true);

        const user = await getJSON(`/api/users/${id}`);
        clone.querySelector('h2').textContent = `Modify user ${user.name}`;
        clone.querySelector('#id-input').value = user._id;
        clone.querySelector('#name-input').value = user.name;
        clone.querySelector('#email-input').value = user.email;
        clone.querySelector('#role-input').value = user.role;

        document.querySelector('#modify-user').appendChild(clone);
        document.querySelector('#edit-user-form').addEventListener('submit', updateUser);
    });
});

const deleteEventListener = () => {
    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', async e => {
            removeElement('forms-container', 'edit-product-form');
            removeElement('forms-container', 'add-product-form');

            const id = e.target.id.split('-')[1];
            const product = await deleteResourse(`/api/products/${id}`);
            createNotification(`Deleted product ${product.name}`, 'notifications-container');
            loadProducts();
        });
    });
};