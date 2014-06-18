$( document ).ready(function() {

   var baseUrl = "https://" + user + ":" + pass + "@" + user + ".cloudant.com/" + db;

   // search indexes
   var types = baseUrl + "/_design/all/_search/types";
   //var by_userid = baseUrl + "/_design/users/_view/by_userid";
   var by_userid = baseUrl + "/_design/users/_search/by_userid";
   var sort_by_birthday = baseUrl + "/_design/users/_view/users_by_birthday";
   var playlist_and_songs = baseUrl + "/_design/playlists/_view/playlist_and_songs";
   var playlist_and_actions = baseUrl + "/_design/playlists/_view/playlist_with_actions";
   var playlists_and_comments = baseUrl + "/_design/all/_search/playlists_and_comments";

   // global variables
   var playlistDropDowns = [$( "#readplaylistname" ), $( "#updateplaylistname" ), 
                              $( "#deleteplaylistname" ), $( "#actionplaylistname" )];
   var playlists = [];
   getAllPlaylists(true);
   var userDropDowns = [$( "#selectuserid" )];
   var users = [];
   getAllUsers(true);

   function errorHandler(jqXHR, textStatus, errorThrown) {
      $( "#output-data" ).text(JSON.stringify(jqXHR, null, 2));
   }

   // on create
   $( "#create" ).click(function( event ) {
      var newplaylist = $( "#newplaylistname" ).val();
      var uid = $( "#selectuserid" ).val();
      if (uid == "empty")
         uid = "anonymous";
      var time = new Date().getTime() / 1000;

      if(newplaylist) {
         $.ajax({
            url: baseUrl,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
               _id: newplaylist, 
               type: "playlist",
               userid: uid,
               timestamp: time
            }),
            error: errorHandler
         }).done(function( data ) {
            var doc = JSON.parse(data);
            $( "#output-data" ).text(JSON.stringify(doc, null, 2));
            $( "#newplaylistname" ).val("");
            getAllPlaylists(true);
         });
      }
   });

   $( "#read" ).click(function( event ) {
      var readplaylist = $( "#readplaylistname" ).val();
      if (readplaylist) {
         $.ajax({
            url: playlist_and_songs + "?startkey=[\"" + readplaylist + "\",\"playlist\"]&endkey=[\"" + readplaylist + "\",\"z\"]",
            type: "GET",
            error: errorHandler
         }).done(function( data ) {
            var doc = JSON.parse(data);
            $( "#output-data" ).text(JSON.stringify(doc, null, 2));
         });         
      }   
   });

   $( "#update" ).click(function( event ) {
      var p_input = $( "#updateplaylistname" ).val();
      var a_input = $( "#artistname" ).val();
      var s_input = $( "#songname" ).val();
      var uid = $( "#selectuserid" ).val();
      if(uid == "empty")
         uid = "anonymous";

      if(p_input && a_input && s_input) {
         $.ajax({
            url: baseUrl,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
               playlist: p_input,
               artist: a_input,
               song: s_input,
               type: "addsong",
               userid: uid
            }),
            error: errorHandler
         }).done(function( data ) {
            var doc = JSON.parse(data);
            $( "#output-data" ).text(JSON.stringify(doc, null, 2));
            $( "#artistname" ).val("<Artist Name>");
            $( "#songname" ).val("<Song Title>");
         });
      }
   });

   // on delete
   $( "#delete" ).click(function( event ) {
      var deleteplaylist = $( "#deleteplaylistname" ).val();
      var docUrl = baseUrl + "/" + deleteplaylist;
      if(deleteplaylist) {
         $.ajax({
            url: docUrl,
            type: "GET",
            error: errorHandler
         }).done(function( data ) {
            var doc = JSON.parse(data);
            var rev = doc['_rev'];
            $.ajax({
               url: docUrl + "?rev=" + rev,
               type: "DELETE",
               error: errorHandler
            }).done(function( data ) {
               var doc2 = JSON.parse(data);
               $( "#output-data" ).text(JSON.stringify(doc2, null, 2));
               getAllPlaylists(true);
            });
         });
      }
   });

   // when submitting a comment
   $( "#submit" ).click(function( event ) {
      var c_input = $( "#comment" ).val();
      var p_input = $( "#actionplaylistname" ).val();
      var uid = $( "#selectuserid" ).val();
      var time = new Date().getTime() / 1000;
      if(uid == "empty")
         uid = "anonymous";
      if(p_input == "empty") {
         alert("You must select a playlist to comment on!");
         return;
      }

      if(comment) {
         $.ajax({
            url: baseUrl,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
               playlist: p_input,
               userid: uid,
               comment: c_input,
               type: "action",
               actiontype: "comment",
               timestamp: time
            }),
            error: errorHandler
         }).done(function( data ) {
            var doc = JSON.parse(data);
            $( "#output-data" ).text(JSON.stringify(doc, null, 2));
            $( "#comment" ).val("Enter your comment here...");
         });
      }
   });

   // when liking a playlist
   $( "#like" ).click(function( event ) {
      var p_input = $( "#actionplaylistname" ).val();
      var uid = $( "#selectuserid" ).val();
      var time = new Date().getTime() / 1000;
      if(uid == "empty")
         uid = "anonymous";
      if(p_input == "empty") {
         alert("You must select a playlist to like!");
         return;
      }

      $.ajax({
         url: baseUrl,
         type: "POST",
         contentType: "application/json",
         data: JSON.stringify({
            playlist: p_input,
            userid: uid,
            type: "action",
            actiontype: "like",
            timestamp: time
         }),
         error: errorHandler
      }).done(function( data ) {
         var doc = JSON.parse(data);
         $( "#output-data" ).text(JSON.stringify(doc, null, 2));
      });      
   });

   // when pulling all likes and comments for a playlist
   $( "#getactions" ).click(function( event ) {
      var playlist = $( "#actionplaylistname" ).val();
      if(playlist != "empty") {
         $.ajax({
            url: playlist_and_actions + "?startkey=[\"" + playlist + "\",0]&endkey=[\"" + playlist + "\",10]",
            type: "GET",
            error: errorHandler
         }).done(function( data ) {
            var doc = JSON.parse(data);
            $( "#output-data" ).text(JSON.stringify(doc, null, 2));
         });
      }
   });

   // search playlists and comments
   $( "#search" ).click(function( event ) {
      var search = $( "#searchquery" ).val();
      if(search) {
         $.ajax({
            url: playlists_and_comments + "?q=artist:" + search + " OR song:" + search + " OR comment:" + search + "&include_docs=true",
            type: "GET",
            error: errorHandler
         }).done(function( data ) {
            var doc = JSON.parse(data);
            $( "#output-data" ).text(JSON.stringify(doc, null, 2));
            $( "#searchquery" ).val("");
         });
      }
   });

   // get all playlists from the database
   function getAllPlaylists (update) {
      playlists = [];
      var response = $.ajax({
         url: types + "?q=type:playlist",
         type: "GET",
         error: errorHandler
      });

      response.success(function (data) {
         var rows = JSON.parse(data)['rows'];
         $.each(rows, function ( i, value ) {
            playlists.push(value['id']);
         });

         if(update)
            populatePlaylistDropDowns();
      });
   }

   // populate the dropdown list for Read
   function populatePlaylistDropDowns () {
      $.each(playlistDropDowns, function ( i, dropdown ) {
         var options = "<option value=\"empty\"> --- </option>";
         $.each(playlists, function ( j, playlist ) {
            options += "<option value=\"" + playlist + "\">" + playlist + "</option>";
         });
         dropdown.find("option").remove().end().append(options);
      });
   }

   // get all users from the database
   function getAllUsers (update) {
      users = [];
      var response = $.ajax({
         url: types + "?q=type:user",
         type: "GET",
         error: errorHandler
      });

      response.success(function (data) {
         var rows = JSON.parse(data)['rows'];
         $.each(rows, function ( i, value ) {
            users.push(value['id']);
         });

         if(update)
            populateUserDropDowns();
      });
   }

   // populate the dropdown list for Read
   function populateUserDropDowns () {
      $.each(userDropDowns, function ( i, dropdown ) {
         var options = "<option value=\"empty\"> --- </option>";
         $.each(users, function ( j, user ) {
            options += "<option value=\"" + user + "\">" + user + "</option>";
         });
         dropdown.find("option").remove().end().append(options);
      });
   }

   // reset the artist name field if it is empty
   $( "#artistname" ).blur(function() {
      if($( "#artistname" ).val() == "") {
         $( "#artistname" ).val("<Artist Name>");
      }
   });

   // reset the song name field if it is empty
   $( "#songname" ).blur(function() {
      if($( "#songname" ).val() == "") {
         $( "#songname" ).val("<Song Title>");
      }
   });




   // USER SECTION

   // on create
   $( "#createuser" ).click(function( event ) {
      var newUser = {type: "user"};
      if ($( "#userid" ).val())
         newUser._id = $( "#userid" ).val();
      if ($( "#email" ).val())
         newUser.email = $( "#email" ).val();
      if ($( "#city" ).val())
         newUser.city = $( "#city" ).val();
      if($( "#state" ).val())
         newUser.state = $( "#state" ).val();
      if($( "#country" ).val())
         newUser.country = $( "#country" ).val();
      if($( "#birthday" ).val())
         newUser.birthday = parseInt($( "#birthday" ).val());

      // we only care if they atleast entered a userid
      if(newUser._id) {
         $.ajax({
            url: baseUrl,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(newUser),
            error: errorHandler
         }).done(function( data ) {
            var doc = JSON.parse(data);
            $( "#output-data" ).text(JSON.stringify(doc, null, 2));
         });
      }
   });

   // on read
   $( "#locateuser" ).click(function( event ) {
      var userid = $( "#locate" ).val();
      if(userid) {
         $.ajax({
            url: by_userid + "?q=" + userid + "&include_docs=true",
            type: "GET",
            error: errorHandler
         }).done(function( data ) {
            var doc = JSON.parse(data);
            $( "#output-data" ).text(JSON.stringify(doc, null, 2));
         });
      }
   });

   // on bday sort
   $( "#sort_by_birthday" ).click(function( event ) {
      var start = $( "#startdate" ).val();
      var end = $( "#enddate" ).val();
      var descending = false;
      var endpoint = sort_by_birthday;

      // these are not valid keys
      if (start == "<Start-YYYYMMDD>")
         start = "";
      if (end == "<End-YYYYMMDD>")
         end = "";

      // build the start and end keys
      if(start && end)
         endpoint += "?startkey=" + start + "&endkey=" + end;
      else if (start)
         endpoint += "?startkey=" + start;
      else if (end)
         endpoint += "?endkey=" + end;

      // should we reverse the order we return the results?
      if($( "#reverse" ).prop("checked"))
         descending = true;

      if(endpoint != sort_by_birthday && descending)
         endpoint += "&descending=true";
      else if (descending)
         endpoint += "?descending=true";

      // finally query the view
      $.ajax({
         url: endpoint,
         type: "GET",
         error: errorHandler
      }).done(function( data ) {
         var doc = JSON.parse(data);
         $( "#output-data" ).text(JSON.stringify(doc, null, 2));
      });
   });

});

