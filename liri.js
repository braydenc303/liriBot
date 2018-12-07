require("dotenv").config();
var axios = require("axios");
var fs = require("fs");
var keys = require("./keys");
var moment = require("moment");
var Spotify = require('node-spotify-api');
var spotify = new Spotify(keys.spotify);

// Take in the command and name if given and save them in variables.
var action = process.argv[2].toLowerCase();

var name = (process.argv.slice(3).join("+")).toLowerCase();

// Call the correct function depending upon what command is given.
switch(action){
    case "concert-this":
        concertThis(name);
        break;
    case "spotify-this-song":
        if(!name){
        // * If no song is provided then your program will default to "The Sign" by Ace of Base.
            name = "the+sign+ace+of+base"
        }
        spotThis(name);
        break;
    case "movie-this":
        //   * If the user doesn't type a movie in, the program will output data for the movie 'Mr. Nobody.'
        if(!name){
            name = "mr+nobody";
        };
        movieThis(name);
        break;
    case "do-what-it-says":
    // This function assumes that the second argument in RandomSource.txt will always be wrapped in "", and the first will not.
        fs.readFile("random.txt", "utf8", function(error,data){ 
            if(error){
                return console.log(error);
            };
            var request = data.split(",");
            action = request[0];
            // console.log(action);
            if(!request[1]){
                    name = "mr+nobody";
            } else if(request[1]){
            name = (request[1].split(" ")).join("+");
            var end = name.lastIndexOf('"');
            name = (name.substring(1, end)).toLowerCase();
            };
            // console.log(name);
            doThis();
        });
        break;
    default:
        console.log("Enter a valid command.");
};


function concertThis(name) {
    var queryUrl="https://rest.bandsintown.com/artists/" + name + "/events?app_id=codingbootcamp"
    // * This will search the Bands in Town Artist Events API (`"https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp"`) for an artist and 
    axios.get(queryUrl).then(
        //I think if this were rewritten as an arrow function the variable "that" would not be needed.
        function(response) {
            var that = response;
            if((that.data).length<10){
                var length = that.data.length;
            } else {
                var length = 10;
            };
            for(i=0; i<length; i++) {
            // render the following information about each event to the terminal:
            // * Name of the venue
            console.log(`Venue: ${that.data[i].venue.name}`);
            // * Venue location
            console.log(`Location: ${that.data[i].venue.city}, ${that.data[i].venue.region}`)
            // * Date of the Event (use moment to format this as "MM/DD/YYYY")
            //The date variable takes in the date from the site, throws away the extra
            //time information, and parses the date.
            var date = moment((that.data[i].datetime).slice(0,9), "YYYY-MM-DD");
            //The formatDate variable takes the date, and formats it to be more readable.
            var formatDate = moment(date).format("MM/DD/YYYY");
            //The carriage return at the end of the template literal places a line between each result.
            console.log(`Date: ${formatDate}
            `);
            };
        }
    );
};

function spotThis(name) {
    spotify.search({ type: 'track', query: name }, function(err, data) {
        if (err) {
          return console.log('Error occurred: ' + err);
        }
        // console.log(JSON.stringify(data, null, 2)); 
        if(data.length<10){
            var length = data.length;
        } else {
            var length = 10;
        };
        for(i=0; i < length; i++) {
            var title = name.toUpperCase();
        // * This will show the following information about the song in your terminal/bash window
        // * Artist(s)
            console.log(`Artist: ${data.tracks.items[i].artists[0].name}`);
        // * The song's name
            console.log(`Song: ${data.tracks.items[i].name}`);
        // * A preview link of the song from Spotify
            console.log(`Preview: ${data.tracks.items[i].preview_url}`);
        // * The album that the song is from
            console.log(`Album: ${data.tracks.items[i].album.name}
            `);
        };   
      });
};

function movieThis(name) {
    var queryUrl="http://omdbapi.com/?t=" + name + "&y=&plot=short&apikey=trilogy";
    axios.get(queryUrl).then(

        function(response) {
        //     * This will output the following information to your terminal/bash window:
        //     ```
        //       * Title of the movie.
            console.log(`Title: ${response.data.Title}`);
        //       * Year the movie came out.
            console.log(`Released: ${response.data.Year}`);
        //       * IMDB Rating of the movie.
            console.log(`IMDB rating: ${response.data.Ratings[0].Value}`);
        //       * Rotten Tomatoes Rating of the movie.
            console.log(`Rotten Tomatoes rating: ${response.data.Ratings[1].Value}`);
        //       * Country where the movie was produced.
            console.log(`Country: ${response.data.Country}`);
        //       * Language of the movie.
            console.log(`Language: ${response.data.Language}`);
        //       * Plot of the movie.
            console.log(`Plot: ${response.data.Plot}`);
        //       * Actors in the movie.
            console.log(`Actors: ${response.data.Actors}
            `);
        //     ```
            if(name === "mr+nobody"){
        //   * If the user doesn't type a movie in, the program will output data for the movie 'Mr. Nobody.'
        //     * If you haven't watched "Mr. Nobody," then you should: <http://www.imdb.com/title/tt0485947/>
        //     * It's on Netflix!
                console.log("If you haven't watched 'Mr. Nobody,' then you should: <http://www.imdb.com/title/tt0485947/>");
                console.log("It's on Netflix!");
            };
        }
    );
};


function doThis(){
    switch(action){
        case "concert-this":
            concertThis(name);
            break;
        case "spotify-this-song":
            spotThis(name);
            break;
        case "movie-this":
            //   * If no movie name is provided, the program will output data for the movie 'Mr. Nobody.'
            if(!name){
                name = "mr+nobody";
            };
            movieThis(name);
            break;
        default:
            console.log("Error. Check the random.txt file to make sure it contains a properly formated request");
    };
};