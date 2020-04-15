This is an implementation of an html code that communicates with MongoDB on Atlas through Stitch.
Main file is named as "_index.html_". After opening it on the browser, all of the operations can be found under three main pages:
         
         - Homepage
         - User homepage
         - Invention page
                                   
This documents contains _Users's Guide_, _Design Choices_ and general information about the current status of the database.

**User's Guide** 
    
1 - In the invention gallery homepage, all usernames are listed. Add User, Delete User and Login as a User options are available.

Add User:
    
    Type the username and click on submit.
    You cannot add a user if the username is not unique.

Delete User:

    Type or copy-past the username from the listed users in database and click on submit.
    You get an alert if you try to delete a username that doesn't exist in the database.
    
Login as a User:

    Type or copy-paste the username from the listed users in database and click on submit.
    You get an alert if you try to login as a user that doesn't exist in the database.
    A successful login will redirect you to user homepage.

2 - In the user homepage, you can see the username and rating at the top. There is an exhibit button which opens a form in the same page. Also, there is a gallery that shows the photos of the inventions with a drop button and stars underneath them. User who exhibited the invention and the invention name can be seen on the top of each photo. Stars show the rating of the user who is currently logged in. After logging in from the main homepage, without a password authentication, you redirect to this page. 

Exhibit an invention:

    Click on the exhibit button.
    Fill in the areas, you can also add optionals.
    But other areas are required, you can't submit the form otherwise.
    Click on submit.
    You will see the message that says your exhibition was successful.
    If the exhibiton is successful, form automatically closes.
    After that, you will immediately see your invention at the bottom without refreshing the page.
    If the image is not loaded, you can refresh the page.
    If you want to close the form without submitting, you should click on the close button on the top left.

Drop an invention:

    Click on the drop button that is at the bottom left of the images.
    You can only drop an invention from your gallery if it is yours.
    After you drop, you can't see it and it drops from the gallery immediately.
    
Rate an invention:

    There are stars at the bottom right of the images.
    To rate 1, click on the star which is on the most left side.
    If you didn't rate before or it is your own invention stars will be all black.
    You can understand the user who exhibited from the text at the top of each image.
    You can rate as many as you want. Last one is counted.
    You cannot rate if it is your own product.
 
Go to invention page:

    Click on the photos of the products listed in gallery.
    You can see the rate and all other information in this page.

3 - In the invention page, product name, photo, cost, materials used, inventors name, product rating and optional elements can be seen.

**Design Choices** 

I chose to have 2 main collections in the '_gallery_' database. These are: 'inventions' and 'users'.

In a user document, I store the inventions exhibited by that user (only with their name), the ratings to other users from this user and the rating this user got from other users.

A sample user document contains:

    {"_id":{"$oid":"5e96235b1c9d44000076689d"},
    "owner_id":"5e8b5233b739bee989e517ef",
    "user":"anna connelly",
    "inventions":["fire escape"],
    "ratedFor":[
    {"dishwasher":{"$numberInt":"5"}},
    {"ironing board":{"$numberInt":"5"}},
    {"first monopoly game":{"$numberInt":"5"}},
    {"tesla coil":{"$numberInt":"5"}},
    {"light bulb":{"$numberInt":"5"}},
    {"baby mop":{"$numberInt":"5"}},
    {"microelectrode":{"$numberInt":"5"}},
    {"goldfish walker":{"$numberInt":"1"}},
    {"phonopgraph":{"$numberInt":"4"}},
    {"mimeograph":{"$numberInt":"3"}},
    {"tesla turbine":{"$numberInt":"5"}},
    {"walking sleeping bag":{"$numberInt":"2"}},
    {"teleautomaton":{"$numberInt":"4"}}],
    "rating":{"$numberDouble":"4.125"}}

In an invention document, I store all of the invention information and also a _showTo_ array, which contains all of the users in the database, no matter when these users are created (_with addToAllInventions function in homepage.js_). If a user drops an invention, I pull that user from this array. In addition to these, I store the users who rated for this product in a string such as "1$thomas edison" where 1 is the rating and $ is a delimiter.

A sample invention document contains:

    {"_id": {"$oid":"5e963be21c9d440000d062ec"}
    "user":"nikola tesla"
    "productName":"tesla coil",
    "productPhoto":"https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Teslova_c%C3%ADvka_v_provozu.JPG/580px-Teslova_c%C3%ADvka_v_provozu.JPG",
    "productCost":"$50",
    "productMaterials":"high voltage supply transformer, capacitor, spark gap",
    "inventorName":"nikola tesla",
    "showTo":["josephine cochrane","anna connelly","sarah boone","elizabeth magey","ida hyde","nikola tesla","thomas edison","john doe","jenny doe","jonathan doe"],
    "usersRated":["1$thomas edison","5$josephine cochrane","5$elizabeth magey","5$anna connelly","5$sarah boone","5$jenny doe"],
    "optional1":"a capacitive electrode (top load) (E) in the form of a smooth metal sphere or torus attached to the secondary terminal of the coil",
    "optional1name":"Optional material for a tesla coil",
    "optional2":"The present is theirs; the future, for which I really worked, is mine.",
    "optional2name":"Inventor quote",
    "rating":{"$numberDouble":"4.333333333333333"}}

I have three main js files for the three main pages:
    
    homepage.js
    user-homepage.js
    invention-page.js

In the homepage, first I load all the users in onload function. For this I use 'users' collection. Also I use this collection for all the other operations in this page. When I add a new user, I add this user to '_showTo_' array of all inventions.

In the user homepage, I load user information and gallery when the page is first loaded. After awaiting all promises from a promise array, I get all of the related information. Then, I edit the inner html accordingly. 

When loading the gallery, I find documents from inventions if they have the current user in their showTo array.

When a user wants to rate, I check _ratedFor_ array of the users in order to understand whether I overwrite or create a new field. I use either pull and _addToSet_ or just _addToSet_ accordingly. Then I first update the rating of the invention and after that, I update the rating of the user. Since I store all of the rating of the inventions seperately in the inventions collection, in order to calculate the user's rating, I just calculate the average of that particular user's invention ratings. 

When a user wants to drop, I pull the user from _showTo_ array.

For drop operation, I update the database only if the length of the returning array from the users collection is greater than 0 when filtered with the current user and product name, which means that I only allow the user to drop it's own inventions. I use a similar approach for rating but the users can rate only others this time.

If a user wants to exhibit and fills the required areas, I update the inventions collection by inserting and user inventions in user collection by pushing to the inventions array accordingly. But if a user didn't fill in the required areas, submitting is not allowed. Optional areas can be empty.

In the invention page, I load all of the product information first. I get the product name from the URL, and find that invention in the database according to that parameter. Then, I edit the inner html.

**Extras**

I set my whitelist to 0.0.0.0/0 to allow the entire Internet into my IP whitelist in Atlas.

Currently there are 10 users and 15 inventions. 

john doe, jenny doe, nikola tesla and thomas edison have more than 1 product. 

teleautomaton, tesla turbine, mimeograph and phonograph are some of the inventions that have 1 or 2 optional elements

**Reference**

External library reference for rating in invention page:

https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css
