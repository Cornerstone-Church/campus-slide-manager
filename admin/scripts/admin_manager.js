// TODO: Create logic for Update All button

var uploader = document.getElementById('uploader');
var fileButton = document.getElementById('fileButton');
var slideshowTimer = document.getElementById('slideshowTimer');
var uploadButton = document.getElementById('uploadButton');
var removeAllButton = document.getElementById('removeAllButton');
var updateAllButton = document.getElementById('updateAllButton');

// Check boxes
var everydayCheck = document.getElementById('everydayCheck');
var sundayCheck = document.getElementById('sundayCheck');
var mondayCheck = document.getElementById('mondayCheck');
var tuesdayCheck = document.getElementById('tuesdayCheck');
var wednesdayCheck = document.getElementById('wednesdayCheck');
var thursdayCheck = document.getElementById('thursdayCheck');
var fridayCheck = document.getElementById('fridayCheck');
var saturdayCheck = document.getElementById('saturdayCheck');

var noticeMessage = document.getElementById('noticeMessage');

// Firebase storage reference
var storageRef = storage.ref('csm-data/images/');

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

    // Remove exisiting images
    var placeholder = document.getElementById('slide-placeholder');
    placeholder.innerHTML = "";

    // Re-fetch all images from server
    loadSlidesThumbs();

    console.log('Updated content from server');
});

//// LISTENERS
// Send updated timer to server
slideshowTimer.addEventListener('change', (e) => {
    var timerVar = slideshowTimer.value * 1000;
    if (timerVar >= 3000) {
        db.collection('csm').doc('settings').set({
            timer: timerVar
        });
    } else {
        alert('Please enter a time larger then 3s');
    }
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

removeAllButton.addEventListener('mouseup', (action) => {
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
                var placeholder = document.getElementById('slide-placeholder');
                placeholder.innerHTML = '';
            });
        })
    }
});

updateAllButton.addEventListener('mouseup', (action) => {
    var currentSlides = document.querySelectorAll('.slide-wrapper');
    var slideCounter = 0;

    currentSlides.forEach((element) => {
        var selectedArray = [];

        var sundayCheckBox = element.querySelector('#sunday');
        var mondayCheckBox = element.querySelector('#monday');
        var tuesdayCheckBox = element.querySelector('#tuesday');
        var wednesdayCheckBox = element.querySelector('#wednesday');
        var thursdayCheckBox = element.querySelector('#thursday');
        var fridayCheckBox = element.querySelector('#friday');
        var saturdayCheckBox = element.querySelector('#saturday');

        if (sundayCheckBox.checked) {
            selectedArray.push('sunday');
        }
        if (mondayCheckBox.checked) {
            selectedArray.push('monday');
        }
        if (tuesdayCheckBox.checked) {
            selectedArray.push('tuesday');
        }
        if (wednesdayCheckBox.checked) {
            selectedArray.push('wednesday');
        }
        if (thursdayCheckBox.checked) {
            selectedArray.push('thursday');
        }
        if (fridayCheckBox.checked) {
            selectedArray.push('friday');
        }
        if (saturdayCheckBox.checked) {
            selectedArray.push('saturday');
        }

        // Checks to make sure at least one day is selected
        if (selectedArray.length > 0) {
            element.classList.remove('error');
            // Upload to server
            db.collection('csm').doc('mediadata').collection('meta').doc(element.id).set({
                days: selectedArray,
            }).then(() => {
                slideCounter++;
                console.log(slideCounter);
                _updateComplete(slideCounter, currentSlides.length);
            }).catch((error) => {
                alert('There was a problem updating the slides. Please try again later. ERROR: ' + error);
            })

        } else {
            element.classList.add('error');
            showError('You must select at least one day');
        }
    })
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
    var childRef = storageRef.child(uploadId);

    // Upload File
    var task = childRef.put(file);

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
                alert('Complete');
            });

        }
    );
});

/** Downloads the slides and passes them on to _drawSlideThumbs()
 * 
 */
function loadSlidesThumbs() {
    // Fetch images then Draw to screen
    getImages(_drawSlideThumbs);
}

/** Will take downloaded slides and create a slide editor layout for each slide
 * 
 * @param {Array} slides - Downloaded slides
 */
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
        var onClickValue = "deleteSlide('" + slide.name + "')";
        removeButton.setAttribute('onClick', onClickValue);

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

/** A function that creates the checkboxes for each slide
 * 
 * @param {Array<string>} checked - Days of the week that slide is assigned to
 */
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

/** Removes a slide from data and meta
 * 
 * @param {string} id - ID of the slide to remove
 */
function deleteSlide(id) {
    if (confirm('Are you sure you want to remove image?')) {
        // Remove the file from storage
        var childRef = storageRef.child(id);
        childRef.delete().then(() => {
            console.log('File deleted');
            // Remove mediaData
            var slideData = db.collection('csm').doc('mediadata').collection('meta').doc(id);
            slideData.delete().then(() => {
                console.log('Media Data removed');
            }).catch((error) => {
                console.error('Unable to remove Media Data: ' + error);
            })
        }).catch((error) => {
            console.error('Unable to remove file: ' + error);
        })
    }
}

function showError(error) {
    noticeMessage.innerHTML = error;
    noticeMessage.style.color = 'red';
    noticeMessage.style.display = 'inline';
    setTimeout(hideMessage, 5000);
}

function _updateComplete(currentNumber, totalNumber) {
    if (currentNumber == totalNumber) {
        noticeMessage.innerHTML = 'Update complete';
        noticeMessage.style.color = 'green';
        noticeMessage.style.display = 'inline';
        setTimeout(hideMessage, 5000);
    }
}

function hideMessage() {
    noticeMessage.innerHTML = '';
    noticeMessage.style.display = 'none';
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