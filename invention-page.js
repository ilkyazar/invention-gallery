// Initialize the App Client
const client = stitch.Stitch.initializeDefaultAppClient("ceng495-hw2-ccucf");
// Get a MongoDB Service Client
const mongodb = client.getServiceClient(
  stitch.RemoteMongoClient.factory,
  "mongodb-atlas"
);
// Get a reference to the gallery database
const db = mongodb.db("gallery");

function loadInventionInfo() {
    var url_string = document.location.href;
    var url = new URL(url_string);

    var name = url.searchParams.get("productname");

    db.collection("inventions")
    .find({productName: name}, { limit: 1 })
    .asArray()
    .then(function (docs) {
        if (docs.length > 0) {
            const productPhoto = docs.map(doc => `<div>${doc.productPhoto}</div>`);
            const photoSource = docs.map(doc => `${doc.productPhoto}`);
            const productCost = docs.map(doc => `<div>${doc.productCost}</div>`);
            const productMaterials = docs.map(doc => `<div>${doc.productMaterials}</div>`);
            const inventorName = docs.map(doc => `<div>${doc.inventorName}</div>`);
            const productOwner = docs.map(doc => `<div>${doc.user}</div>`);
            const overallRating = docs.map(doc => `<div>${doc.rating}</div>`);

            document.getElementById("product-name").innerHTML = name;
            document.getElementById("product-photo").innerHTML = `<div id=\"invention-item\" class=\"invention-item\"
                                                                       tabindex=\"0\"> 
                                                                            <img src=\"${photoSource}\" class=\"inv-info-one\"
                                                                                 id=\"invention-img\" alt=\"\">
                                                                  </div>`;
            document.getElementById("photo-url").innerHTML = `<a href=\"${photoSource}\">${photoSource}</a>`;
            document.getElementById("product-cost").innerHTML = productCost;
            document.getElementById("product-materials").innerHTML = productMaterials;
            document.getElementById("inventor-name").innerHTML = inventorName;
            document.getElementById("product-owner").innerHTML = productOwner;          
            document.getElementById("overall-rating").innerHTML = overallRating;         
        }
        else {
            console.log("Product: " + name + " not found.");
            console.log(docs);
        }
    });
    
}