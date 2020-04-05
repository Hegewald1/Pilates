/*
const mongoose = require('mongoose')
const Team = require("../../../models/team");
const Event = require("../../../models/event");
const testhold = require("../../../controller/testitems")
*/
var events = [
  {'Date': new Date(2019, 10, 11), 'Title': 'Doctor appointment at 3:25pm.'},
  {'Date': new Date(2019, 10, 18), 'Title': 'New Garfield movie comes out!', 'Link': 'https://garfield.com'},
  {'Date': new Date(2019, 10, 27), 'Title': '25 year anniversary', 'Link': 'https://www.google.com.au/#q=anniversary+gifts'},
];
/*
fælles format for variable time (under team)
create metode til events

-løbe hold igennem
-tilføje events til nogle dage
-metoden skal ikke kører flere gange (laver flere events)
-hente variabler fra hold og indsætte dem på event
-event skal tilføjes til liste med event
-hold, tid og sted skal gemmes i en string og indsættes på dato blokken

-events = tager dato og event_id 
-skal sammenligne med _id når der ændres på den (ændre i event i db)

*/
//laver et nyt event og tilføjer den til db
function createEvent (team, dato) {
    // body
    const event = new Event({
                _id: new mongoose.Types.ObjectId(),
                level: team.level,
                seats: team.seats,
                time: team.time,
                place: team.place,
                users: team.users,
                team: team,
                date: dato
            });
            //Save team in DB
            event
            .save()
            .then(result => {
                console.log(result);
            })
            .catch(err => {
                console.log(err);
            })
          return event
          };

//Skal gøre noget med date
//finde ud af hvordan vi går x weeks frem
/*
evnetuel metode til at lave et enkelt event
metode til at lave events kun for et hold
*/
function createAllEventsXWeeks (date, weeks) {
    // body
let list = Team.find();
d = new Date(date);
  for (const i in list) {
      //let title = i.teamName + " " + i.time + " " + i.place;

      for(let k = 0; k <  weeks; k++){
        event = createEvent(i, d);
        d = d.addDays(7); 
      }
  }
}

Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

Date.prototype.subtractMonths = function(months) {
  var date = new Date(this.valueOf());
  date.setMonth(date.getMonth() - months);
  return date;
}
function addToEvents () {
  // body
  let list = Event.find();
  
  for (const i in list) {
    let title = "'" + i.team.teamName + " " + i.time + " " + i.place + "'";
    events.push({'Date': i.date.subtractMonths(1), 'Title': title})
  }
}
d = new Date(2019, 10, 1);

let title = 'Hej :)'
events.push({'Date': d.subtractMonths(1), 'Title': title})

//opretter events ud fra holdene x uger frem
//createAllEventsXWeeks(Date(2019,11,27), 3);
//tilføjer dem til events array
//addToEvents();

var settings = {};
var element = document.getElementById('caleandar');
caleandar(element, events, settings);
