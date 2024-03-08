document.getElementById('recommend-btn').addEventListener('click', function() {
    var clothingInput = document.getElementById('clothing-input').value;
    var loadingAnimation = document.getElementById('loading-animation');
    loadingAnimation.style.display = 'block';
    generateTextDescription(clothingInput);
});

function generateTextDescription(input) {
    fetch('http://127.0.0.1:5000/generate-text-description', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ original_input: input })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch text description.');
        }
        return response.json();
    })
    .then(data => {
        var text_desc2 = data.text_desc2;
        generateClothingImage(text_desc2);
    })
    .catch(error => {
        console.error(error);
    });
}


function generateClothingImage(text_desc2) {
    fetch('http://127.0.0.1:5000/generate-clothing-image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text_desc2: text_desc2 })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch clothing image.');
        }
        return response.blob();
    })
    .then(blob => {
        var imageURL = URL.createObjectURL(blob);
        var loadingAnimation = document.getElementById('loading-animation');
        loadingAnimation.style.display = 'none';
        showClothingImage(imageURL);
    })
    .catch(error => {
        console.error(error);
        var loadingAnimation = document.getElementById('loading-animation');
        loadingAnimation.style.display = 'none';
    });
}

function showClothingImage(imageURL) {
    var clothingImage = document.getElementById('clothing-image');
    clothingImage.src = imageURL;
    clothingImage.classList.remove('d-none');
}