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

2 - In the user homepage, you can see the username and rating at the top. There is an exhibit button which opens a form in the same page. Also, there is a gallery that shows the photos of the inventions with a drop button and stars underneath them. Stars show the rating of the user who is currently logged in. After logging in from the main homepage, without a password authentication, you redirect to this page. 

Exhibit an invention:

    Click on the exhibit button.
    Fill in the areas, you can also add optionals.
    Click on submit.
    You will see the message that says your exhibition was successful.
    If the exhibiton is successful, form automatically closes.
    After that, you will immediately see your invention at the bottom without refreshing the page.
    If the image is not loaded, you can refresh the page.
    If you want to close the form without submitting, you should click on the close button on the top left.
    
**Design Choices** 
External library reference for rating in invention page:
https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css