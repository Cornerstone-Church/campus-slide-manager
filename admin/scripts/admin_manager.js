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


function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}