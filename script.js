document.getElementById('recommend-btn').addEventListener('click', function() {
    var clothingInput = document.getElementById('clothing-input').value;
    var imageQuality = document.querySelector('input[name="image-quality"]:checked').id;

    var loadingAnimation = document.getElementById('loading-animation');
    loadingAnimation.style.display = 'block';

    generateTextDescription(clothingInput,imageQuality);
});

function generateTextDescription(input,imageQuality) {
    fetch('http://127.0.0.1:5000/generate-text-description', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            original_input: input
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch text description.');
        }
        return response.json();
    })
    .then(data => {
        var text_desc2 = data.text_desc2;
        generateClothingImage(text_desc2, imageQuality);
    })
    .catch(error => {
        console.error(error);
    });
}

function generateClothingImage(text_desc2,imageQuality) {
    fetch('http://127.0.0.1:5000/generate-clothing-image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            text_desc2: text_desc2,
            image_quality: imageQuality
        })
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
    var carouselInner = document.querySelector('#image-carousel .carousel-inner');
    var newCarouselItem = document.createElement('div');
    newCarouselItem.classList.add('carousel-item');
    var newImage = document.createElement('img');
    newImage.src = imageURL;
    newImage.alt = '服装图片';
    newImage.classList.add('d-block', 'w-100');

    newCarouselItem.appendChild(newImage);
    carouselInner.appendChild(newCarouselItem);
    if (carouselInner.children.length === 1) {
        newCarouselItem.classList.add('active');
    }
}