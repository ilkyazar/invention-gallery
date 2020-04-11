// Initialize the App Client
const client = stitch.Stitch.initializeDefaultAppClient("ceng495-hw2-ccucf");
// Get a MongoDB Service Client
const mongodb = client.getServiceClient(
  stitch.RemoteMongoClient.factory,
  "mongodb-atlas"
);
// Get a reference to the gallery database
const db = mongodb.db("gallery");
let user = "";

function loadUserInfo() {
    var url_string = document.location.href;
    var url = new URL(url_string);

    var username = url.searchParams.get("username");

    db.collection("users")
    .find({user: username}, { limit: 1 })
    .asArray()
    .then(function (docs) {
        if (docs.length > 0) {
          const rating = docs.map(doc => `<div>${doc.rating}</div>`);
          document.getElementById("rating").innerHTML = rating;                  
        }
    });
    
    document.getElementById("username").innerHTML = username;

    user = username;
    loadGallery();
}

function loadGallery() {

}

function openExhibit() {
  exhibit = document.getElementById("exhibit");
  exhibit.style.display = "block";
}

function closeExhibit() {
  exhibit = document.getElementById("exhibit");
  exhibit.style.display = "none";
}

function exhibitInvention() {

  const productName = document.getElementById("product-name");
  const productPhoto = document.getElementById("product-photo");
  const productCost = document.getElementById("product-cost");
  const productMaterials = document.getElementById("product-materials");
  const inventorName = document.getElementById("inventor-name");
  

  db.collection("inventions")
    .find({productName: productName.value}, { limit: 1 })
    .asArray()
    .then(function (docs) {
        if (docs.length > 0) {
            alert("Product name should be unique.");
            productName.value = "";
        }
        else {       
          db.collection("inventions").insertOne(
            {          
                user: user,
                productName: productName.value,
                productPhoto: productPhoto.value,
                productCost: productCost.value,
                productMaterials: productMaterials.value,
                inventorName: inventorName.value,    
            }           
          )
          
          db.collection("users").updateOne(
            { "user": user },
            { $push: 
              { "inventions": productName.value } 
            }
          )
          
          alert("Your exhibiton was successful!"); 
          productName.value = "";
          productPhoto.value = "";
          productCost.value = "";
          productMaterials.value = "";
          inventorName.value = "";
          closeExhibit();
        }
    });
}

