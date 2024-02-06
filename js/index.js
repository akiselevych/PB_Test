'use strict'

const root = document.getElementById('root');

//Creation of container for posts
const cardsContainer = document.createElement('div');
cardsContainer.className = 'cards_container';
root.appendChild(cardsContainer);

//Creation of overlay for form
const overlay = document.createElement('div');
overlay.className = 'overlay';
overlay.addEventListener('click', () => {
    overlay.style.display = 'none';
    createModalForm.style.display = 'none';
});
root.appendChild(overlay);


// This function used to fetch posts by pagination
const fetchPostsHandler = () => {
    const limit = 9;
    let page = 0;

    return async () => {
        const resp = await fetch(
            `https://jsonplaceholder.typicode.com/posts?_start=${page}&_limit=${limit}`,
            {
                method: 'GET',
            }
        );
        if (!resp.ok) {
            alert(`Error ${resp.status}`)
        }

        page++;
        return await resp.json();
    }
}
const fetchPosts = fetchPostsHandler();

// This function used to fetch one post by id
const fetchOnePostHandler = (id) => {
    return async () => {
        const resp = await fetch(
            `https://jsonplaceholder.typicode.com/posts/${id}`,
            {
                method: 'GET',
            }
        );
        if (!resp.ok) {
            alert(`Error ${resp.status}`)
        }

        return await resp.json();
    }
}

// This function handles the submission event for posting requests.
const postRequestHandler = async function (event) {
    event.preventDefault();
    const title = event.target[0].value
    const body = event.target[1].value
    if (!validateFormFields(event)) {
        return;
    }
    const res = await fetch('https://jsonplaceholder.typicode.com/posts',
        {
            method: 'POST',
            body: JSON.stringify({
                userId: 1,
                title: title,
                body: body
            })
        });
    if (res.status === 201) {
        resetForm(event);
        cardBuilder({
            id: 'NEW',
            userId: 1,
            title: title,
            body: body
        });
        createModalForm.removeEventListener('submit',postRequestHandler)
    } else {
        insertErrorForm();
    }
}

// This function returns an event handler for update requests associated with a specific ID.
const updateRequest = (id) => {
    return async (event) => {
        event.preventDefault();
        const title = event.target[0].value
        const body = event.target[1].value
        if (!validateFormFields(event)) {
            return;
        }

        const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`,
            {
                method: 'PUT',
                body: JSON.stringify({
                    userId: 1,
                    title: title,
                    body: body
                })
            });

        if (res.status === 200) {
            resetForm(event);

            document.querySelectorAll('.card').forEach(item => {
                if (item.querySelector('.card__id').textContent.split(" ")[1] == id){
                    item.querySelector('.card__title').innerText = title;
                    item.querySelector('.card__body').innerText = body;
                }
            });

            createModalForm.removeEventListener('submit',updateRequestHandler)
        } else {
            insertErrorForm();
        }
    }
}
// This variable is used to store a reference to the update function to be able to remove the event listener
// after the request, as we have dynamic ID requests.
let updateRequestHandler;


// This function returns an event handler for delete requests associated with a specific ID.
const deleteRequest = (id) => {
    return async () => {

        const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`,
            {
                method: 'DELETE'
            });

        if (res.status === 200) {
            document.querySelectorAll('.card').forEach(item => {
                if (item.querySelector('.card__id').textContent.split(" ")[1] == id){
                    item.remove();
                }
            });
        } else {
            alert(`Error ${res.status}`)
        }
    }
}

//This function is used to validate form fields
const validateFormFields = (event) => {
    if (event.target[0].value.trim() === '' && event.target[1].value.trim() === '') {
        const error = document.createElement('span');
        error.innerText = 'Fields should not be empty';
        error.style.marginTop = '20px';
        error.style.color = 'red';
        createModalForm.appendChild(error);
        return false;
    }
    return true;
}

//This function is used to reset form fields and hide form with overlay after successful request
const resetForm = (event) => {
    event.target[0].value = '';
    event.target[1].value = '';
    createModalForm.style.display = 'none';
    document.querySelector('.overlay').style.display = 'none';
}

//This function is used to insert error message into form after rejected request
const insertErrorForm = () => {
    const error = document.createElement('span');
    error.innerText = 'Error';
    error.style.marginTop = '20px';
    error.style.color = 'red';
    createModalForm.appendChild(error);
}

//Creation of modal for creating cards
const createModalForm = document.createElement('form');
createModalForm.className = 'modal';
createModalForm.innerHTML = `
            <input type="text" class="modal__input" name="title" id="title_input" placeholder="Enter title">
            <textarea cols="6" rows="4" class="modal__input" name="body" id="body_input" placeholder="Enter body"></textarea>
            <button type="submit" class="default_btn">Save</button>
`;


root.appendChild(createModalForm);

//Creation of button for creating post
const createButton = document.createElement('div');
createButton.className = 'default_btn create_btn';
createButton.type = 'button';
createButton.innerText = 'Create post';

createButton.addEventListener('click', () => {
    createModalForm.style.display = 'flex';
    createModalForm.removeEventListener('submit',updateRequestHandler);
    createModalForm.addEventListener('submit', postRequestHandler);
    overlay.style.display = 'block';
});

//Creation of load more posts
const loadBtn = document.createElement('button');
loadBtn.className = 'default_btn load_btn';
loadBtn.type = 'button';
loadBtn.innerText = 'Load cards';

loadBtn.addEventListener('click', () => fetchPosts().then(res => {
    res.forEach(cardItem => cardBuilder(cardItem));
}))

//Insertion  buttons into container
const buttonsContainer = document.createElement('div');
buttonsContainer.className = 'buttons_container';
buttonsContainer.append(loadBtn, createButton);



//Card builder for create html of post element
const cardBuilder = (cardItem) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
            <div class="card__header">
                <div class="card__header-info">
                    <span>Author: ${cardItem.userId}</span>
                    <span class="card__id">Id: ${cardItem.id}</span>
                </div>
                <div class="card__header-actions">
                    <span class="card__header-edit">EDIT</span>
                    <span class="card__header-delete">DELETE</span>
                </div>
            </div>
            <p class="card__title">${cardItem.title}</p>
            <p class="card__body">${cardItem.body}</p>
        `;

    cardsContainer.appendChild(card);

    cardsContainer.querySelectorAll('.card__header-edit')[cardItem.id - 1].addEventListener('click', () => {
        createModalForm.style.display = 'flex';
        overlay.style.display = 'block';
        document.getElementById('title_input').value = cardItem.title;
        document.getElementById('body_input').value = cardItem.body;

        createModalForm.removeEventListener('submit', postRequestHandler);
        updateRequestHandler = updateRequest(cardItem.id);
        createModalForm.addEventListener('submit', updateRequestHandler);
    });

    const title = cardsContainer.querySelectorAll('.card__title')[cardItem.id - 1];
    title.addEventListener('click', fetchOnePostHandler(cardItem.id));

    document.querySelectorAll('.card__header-delete')[cardItem.id - 1].addEventListener('click', deleteRequest(cardItem.id))


}


const cards = [];

//initial fetch first 9 posts
fetchPosts().then(res => cards.push(...res)).then(() => {
    cards.forEach(cardItem => {
        cardBuilder(cardItem);
    });
    root.appendChild(buttonsContainer);
});




