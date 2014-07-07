How to run
==========

1. Clone the repository and cd to this directory
2. Edit the config-example file so that it contains your username, password, and database name.
3. Create a new database using the name from step 2.
4. Ensure the secondary indexes and search indexes listed below are created.
5. mv config-example config
6. ./deploy
7. Point your browser to https://$user:$pass@$user.cloudant.com/$db/doc/songblog.html with $user, $pass, and $db replaced with the values from your config file.


Necessary Views and Search Indexes
===========

\_design/users/\_view/users\_by\_birthday
-----------------------------------------

    function(doc) {
        if(doc.type == "user")
            emit(doc.birthday, doc._id);
    }

\_design/playlists/\_view/playlist\_and\_songs
-----------------------------------------

    function(doc) {
        if(doc.type == "playlist"){
            emit([doc._id, "playlist"], doc);
        }
        if(doc.type == "addsong"){
           emit([doc.playlist, "song"], {"artist": doc.artist, "song": doc.song});   
        }
     }

\_design/playlists/\_view/playlist\_with\_actions
-----------------------------------------

    function(doc) {
        if(doc.type == "playlist") {
            emit([doc._id, 0], doc);
        }
        if(doc.type == "action" && doc.actiontype == "like") {
            emit([doc.playlist, 1], doc);
        }
        if(doc.type == "action" && doc.actiontype == "comment") {
            emit([doc.playlist, 2], doc);
        }
    }

\_design/all/\_search/types
-----------------------------------------

    function(doc){
        if (doc.type)
            index("type", doc.type);
    }

\_design/all/\_search/playlists\_and\_comments
-----------------------------------------

    function(doc){
        if(doc.type == "addsong"){
            index("artist", doc.artist);
            index("song", doc.song);
        }
        if(doc.type == "action" && doc.actiontype == "comment"){
            index("comment", doc.comment);
        }
    }
    
\_design/users/\_search/by_userid
-----------------------------------------

    function(doc){
        if(doc.type == "user")
            index("default", doc._id);
    }



