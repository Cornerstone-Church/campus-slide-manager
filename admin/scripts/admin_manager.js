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

// Slide Thumbs
var sundaySlides = [];
var mondaySlides = [];
var tuesdaySlides = [];
var wednesdaySlides = [];
var thursdaySlides = [];
var fridaySlides = [];
var saturdaySlides = [];

var sundayPlaceholder = document.getElementById('sundaySlides');

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
            });

            alert('Complete');
        }
    );
});

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

removeAllButton.addEventListener('mousedown', (e) => {
    if (confirm('Are you sure you want to remove all slides?')) {
        console.log('Removing all slides');
        directoryRef.listAll().then((e) => {
            e.items.forEach((item) => {
                // Select the image
                var imageRef = storageRef.child(item.location.path);

                // Remove it
                imageRef.delete().then(() => {
                    db.collection('csm').doc('mediadata').collection('meta')
                });
            })

            db.collection('csm').doc('mediadata').collection('meta').get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    db.collection('csm').doc('mediadata').collection('meta').doc(doc.id).delete().then(() => {
                    });
                });
            });


            console.log('All slides removed');
        })
    }
});

function loadSlidesThumbs() {
    getImages(sortSlideThumbs);
}

function sortSlideThumbs(slides) {
    slides.forEach((t) => {
        getMetaSnapshot().forEach((item) => {
            if (item.id == t.name) {
                item.data().days.forEach((day) => {
                    switch (day) {
                        case 'sunday': {
                            console.log(item.id);
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
    drawSlideThumbs();
}

function drawSlideThumbs() {
    console.log('Called');

    console.log(sundaySlides);
    console.log(mondaySlides);
    console.log(tuesdaySlides);
    console.log(wednesdaySlides);
    console.log(thursdaySlides);
    console.log(fridaySlides);
    console.log(saturdaySlides);

    // Thumbnail Placeholders
    var sundayPlaceholder = document.getElementById('sundaySlides');
    var mondayPlaceholder = document.getElementById('mondaySlides');
    var tuesdayPlaceholder = document.getElementById('tuesdaySlides');
    var wednesdayPlaceholder = document.getElementById('wednesdaySlides');
    var thursdayPlaceholder = document.getElementById('thursdaySlides');
    var fridayPlaceholder = document.getElementById('fridaySlides');
    var saturdayPlaceholder = document.getElementById('saturdaySlides');

    // Draw content to each placeholder
    drawImages(sundaySlides, sundayPlaceholder);
    drawImages(mondaySlides, mondayPlaceholder);
    drawImages(tuesdaySlides, tuesdayPlaceholder);
    drawImages(wednesdaySlides, wednesdayPlaceholder);
    drawImages(thursdaySlides, thursdayPlaceholder);
    drawImages(fridaySlides, fridayPlaceholder);
    drawImages(saturdaySlides, saturdayPlaceholder);
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