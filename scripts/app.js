var docElem = document.documentElement;
var toastElement = document.getElementById('toast');
var placeholder = document.getElementById('placeholder');
var imageElements = [];
var timer = 4000; // Default time if can not get to server
var currentSlideId = 0;
var loopCounter = 0;
var metaSnapshot;

// Sett up launch time stamp
var launchTimeStamp = Date.now();
launchTimeStamp = launchTimeStamp / 60000;
launchTimeStamp = Math.floor(launchTimeStamp / 1440);


// On launch code
showToast();
timeCheckerLoop();

function fullscreenToggle() {
    if (docElem.requestFullscreen) {
        // Check if document is in fullscreen
        if (document.fullscreenElement) {
            // if so exit
            document.exitFullscreen();
            fullscreenToast(false);
        } else {
            // otherwise make fullscreen
            docElem.requestFullscreen();
            fullscreenToast(true);
        }
    } else if (docElem.mozRequestFullScreen) { /* Firefox */
        if (document.mozFullscreenElement) {
            document.mozExitFullscreen();
            fullscreenToast(false);
        } else {
            docElem.mozRequestFullscreen();
            fullscreenToast(true);
        }
    } else if (docElem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        if (document.webkitFullscreenElement) {
            document.webkitExitFullscreen();
            fullscreenToast(false);
        } else {
            docElem.webkitRequestFullscreen();
            fullscreenToast(true);
        }
    } else if (docElem.msRequestFullscreen) { /* IE/Edge */
        if (document.msFullscreenElement) {
            document.msExitFullscreen();
            fullscreenToast(false);
        } else {
            docElem.msRequestFullscreen();
            fullscreenToast(true);
        }
    } else {
        console.error('Something Happened');
    }
}

document.addEventListener('keydown', (e) => {
    if (e.code == 'KeyF') {
        fullscreenToggle();
    }
});

function showToast() {
    toastElement.classList.remove('toastNotification');
    void toastElement.offsetWidth;
    toastElement.classList.add('toastNotification');
}

function fullscreenToast(enabled) {
    if (enabled) {
        console.log('Enabled')
        toastElement.innerHTML = 'Fullscreen Mode Enabled';
        showToast();
    } else {
        console.log('Dissabled');
        toastElement.innerHTML = 'Fullscreen Mode Disabled';
        showToast();
    }
}

function showIt(snapshot) {
    snapshot.forEach((item) => {
        var image = document.getElementById(item.id);
        console.log(image);
    });
}

// Get timer from server
db.collection('csm').doc('settings').onSnapshot((doc) => {
    timer = doc.data().timer;
});

// Update server when detecting a change
// Also runs on load
db.collection('csm').doc('mediadata').collection('meta').onSnapshot((snapshot) => {
    // Stop the slideshow
    stopShow();
    // Save snapshot
    metaSnapshot = snapshot;
    // Re-fetch all images from server
    getImages(generateImage);


    console.log('Updated content from server');
});

// Master function that triggers the entire image server setup/download/draw
async function generateImage(imageArray) {
    // For each item download then create the image element.
    // Append the image element to the placeholder element.
    var currentDay = new Date().getDay();
    var imagesToDraw = [];

    imageArray.forEach((t) => {
        // Match data with image
        metaSnapshot.forEach((item) => {
            if (item.id == t.name) {
                // Check day
                switch (currentDay) {
                    case 0: {   // Sunday
                        if (checkDate('sunday', item.data().days)) {
                            imagesToDraw.push(t);
                        }
                        break;
                    }
                    case 1: {   // Monday
                        if (checkDate('monday', item.data().days)) {
                            imagesToDraw.push(t);
                        }
                        break;
                    }
                    case 2: {   // Tuesday
                        if (checkDate('tuesday', item.data().days)) {
                            imagesToDraw.push(t);
                        }
                        break;
                    }
                    case 3: {   // Wednesday
                        if (checkDate('wednesday', item.data().days)) {
                            imagesToDraw.push(t);
                        }
                        break;
                    }
                    case 4: {   // Thursday
                        if (checkDate('thursday', item.data().days)) {
                            imagesToDraw.push(t);
                        }
                        break;
                    }
                    case 5: {   // Friday
                        if (checkDate('friday', item.data().days)) {
                            imagesToDraw.push(t);
                        }
                        break;
                    }
                    case 6: {   // Saturday
                        if (checkDate('saturday', item.data().days)) {
                            imagesToDraw.push(t);
                        }
                        break;
                    }
                    default: {
                        console.error('Unknown Day');
                        break;
                    }
                }
            }
        })
    });

    // Wait for the function to draw images to screen
    await drawImages(imagesToDraw);

    // Assign all created images a variable
    imageElements = document.querySelectorAll('#placeholder img');


    // Check to see if there is more then 1 slide
    if (imageElements.length > 1) {
        // Make element visable
        placeholder.style.opacity = 1;
        // Only play if there are more then one slide
        startSlideshow();
    } else {
        placeholder.style.opacity = 1;
    }

    // Time checker
    //// TODO: DO THIS!!
    /**
     * Create a function that will check the current time and when it detects a new day to reload the content
     */

}

// A promise function that will download and create elements for each image
function drawImages(imageArray) {
    return new Promise(async resolve => {
        for (i = 0; i < imageArray.length; i++) {
            var image = storageRef.child(imageArray[i].location.path);

            var url = await image.getDownloadURL();
            var img = document.createElement('img');
            // assign url
            img.src = url;
            // set image id to image name
            img.setAttribute('id', image.name);
            // add to placeholder
            placeholder.appendChild(img);
        }
        resolve();
    });
}

// A function that will check the day (string) and compare it to an array
function checkDate(day, dayArray) {
    var foundMatch = false;
    dayArray.forEach((item) => {
        if (day == item) {
            foundMatch = true;
        }
    })
    return foundMatch;
}

// Will return true or false if current time is the same (in days)
// Used when server head has been running for more then a day.
function timeCheck(postTime) {
    var currentTime = Date.now();
    var currentMin = currentTime / 60000;
    var currentDay = Math.floor(currentMin / 1440);

    if (currentDay > postTime) {
        return false;
    } else {
        return true;
    }
}

// Function that runs on start to check if a reload is needed
function timeCheckerLoop() {
    console.log('------------------------------------');
    console.log('Time checked');
    console.log('Launch time stamp: ' + launchTimeStamp);
    console.log('Time Check: ' + timeCheck(launchTimeStamp));
    console.log('------------------------------------');
    setTimeout(timeCheckerLoop, 60000);
    if (!timeCheck(launchTimeStamp)) {
        location.reload();
    }
}