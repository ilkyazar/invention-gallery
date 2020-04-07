// Initialize the App Client
const client = stitch.Stitch.initializeDefaultAppClient("ceng495-hw2-ccucf");
// Get a MongoDB Service Client
const mongodb = client.getServiceClient(
  stitch.RemoteMongoClient.factory,
  "mongodb-atlas"
);
// Get a reference to the gallery database
const db = mongodb.db("gallery");

function loadUserInfo() {
    var url_string = document.location.href;
    var url = new URL(url_string);

    var username = url.searchParams.get("username");
    var rating = url.searchParams.get("rating");
    
    document.getElementById("username").innerHTML = username;
    document.getElementById("rating").innerHTML = rating;
}

