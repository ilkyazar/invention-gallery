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
        //const html = docs.map(doc => `<div>${doc.user} ${doc._id}</div>`);
        const html = docs.map(doc => `<div>${doc.user}</div>
                          <input id="delete_user"
                            type="button" value="Delete User"
                            onClick="deleteUser(${doc._id})"
                            >`
                        );
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

function deleteUser(user_id) {
    
    console.log("deleting user:" + user_id);

    db.collection("users")
        .deleteOne( {"_id": {$oid: "5e8ba4071c9d440000ccb2dd"}})
        .then(displayUsers);
        
}

function deleteAllUsers() {
    console.log("deleting all users");

    db.collection("users").deleteMany({});
    document.getElementById("users").innerHTML = "";	
}