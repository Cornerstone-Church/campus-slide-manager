var slideshowTimer;

function stopShow() {
    // Stop timer
    clearTimeout(slideshowTimer);
    // Remove all elements from ram
    imageElements = [];

    // Remove all elements from display
    var images = document.querySelectorAll('img');
    images.forEach((element) => {
        element.parentNode.removeChild(element);
    })
}

// Called after images are refreshed
function startSlideshow() {
    // Start timer
    slideshowTimer = setTimeout(startSlideshow, timer);

    // If current slide is at the 1st one, then hide all the images
    if (currentSlideId == 0) {
        imageElements.forEach((image) => {
            image.style.opacity = 0;
        });
    }

    // Display image at current slide index
    imageElements[currentSlideId].style.opacity = 1;

    // Increase the index
    currentSlideId++;

    // On last slide clear index and reset loop
    if (currentSlideId > imageElements.length - 1) {
        currentSlideId = 0;
        loopCounter++;
        console.log('Slide show has looped ' + loopCounter + ' times.')
    }
}