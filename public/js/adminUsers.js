const userTemplate = document.querySelector('#user-template');
const formTemplate = document.querySelector('#form-template');
const usersContainer = document.querySelector('#users-container');

const updateUsers = async () => {
    usersContainer.textContent = '';
    const json = await getJSON("/api/users");
    json.forEach(user => {
        const clone = userTemplate.content.cloneNode(true);

        clone.querySelector('.item-row').id = `user-${user._id}`;
        const userName = clone.querySelector('.user-name');
        userName.id = `name-${user._id}`;
        userName.textContent = user.name;
        const userEmail = clone.querySelector('.user-email');
        userEmail.id = `email-${user._id}`;
        userEmail.textContent = user.email;
        const userRole = clone.querySelector('.user-role');
        userRole.id = `role-${user._id}`;
        userRole.textContent = user.role;
        clone.querySelector('.modify-button').id = `modify-${user._id}`;
        clone.querySelector('.delete-button').id = `delete-${user._id}`;

        usersContainer.appendChild(clone);
    });
    addDeleteEventlisteners();
    addModifyEventlisteners();
};
updateUsers();

const addDeleteEventlisteners = () => {
    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', async e => {
            removeElement('modify-user', 'edit-user-form');
            const user = await deleteResourse(`/api/users/${e.target.id.split('-')[1]}`);
            if (user.error !== undefined) {
                createNotification(`${user.error}`, 'notifications-container', false);
                return;
            } 
            createNotification(`Deleted user ${user.name}`, 'notifications-container');
            updateUsers();
        });
    });
};

const addModifyEventlisteners = () => {
    document.querySelectorAll('.modify-button').forEach(button => {
        button.addEventListener('click', e => {
            removeElement('modify-user', 'edit-user-form');

            const clone = formTemplate.content.cloneNode(true);
            const id = e.target.id.split('-')[1];
            // populate edit form with values of selected user
            const userRow = document.querySelector(`#user-${id}`);
            clone.querySelector('h2').textContent = `Modify user ${userRow.querySelector('.user-name').textContent}`;
            clone.querySelector('#id-input').value = id;
            clone.querySelector('#name-input').value = userRow.querySelector('.user-name').textContent;
            clone.querySelector('#email-input').value = userRow.querySelector('.user-email').textContent;
            clone.querySelector('#role-input').value = userRow.querySelector('.user-role').textContent;

            document.querySelector('#modify-user').appendChild(clone);
            document.querySelector('#edit-user-form').addEventListener('submit', updateUser);
        });
    });
};

const updateUser = async e => {
    e.preventDefault();
    const form = document.querySelector('#edit-user-form');
    const name = form.elements['name-input'].value;
    const user = { role: form.elements['role-input'].value };
    removeElement('modify-user', 'edit-user-form');
    const res = await postOrPutJSON(`/api/users/${form.elements['id-input'].value}`, 'PUT', user);
    if (res.error !== undefined) {
        createNotification(`${res.error}`, 'notifications-container', false);
        return;
    }
    createNotification(`Updated user ${name}`, 'notifications-container');
    updateUsers();
};
