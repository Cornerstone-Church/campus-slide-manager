// TODO: Create logic for Update All button

var uploader = document.getElementById('uploader');
var fileButton = document.getElementById('fileButton');
var slideshowTimer = document.getElementById('slideshowTimer');
var uploadButton = document.getElementById('uploadButton');
var removeAllButton = document.getElementById('removeAllButton');

// Check boxes
var everydayCheck = document.getElementById('everydayCheck');
var sundayCheck = document.getElementById('sundayCheck');
var mondayCheck = document.getElementById('mondayCheck');
var tuesdayCheck = document.getElementById('tuesdayCheck');
var wednesdayCheck = document.getElementById('wednesdayCheck');
var thursdayCheck = document.getElementById('thursdayCheck');
var fridayCheck = document.getElementById('fridayCheck');
var saturdayCheck = document.getElementById('saturdayCheck');

var file;

// Update timer
db.collection('csm').doc('settings').get().then((doc) => {
    var server = doc.data().timer;
    server = server / 1000;

    slideshowTimer.value = server;
});

// Update server when detecting a change
// Also runs on load
db.collection('csm').doc('mediadata').collection('meta').onSnapshot((snapshot) => {
    // Save snapshot
    metaSnapshot = snapshot;
    // Re-fetch all images from server
    loadSlidesThumbs();

    console.log('Updated content from server');
});


//// LISTENERS
// Send updated timer to server
slideshowTimer.addEventListener('change', (e) => {
    var timerVar = slideshowTimer.value * 1000;
    db.collection('csm').doc('settings').set({
        timer: timerVar
    });
});

everydayCheck.addEventListener('change', (e) => {
    if (e.target.checked) {
        sundayCheck.checked = true;
        mondayCheck.checked = true;
        tuesdayCheck.checked = true;
        wednesdayCheck.checked = true;
        thursdayCheck.checked = true;
        fridayCheck.checked = true;
        saturdayCheck.checked = true;
    } else {
        sundayCheck.checked = false;
        mondayCheck.checked = false;
        tuesdayCheck.checked = false;
        wednesdayCheck.checked = false;
        thursdayCheck.checked = false;
        fridayCheck.checked = false;
        saturdayCheck.checked = false;
    }
});

removeAllButton.addEventListener('mousedown', (action) => {
    if (confirm('Are you sure you want to remove all slides?')) {
        console.log('Removing all slides');
        directoryRef.listAll().then((e) => {
            e.items.forEach((item) => {
                // Remove it
                item.delete().then(() => {
                });
            })

            db.collection('csm').doc('mediadata').collection('meta').get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    db.collection('csm').doc('mediadata').collection('meta').doc(doc.id).delete().then(() => {
                    });
                });
            }).then(() => {
                alert('Removed all slides');
            });
        })
    }
});

// Upload button
fileButton.addEventListener('change', (e) => {
    // Get file
    file = e.target.files[0];
});

// Upload Button
uploadButton.addEventListener('mousedown', (e) => {
    var uploadId = makeid(12);

    // Create a storage ref
    var storageRef = storage.ref('csm-data/images/' + uploadId);

    // Upload File
    var task = storageRef.put(file);

    // Update Progress bar
    task.on('state_changed',
        function progress(snapshot) {
            var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            uploader.value = percentage;
        },

        function error(err) {
            alert('There was an error: ' + err);
        },

        function complete() {
            var days = [];
            // Check what days
            if (sundayCheck.checked == true) {
                days.push('sunday');
            }
            if (mondayCheck.checked == true) {
                days.push('monday');
            }
            if (tuesdayCheck.checked == true) {
                days.push('tuesday');
            }
            if (wednesdayCheck.checked == true) {
                days.push('wednesday');
            }
            if (thursdayCheck.checked == true) {
                days.push('thursday');
            }
            if (fridayCheck.checked == true) {
                days.push('friday');
            }
            if (saturdayCheck.checked == true) {
                days.push('saturday');
            }

            db.collection('csm').doc('mediadata').collection('meta').doc(uploadId).set({
                days: days,
            }).then(() => {
                // TODO: Create created notification
                console.log('Complete');
            });

        }
    );
});

function loadSlidesThumbs() {
    // Fetch images then Draw to screen
    getImages(_drawSlideThumbs);
}

function _drawSlideThumbs(slides) {
    var slidePlaceholder = document.getElementById('slide-placeholder');
    slides.forEach((slide) => {
        // Set up the wrapper and element
        var slideWrapper = document.createElement('div');
        slideWrapper.setAttribute('class', 'slide-wrapper');
        slideWrapper.setAttribute('id', slide.name);
        var imageElement = document.createElement('img');
        var checkboxes;
        var removeButton = document.createElement('button');
        removeButton.innerHTML = 'Remove Slide';

        // Get the download url for the slide
        slide.getDownloadURL().then((url) => {
            imageElement.src = url;
            // Add to wrapper
            slideWrapper.appendChild(imageElement);
            // Fetch meta for slide
            getMetaSnapshot().forEach((slideMeta) => {
                // Find slide match with meta
                if (slideMeta.id == slide.name) {
                    var days = slideMeta.data().days;
                    checkboxes = _createCheckBoxes(days);
                    // Add to wrapper
                    slideWrapper.appendChild(checkboxes);
                    slideWrapper.appendChild(removeButton);
                }
            });
        });

        // Append result to placeholder
        slidePlaceholder.appendChild(slideWrapper);
    })
}

// Accepts an array of boxes needing to be checked
function _createCheckBoxes(checked) {
    // Checkboxes
    var checkboxWrapper = document.createElement('div');
    checkboxWrapper.setAttribute('class', 'checkbox-wrapper');
    var sundayCheckBox = document.createElement('input');
    sundayCheckBox.setAttribute('type', 'checkbox');
    sundayCheckBox.setAttribute('id', 'sunday');
    var mondayCheckBox = document.createElement('input');
    mondayCheckBox.setAttribute('type', 'checkbox');
    mondayCheckBox.setAttribute('id', 'monday');
    var tuesdayCheckBox = document.createElement('input');
    tuesdayCheckBox.setAttribute('type', 'checkbox');
    tuesdayCheckBox.setAttribute('id', 'tuesday');
    var wednesdayCheckBox = document.createElement('input');
    wednesdayCheckBox.setAttribute('type', 'checkbox');
    wednesdayCheckBox.setAttribute('id', 'wednesday');
    var thursdayCheckBox = document.createElement('input');
    thursdayCheckBox.setAttribute('type', 'checkbox');
    thursdayCheckBox.setAttribute('id', 'thursday');
    var fridayCheckBox = document.createElement('input');
    fridayCheckBox.setAttribute('type', 'checkbox');
    fridayCheckBox.setAttribute('id', 'friday');
    var saturdayCheckBox = document.createElement('input');
    saturdayCheckBox.setAttribute('type', 'checkbox');
    saturdayCheckBox.setAttribute('id', 'saturday');

    // Lables
    var sundayLable = document.createElement('label');
    sundayLable.setAttribute('for', 'sunday');
    sundayLable.innerHTML = 'Sunday';
    var mondayLable = document.createElement('label');
    mondayLable.setAttribute('for', 'monday');
    mondayLable.innerHTML = 'Monday';
    var tuesdayLable = document.createElement('label');
    tuesdayLable.setAttribute('for', 'tuesday');
    tuesdayLable.innerHTML = 'Tuesday';
    var wednesdayLable = document.createElement('label');
    wednesdayLable.setAttribute('for', 'wednesday');
    wednesdayLable.innerHTML = 'Wednesday';
    var thursdayLable = document.createElement('label');
    thursdayLable.setAttribute('for', 'thursday');
    thursdayLable.innerHTML = 'Thursday';
    var fridayLable = document.createElement('label');
    fridayLable.setAttribute('for', 'friday');
    fridayLable.innerHTML = 'Friday';
    var saturdayLable = document.createElement('label');
    saturdayLable.setAttribute('for', 'saturday');
    saturdayLable.innerHTML = 'Saturday';

    // Check boxes that need to be checked
    checked.forEach((day) => {
        switch (day) {
            case 'sunday': sundayCheckBox.checked = true; break;
            case 'monday': mondayCheckBox.checked = true; break;
            case 'tuesday': tuesdayCheckBox.checked = true; break;
            case 'wednesday': wednesdayCheckBox.checked = true; break;
            case 'thursday': thursdayCheckBox.checked = true; break;
            case 'friday': fridayCheckBox.checked = true; break;
            case 'saturday': saturdayCheckBox.checked = true; break;
            default: console.error('Unknown day to check: 332445');
        }
    })

    // Add to checkbox wrapper
    checkboxWrapper.appendChild(sundayCheckBox);
    checkboxWrapper.appendChild(sundayLable);
    checkboxWrapper.appendChild(mondayCheckBox);
    checkboxWrapper.appendChild(mondayLable);
    checkboxWrapper.appendChild(tuesdayCheckBox);
    checkboxWrapper.appendChild(tuesdayLable);
    checkboxWrapper.appendChild(wednesdayCheckBox);
    checkboxWrapper.appendChild(wednesdayLable);
    checkboxWrapper.appendChild(thursdayCheckBox);
    checkboxWrapper.appendChild(thursdayLable);
    checkboxWrapper.appendChild(fridayCheckBox);
    checkboxWrapper.appendChild(fridayLable);
    checkboxWrapper.appendChild(saturdayCheckBox);
    checkboxWrapper.appendChild(saturdayLable);

    return checkboxWrapper;
}

/** _sortSlideThumbs - Obsolete
function _sortSlideThumbs(slides) {
    // Clear all sorted existing arrays
    sundaySlides = [];
    mondaySlides = [];
    tuesdaySlides = [];
    wednesdaySlides = [];
    thursdaySlides = [];
    fridaySlides = [];
    saturdaySlides = [];

    // Put slides in each array
    slides.forEach((t) => {
        getMetaSnapshot().forEach((item) => {
            if (item.id == t.name) {
                item.data().days.forEach((day) => {
                    switch (day) {
                        case 'sunday': {
                            sundaySlides.push(t);
                            break;
                        }
                        case 'monday': {
                            mondaySlides.push(t);
                            break;
                        }
                        case 'tuesday': {
                            tuesdaySlides.push(t);
                            break;
                        }
                        case 'wednesday': {
                            wednesdaySlides.push(t);
                            break;
                        }
                        case 'thursday': {
                            thursdaySlides.push(t);
                            break;
                        }
                        case 'friday': {
                            fridaySlides.push(t);
                            break;
                        }
                        case 'saturday': {
                            saturdaySlides.push(t);
                            break;
                        }
                        default: console.log('error');
                    }
                });
            }
        });
    });
    _drawSlideThumbs();
}
*/

/** _drawSlideThumbs - Obsolete
async function _drawSlideThumbs() {
    var exisitingImg = document.querySelectorAll('.slideThumbnails .image-thumbnail');

    // Remove any existing images
    exisitingImg.forEach((element) => {
        element.remove();
    });

    // Thumbnail Placeholders
    var sundayPlaceholder = document.getElementById('sundaySlides');
    var mondayPlaceholder = document.getElementById('mondaySlides');
    var tuesdayPlaceholder = document.getElementById('tuesdaySlides');
    var wednesdayPlaceholder = document.getElementById('wednesdaySlides');
    var thursdayPlaceholder = document.getElementById('thursdaySlides');
    var fridayPlaceholder = document.getElementById('fridaySlides');
    var saturdayPlaceholder = document.getElementById('saturdaySlides');

    // TODO: Create overlay with trashcan icon to remove slide


    // Draw content to each placeholder
    await fetchServerImages('sunday', sundaySlides, sundayPlaceholder);
    await fetchServerImages('monday', mondaySlides, mondayPlaceholder);
    await fetchServerImages('tuesday', tuesdaySlides, tuesdayPlaceholder);
    await fetchServerImages('wednesday', wednesdaySlides, wednesdayPlaceholder);
    await fetchServerImages('thursday', thursdaySlides, thursdayPlaceholder);
    await fetchServerImages('friday', fridaySlides, fridayPlaceholder);
    await fetchServerImages('saturday', saturdaySlides, saturdayPlaceholder);
}
*/

/** fetchServerImages - Obsolete
// A promise function that will download and create elements for each image
function fetchServerImages(day, imageArray, placeholder) {
    return new Promise(async resolve => {
        for (i = 0; i < imageArray.length; i++) {
            var image = storageRef.child(imageArray[i].location.path);
            // Save image url as variable
            var url = await image.getDownloadURL();
            var id = image.name;

            // Create thumbnail
            createThumbnail(id, url, day, placeholder);
        }
        resolve();
    });
}
*/

/** createThumbnail - Obsolete
function createThumbnail(id, url, day, placeholder) {
    var img = document.createElement('img');
    // assign url
    img.src = url;
    // set image id to image name
    img.setAttribute('id', id);

    // Create thumbnail element
    var thumbnail = document.createElement('div');
    thumbnail.setAttribute('class', 'image-thumbnail');

    // Create overlay
    var thumbnailOverlay = document.createElement('div');
    thumbnailOverlay.setAttribute('class', 'thumbnail-overlay');

    // Create Delete button
    var deleteButton = document.createElement('a');
    deleteButton.setAttribute('class', 'delete-button');
    deleteButton.setAttribute('onclick', "deleteSlide('" + id + "', '" + day + "');");
    var deleteIcon = document.createElement('img');
    deleteIcon.src = '/ref/icons/trash-can-white.png';
    deleteButton.appendChild(deleteIcon);
    // Add button to overlay
    thumbnailOverlay.appendChild(deleteButton);

    // Stack elements in order
    thumbnail.appendChild(img);
    thumbnail.appendChild(thumbnailOverlay);

    placeholder.appendChild(thumbnail);
}
*/

// TODO: Will need to be reworked
function deleteSlide(id, day) {
    if (confirm('Are you sure you want to remove image?')) {
        var daysOfTheWeek = db.collection('csm').doc('mediadata').collection('meta').doc(id);
        daysOfTheWeek.get().then((doc) => {
            if (doc.exists) {
                // Set variables
                var setImageDays = doc.data().days;

                // Check to see if the image is used in more then one place
                if (setImageDays.length > 1) {
                    // Go through each day the image is set to show
                    for (i = 0; i < setImageDays.length; i++) {
                        // If day is found remove it from the array
                        if (day == setImageDays[i]) {
                            setImageDays.splice(i, 1);
                        }
                    }
                    // TODO: Finish this!!!
                    // Remove old server array
                    var removeDay = daysOfTheWeek.update({
                        days: firebase.firestore.FieldValue.delete(),
                    });
                    // Upload updated server array
                    var setDays = daysOfTheWeek.set({
                        days: setImageDays,
                    });
                } else {
                    // Remove document
                    daysOfTheWeek.delete().then(() => {
                        console.log('Removed meta document');
                    });
                    // Remove image from storage
                    var imageRef = storageRef.child('csm-data/images/' + id);
                    imageRef.delete().then(() => {
                        console.log('Image removed from storage');
                    });
                }
            } else {
                alert('The document you are deleting does not exist. Try reloading the page?')
            }
        });
    }
}

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}