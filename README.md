How to run
==========

1. Clone the repository and cd to this directory
2. Edit the config-example file so that it contains your username, password, and database name.
3. Create a new database using the name from step 2.
4. Ensure the following secondary indexes are created:

\_design/users/\_view/users\_by\_birthday
-----------------------------------------

    function(doc) {
        if(doc.type == "user")
            emit(doc.birthday, doc._id);
    }

5. mv config-example config
6. ./deploy
7. Point your browser to https://$user:$pass@$user.cloudant.com/$db/doc/songblog.html with $user, $pass, and $db replaced with the values from your config file.

