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
                        <div style="color:black"> ${doc.user} - ${doc.productName} </div>
                        <img src=\"${doc.productPhoto}\" class=\"invention-img\"
                            id=\"invention-img\" alt=\"\"
                            onClick=\"loadInvention('${doc.productName}')\">
                        <div>
                            <input type="button" class="drop-btn"
                                  value="D R O P" onClick="dropInvention('${doc.productName}')">
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

  console.log(user + " wants to rate " + productName);

  db.collection("users")
    .find({user: user, inventions: productName })
    .asArray()
    .then(function (docs) {

        if (docs.length == 0) {
          db.collection("users")
            .find({user: user}, { limit: 1 })
            .asArray()
            .then(async function (docs) {

                const rated = docs.map(doc => doc.ratedFor)[0];

                let i = 0;
                let ratedBefore = 0;
                while (rated[i]) {
                      if (rated[i][productName]) {
                        let invRating = rated[i][productName];
                        ratedBefore = 1;
                        alert("Previous rate (" + invRating + ") will be overwritten by " + rate);

                        var $oldquery = {};
                        $oldquery[productName] = invRating;
                        db.collection("users").updateOne({user: user}, {$pull : {"ratedFor": $oldquery}});

                        var $newquery = {};
                        $newquery[productName] = rate;
                        db.collection("users").updateOne({user: user}, {$addToSet : {"ratedFor": $newquery}});

                        let oldRating = getUsersRatedString(user, invRating);
                        let newRating = getUsersRatedString(user, rate);

                        db.collection("inventions").updateOne({productName: productName}, {$pull : {"usersRated": oldRating}});
                        db.collection("inventions").updateOne({productName: productName}, {$addToSet : {"usersRated": newRating}});

                        alert("You rated " + productName + " " + rate + ".");

                        loadGallery();
                        
                    }
                    i++;
                }

                if (ratedBefore == 0) {       
                    var $query = {};
                    $query[productName] = rate;
                  
                    db.collection("users").updateOne({user: user}, {$addToSet : {"ratedFor": $query}})

                    let newRating = getUsersRatedString(user, rate);
                    db.collection("inventions").updateOne({productName: productName}, {$addToSet : {"usersRated": newRating}});

                    console.log(user + " is added to usersRated of " + productName);
                  
                    alert("You rated " + productName + " " + rate + ".");
                  
                    loadGallery();               
                    
                }

                let invUpdated = await updateInventionRating(productName);

                let username = await db.collection("inventions")
                  .find({productName: productName}, { limit: 1 })
                  .asArray()
                  .then(function(docs) {
                      const inventionPoster = docs.map(doc => doc.user);
                      return inventionPoster[0];
                  })

                if (invUpdated == true)  {
                    updateUserRating(username);
                }
            });
        }
        else {
            alert("This is your own invention. You cannot rate it. ")
        }
    })

  
  
}

function getUsersRatedString(username, rate) {
  let str = rate + "$" + username;
  return str;
}

async function updateInventionRating(productName) {
    let invUpdated = await db.collection("inventions")
      .find({productName: productName}, { limit: 1 })
      .asArray()
      .then(function (docs) {
          let ratingSum = 0;

          // usersRated: Array >> [0 : "dishwasher$3", 1 : "dishwasher$5" ]
          const sums = docs.map(doc => doc.usersRated)[0];
          let rateCount = sums.length;
          console.log(sums);
          
          let i = 0;
          while(sums[i]) {
            ratingSum += parseInt(sums[i].charAt(0));
            i++;
          }

          let overallRating = ratingSum / rateCount;
          console.log("Sum of all ratings: " + ratingSum);
          console.log("Overall Rating for " + productName + ": " + overallRating);

          db.collection("inventions").updateOne({productName: productName}, {$set : {"rating": overallRating}});

          return true;
        
      });

    return invUpdated;
}

function updateUserRating(username) {
    db.collection("inventions")
      .find({user: username}, { limit: 1000 })
      .asArray()
      .then(function (docs) {
          let ratingSum = 0;
          const sums = docs.map(doc => doc.rating);
          let rateCount = sums.length;
          console.log("Ratings for " + username + "'s inventions: ");
          console.log(sums);

          let i = 0;
          while(sums[i]) {
            console.log(sums[i]);
            ratingSum += sums[i];
            i++;
          }

          let overallRating = ratingSum / rateCount;
          console.log("Sum of all ratings: " + ratingSum);
          console.log("Overall Rating for " + username + ": " + overallRating);

          db.collection("users").updateOne({user: username}, {$set : {"rating": overallRating}});
      })
}

function dropInvention(productName) {
  console.log(user + " wants to drop " + productName);

  db.collection("users")
    .find({user: user, inventions: productName })
    .asArray()
    .then(function (docs) {

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

  const optional1 = document.getElementById("optional-1");
  const optional2 = document.getElementById("optional-2");
  const optional1name = document.getElementById("optional-1-name");
  const optional2name = document.getElementById("optional-2-name");
  
  if (productName.value == '' || productPhoto.value == ''
      || productCost.value == '' || productMaterials.value == ''
      || inventorName.value == '') {
        alert("Required areas* should be filled.")
        return;
      }

  db.collection("inventions")
    .find({productName: productName.value}, { limit: 1 })
    .asArray()
    .then(async function (docs) {
        if (docs.length > 0) {
            alert("Product name should be unique.");
            productName.value = "";
        }
        else {    
          
          let allUsers = await db.collection("users")
              .find({}, { limit: 1000 })
              .asArray()
              .then(function(docs) {
                  const usersInDB = docs.map(doc => doc.user);
                  return usersInDB;
              });


          db.collection("inventions").insertOne(
            {          
                user: user,
                productName: productName.value,
                productPhoto: productPhoto.value,
                productCost: productCost.value,
                productMaterials: productMaterials.value,
                inventorName: inventorName.value,   
                showTo: allUsers,
                usersRated: [],
                optional1: optional1.value,
                optional1name: optional1name.value,
                optional2: optional2.value,
                optional2name: optional2name.value,
                rating: 0
            }           
          )
          
          db.collection("users").updateOne(
            { "user": user },
            { $push: 
              { "inventions": productName.value } 
            }
          ).then(() => {
              alert("Your exhibiton was successful!"); 
              productName.value = "";
              productPhoto.value = "";
              productCost.value = "";
              productMaterials.value = "";
              inventorName.value = "";
              optional1.value = "";
              optional2.value = "";
              optional1name.value = "";
              optional2name.value = "";
              closeExhibit();
    
              loadGallery();
          })
                        
             
        }
    });
}

