var firebaseConfig = {
    apiKey: "AIzaSyBaZkCdGVXm7Ar6zHCrKIkQfJh50F0oVvc",
    authDomain: "cag-zalem-32e6e.firebaseapp.com",
    databaseURL: "https://cag-zalem-32e6e.firebaseio.com",
    projectId: "cag-zalem-32e6e",
    storageBucket: "cag-zalem-32e6e.appspot.com",
    messagingSenderId: "829120399131",
    appId: "1:829120399131:web:1787d7c250eae9ef"
};
firebase.initializeApp(firebaseConfig);

// Firestore database
var db = firebase.firestore();

var storage = firebase.storage();
// A root reference
var storageRef = storage.ref();
// A reference for the working directory
var directoryRef = storageRef.child('/csm-data/images/');

// Fetches server images
async function getImages(callback) {
    // Pull all the images from the directory
    var list = await directoryRef.listAll();
    // Save the list to an array variable
    var itemArray = list.items;

    callback(itemArray);
}