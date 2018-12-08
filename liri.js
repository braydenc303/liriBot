require("dotenv").config();
var axios = require("axios");
var fs = require("fs");
var keys = require("./keys");
var moment = require("moment");
var Spotify = require('node-spotify-api');
var spotify = new Spotify(keys.spotify);
var inquirer = require("inquirer");

//These commented out lines are for the version that did not use inquirer. They are being kept due to the fact that I am currently experiencing an inquirer bug and want to keep them just in case things get worse.
// Take in the command and name if given and save them in variables.
// var action = process.argv[2].toLowerCase();
// var request = (process.argv.slice(3).join("+")).toLowerCase();

var action;
var request;


function concertThis(request) {
    var queryUrl="https://rest.bandsintown.com/artists/" + request + "/events?app_id=codingbootcamp"
    // * This will search the Bands in Town Artist Events API (`"https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp"`) for an artist and 
    axios.get(queryUrl).then(
        //I think if this were rewritten as an arrow function the variable "that" would not be needed.
        function(response) {
            if((response.data).length<10){
                var length = response.data.length;
            } else {
                var length = 10;
            };
            for(i=0; i<length; i++) {
            // render the following information about each event to the terminal:
            // * Name of the venue
            console.log(`Venue: ${response.data[i].venue.name}`);
            // * Venue location
            console.log(`Location: ${response.data[i].venue.city}, ${response.data[i].venue.region}`)
            // * Date of the Event (use moment to format this as "MM/DD/YYYY")
            //The date variable takes in the date from the site, throws away the extra
            //time information, and parses the date.
            var date = moment((response.data[i].datetime).slice(0,9), "YYYY-MM-DD");
            //The formatDate variable takes the date, and formats it to be more readable.
            var formatDate = moment(date).format("MM/DD/YYYY");
            //The carriage return at the end of the template literal places a line between each result.
            console.log(`Date: ${formatDate}
            `);
            };
        }
    );
};

function spotThis(request) {
    spotify.search({ type: 'track', query: request }, function(err, data) {
        if (err) {
          return console.log('Error occurred: ' + err);
        }
        // console.log(JSON.stringify(data, null, 2)); 
        if((data.tracks.items).length<10){
            var length = (data.tracks.items).length;
        } else {
            var length = 10;
        };
        for(i=0; i < length; i++) {
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

function movieThis(request) {
    var queryUrl="http://omdbapi.com/?t=" + request + "&y=&plot=short&apikey=trilogy";
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
            if(request === "mr+nobody"){
        //   * If the user doesn't type a movie in, the program will output data for the movie 'Mr. Nobody.'
        //     * If you haven't watched "Mr. Nobody," then you should: <http://www.imdb.com/title/tt0485947/>
        //     * It's on Netflix!
                console.log("If you haven't watched 'Mr. Nobody,' then you should: <http://www.imdb.com/title/tt0485947/>");
                console.log("It's on Netflix!");
            };
        }
    );
};


function doThis(action, request){
    switch(action){
        case "concert-this":
            concertThis(request);
            break;
        case "spotify-this-song":
            spotThis(request);
            break;
        case "movie-this":
            //   * If no movie name is provided, the program will output data for the movie 'Mr. Nobody.'
            if(!request){
                request = "mr+nobody";
            };
            movieThis(request);
            break;
        default:
            console.log("Error. Check the random.txt file to make sure it contains a properly formated request");
    };
};

//I would like to add inquirer functionality to this. I think that to implement a user friendly workflow, I will need to nest the second question inside the first, and call functions based on the answers. It wont be much additional code, but I will need to reorganize it in order to have access to the correct variables. Or perhaps not, let's find out.
inquirer
    .prompt([
        {
            type: "list",
            message: "What would you like to know about?",
            choices: ["A Concert", "A Movie", "A Song", "Something Random"],
            name: "request"
        }
    ])
    .then(function(inquirerResponse){
       switch(inquirerResponse.request){
           case "A Concert":
           inquirer
            .prompt([
                {
                    type: "input",
                    message: "What is the name of the artist you would like to see?",
                    name: "name"
                }
            ])
            .then(function(response){
                console.log(`Here is some information on the next several ${response.name} concerts:\n`)
                request = ((response.name).split(" ").join("+")).toLowerCase();
                concertThis(request);
            })
           break;
           case "A Song":
           inquirer
            .prompt([
                {
                    type: "input",
                    message: "What is the name of the song you would like to know about?",
                    name: "name"
                }
            ])
            .then(function(response){
                console.log(`Here are some recordings of songs called ${response.name}:\n`);
                request = ((response.name).split(" ").join("+")).toLowerCase();
                spotThis(request);
            })
           break;
           case "A Movie":
           inquirer
            .prompt([
                {
                    type: "input",
                    message: "What is the name of the movie you would like to know about?",
                    name: "name"
                }
            ])
            .then(function(response){
                console.log(`Here is some information about the movie ${response.name}:\n`)
                request = ((response.name).split(" ").join("+")).toLowerCase();
                movieThis(request);
            })
           break;
            case "Something Random":
// This function assumes that the second argument in RandomSource.txt will always be wrapped in "", and the first will not.
            fs.readFile("random.txt", "utf8", function(error,data){ 
                if(error){
                    return console.log(error);
                };
                var question = data.split(",");
                action = question[0];
                // console.log(action);
                if(!question[1]){
                        request = "mr+nobody";
                } else if(question[1]){
                request = (question[1].split(" ")).join("+");
                var end = request.lastIndexOf('"');
                request = (request.substring(1, end)).toLowerCase();
                };
                // console.log(name);
                doThis(action, request);
            });
            break;
           default:
                console.log("Sorry. I'm not feeling very well. Try again in while.");
        } 
    });


// The following code was used before inquirer was implemented.
// Call the correct function depending upon what command is given.
// switch(action){
//     case "concert-this":
//         concertThis(request);
//         break;
//     case "spotify-this-song":
//         if(!request){
//         // * If no song is provided then your program will default to "The Sign" by Ace of Base.
//             request = "the+sign+ace+of+base"
//         }
//         spotThis(request);
//         break;
//     case "movie-this":
//         //   * If the user doesn't type a movie in, the program will output data for the movie 'Mr. Nobody.'
//         if(!request){
//             request = "mr+nobody";
//         };
//         movieThis(request);
//         break;
//     case "do-what-it-says":
//     // This function assumes that the second argument in RandomSource.txt will always be wrapped in "", and the first will not.
//         fs.readFile("random.txt", "utf8", function(error,data){ 
//             if(error){
//                 return console.log(error);
//             };
//             var question = data.split(",");
//             action = request[0];
//             // console.log(action);
//             if(!question[1]){
//                     request = "mr+nobody";
//             } else if(question[1]){
//             request = (question[1].split(" ")).join("+");
//             var end = request.lastIndexOf('"');
//             request = (request.substring(1, end)).toLowerCase();
//             };
//             // console.log(name);
//             doThis();
//         });
//         break;
//     default:
//         console.log("Enter a valid command.");
// };