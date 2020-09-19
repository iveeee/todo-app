function itemTemplate(item) {
    return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
                <span class="item-text">${item.item}</span>
                <div>
                    <button data-id="${item._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
                    <button data-id="${item._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
                </div>
            </li>`;
}

// Initial Page Load Render
let thelist = items.map(item => {
    return itemTemplate(item);
}).join('');

document.getElementById('item-list').insertAdjacentHTML("beforeend", thelist);

// Add Feature
let createField = document.getElementById('create-field');

document.getElementById('create-form').addEventListener('submit', (e) => {
    e.preventDefault();
    axios.post('/add-item', {item: createField.value}).then((response) => {
        // create html for a new item
        document.getElementById('item-list').insertAdjacentHTML("beforeend", itemTemplate(response.data));
        createField.value = "";
        createField.focus();
    }).catch(() => {
        console.log('Please try again');
    });
});

document.addEventListener('click', (e) => {
    // Update Feature
    if (e.target.classList.contains("edit-me")) {
        let userInput = prompt("Enter your desired new text", e.target.parentElement.parentElement.querySelector(".item-text").innerHTML);
        if (userInput) {
            axios.post('/update-item', {item: userInput, id: e.target.getAttribute("data-id")}).then(() => {
                // console.log(e);
                e.target.parentElement.parentElement.querySelector(".item-text").innerHTML = userInput;
            }).catch(() => {
                console.log('Please try again');
            });
        }
    }

    // Delete Feature
    if (e.target.classList.contains("delete-me")) {
        if (confirm('Do you really want to delete this item?')) {
            axios.post('/delete-item', {id: e.target.getAttribute("data-id")}).then(() => {
                // console.log(e);
                e.target.parentElement.parentElement.remove();
            }).catch(() => {
                console.log('Please try again');
            });
        }
    }
})