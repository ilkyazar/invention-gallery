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

  db.collection("inventions")
        .find({showTo: user }, { limit: 1000 })
        .asArray()
        .then(async function(docs) {

            let invRatings = await Promise.all(docs.map(function(doc) {
              return loadInventionRating(doc.productName);
            }));
            
            inventionNr = -1;

            const photo_area = docs.map(function(doc) {
              inventionNr++;

              ratingHtml = getRatingHtml(invRatings[inventionNr], doc.productName);

              return `<div id=\"invention-item\" class=\"invention-item\"
                    tabindex=\"0\" > 
                        <img src=\"${doc.productPhoto}\" class=\"invention-img\"
                            id=\"invention-img\" alt=\"\"
                            onClick=\"loadInvention('${doc.productName}')\">
                        <div>
                            <input type="button" class="drop-btn"
                                  value="Drop" onClick="dropInvention('${doc.productName}')">
                            <img class="stars">` +
                                ratingHtml
                            + `</img>
                        </div>
              </div>`
                               
              });

              document.getElementById("invention-item").innerHTML = photo_area.join('');
        })
}

function loadInvention(productName) {
  console.log(productName);
  if (productName != "") {
    document.location = "invention.html?productname=" + productName;
  } 
}

async function loadInventionRating(productName) {
  
  let rating = await db.collection("users")
    .find({user: user})
    .asArray()
    .then(function (docs) {
      // ratedFor is an array of objects in the database
      // first element of it has the objects with key-value pairs
      const rated = docs.map(doc => doc.ratedFor)[0];

      let i = 0;
      while (rated[i]) {
        if (rated[i][productName]) {
          let invRating = rated[i][productName];
          return invRating;
        }
        i++;
      }
                  
    })

  return rating || 0;
}

function getRatingHtml(rate, productName) {
  var notCheckedSpan1 = `<span id="star" class="fa fa-star not-checked" onClick="rateInvention(`;
  var notCheckedSpan2 = `, '${productName}')"></span>`;
  var checkedSpan1 = `<span id="star" class="fa fa-star checked" onClick="rateInvention(`;
  var checkedSpan2 = `, '${productName}')"></span>`;

  var ratingHtml = '';

  for (let i = 0; i < rate; i++) {
      ratingHtml += checkedSpan1;
      ratingHtml += i + 1;
      ratingHtml += checkedSpan2;
  }
  for (let i = rate; i < 5; i++) {
    ratingHtml += notCheckedSpan1;
    ratingHtml += i + 1;
    ratingHtml += notCheckedSpan2;
  }

  return ratingHtml;
}

function rateInvention(rate, productName) {
  console.log("Rated " + productName + ": " + rate);

  var $query = {};
  $query[productName] = rate;

  db.collection("users").updateOne({user: user}, {$addToSet : {"ratedFor": $query}})

  alert("You rated " + productName + " " + rate + ".");

  loadGallery();
}

function dropInvention(productName) {
  console.log(user + " wants to drop " + productName);

  db.collection("users")
    .find({user: user, inventions: productName })
    .asArray()
    .then(function (docs) {
        console.log(docs);

        if (docs.length == 0) {
          alert("You don't own this invention. You cannot drop it.")
        }
        else {
          db.collection("inventions").updateOne(
            { "productName": productName },
            { $pull: 
              { "showTo": user } 
            }
          )

          alert("Invention dropped successfully.")
          loadGallery();
        }
    })
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
                showTo: []
            }           
          )
          
          showToAll(productName.value);

          db.collection("users").updateOne(
            { "user": user },
            { $push: 
              { "inventions": productName.value } 
            }
          )
          
          alert("Your exhibiton was successful!\nRefresh the page!"); 
          productName.value = "";
          productPhoto.value = "";
          productCost.value = "";
          productMaterials.value = "";
          inventorName.value = "";
          closeExhibit();

          loadGallery();
        }
    });
}

function showToAll(productName) {
  db.collection("users")
    .find({}, { limit: 1000 })
    .asArray()
    .then(docs => {
        const usersInDB = docs.map(doc => doc.user);

        for (username in usersInDB) {
          db.collection("inventions").updateOne(
            { "productName": productName },
            { $push: 
              { "showTo": usersInDB[username] } 
            }
          )
        }
    });
}
