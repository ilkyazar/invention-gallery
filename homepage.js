// Initialize the App Client
const client = stitch.Stitch.initializeDefaultAppClient("ceng495-hw2-ccucf");
// Get a MongoDB Service Client
const mongodb = client.getServiceClient(
  stitch.RemoteMongoClient.factory,
  "mongodb-atlas"
);
// Get a reference to the gallery database
const db = mongodb.db("gallery");

function displayUsers() {
    db.collection("users")
        .find({}, { limit: 1000 })
        .asArray()
        .then(docs => {
        const html = docs.map(doc => `<div>${doc.user}</div>`);
        document.getElementById("users").innerHTML = html;
        })
}

function displayUsersOnLoad() {
    client.auth
        .loginWithCredential(new stitch.AnonymousCredential())
        .then(displayUsers)
        .catch(console.error);
}

function addUser() {
    const newUser = document.getElementById("new_user");

    console.log("add user", client.auth.user.id)

    db.collection("users")
        .insertOne({ owner_id: client.auth.user.id, user: newUser.value })
        .then(displayUsers);
    newUser.value = "";
}

function deleteUser() {
    
    const userToBeDeleted = document.getElementById("delete_user");

    console.log("deleting user: ");

    db.collection("users")
        .deleteOne( {user: userToBeDeleted.value})
        .then(displayUsers);
   
    alert("User '" + userToBeDeleted.value + "' is deleted.");
}

function deleteAllUsers() {
    console.log("deleting all users");

    // <input id="delete_all_users" type="button" value="Delete All Users" onClick="deleteAllUsers()">

    db.collection("users").deleteMany({});
    document.getElementById("users").innerHTML = "";	
}