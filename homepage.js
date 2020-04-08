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

    db.collection("users")
    .find({user: newUser.value}, { limit: 1 })
    .asArray()
    .then(function (docs) {
        if (docs.length > 0) {
            alert("User name should be unique.");
            newUser.value = "";
        }
        else {       
            console.log("add user", client.auth.user.id)     
            db.collection("users")
                .insertOne({ owner_id: client.auth.user.id,
                            user: newUser.value,
                            inventions: [],
                            rating: 0 })
                .then(displayUsers);
            newUser.value = "";                        
        }
    });
    
}

function deleteUser() {
    
    const userToBeDeleted = document.getElementById("delete_user");

    db.collection("users")
    .find({user: userToBeDeleted.value}, { limit: 1 })
    .asArray()
    .then(function (docs) {
        if (docs.length == 0) {
            alert("User '" + userToBeDeleted.value + "' does not exist.");
            userToBeDeleted.value = "";
        }
        else {       
            console.log("deleting user: ");

            db.collection("users")
                .deleteOne( {user: userToBeDeleted.value})
                .then(displayUsers);
        
            alert("User '" + userToBeDeleted.value + "' is deleted."); 
            userToBeDeleted.value = "";                       
        }
    });
    
}

function loginUser() {
    
    const loginUser = document.getElementById("login_user");

    console.log("login as a user: ");
    
    db.collection("users")
    .find({user: loginUser.value}, { limit: 1 })
    .asArray()
    .then(function (docs) {
        if (docs.length == 0) {
            alert("User '" + loginUser.value + "' does not exist.");
            loginUser.value = "";    
        }
        else {            
            loadUser(loginUser.value,
                        docs.map(u => u.rating),
                        docs.map(u => u.inventions));
                        
        }
    });    
    
}

function loadUser(user, rating, inventions) {

    if (user != "") {
        document.location = "user.html?username=" + user + "&rating=" + rating;
    } else {
        alert(user + " does not exist.");
    }
    
}

function deleteAllUsers() {
    console.log("deleting all users");

    db.collection("users").deleteMany({});
    document.getElementById("users").innerHTML = "";	
}