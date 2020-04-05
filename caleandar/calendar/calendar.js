//import {Event} from "../../models/event.js";
//import {Team }from "../../models/team.js";


/**
 * to-do:
 * Gør så man kan se event's på dagene (tilføj info til eform)
 * CUD event
 * afmeld og tilmeld event.
 */


var cal = {
  /* [PROPERTIES] */
  mName : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], // Month Names
  data : null, // Events for the selected period
  sDay : 0, // Current selected day
  sMth : 0, // Current selected month
  sYear : 0, // Current selected year
  sMon : false, // Week start on Monday?

  /* [FUNCTIONS] */
  list : function () {
  // cal.list() : draw the calendar for the given month

    // BASIC CALCULATIONS
    // Note - Jan is 0 & Dec is 11 in JS.
    // Note - Sun is 0 & Sat is 6
    
    //henter og sætter måned og år fra html dokomentet
    cal.sMth = parseInt(document.getElementById("cal-mth").value); // selected month
    cal.sYear = parseInt(document.getElementById("cal-yr").value); // selected year
    var daysInMth = new Date(cal.sYear, cal.sMth+1, 0).getDate(), // number of days in selected month
        startDay = new Date(cal.sYear, cal.sMth, 1).getDay(), // first day of the month
        endDay = new Date(cal.sYear, cal.sMth, daysInMth).getDay(); // last day of the month

    //cal.data = Event.find();

    /**
     * Henter alle events fra databasen.
     * og læser hold navn, tid og placering ind på dagene
     * 
    */
  //kan måske bruge Event.find(day: @day) i stedet for så vi kun finder dage på en bestemt dag
  //
    Event.find((err, data)=>{
      if(err){
        console.log(err)
      } else {
        for (const i in data) {
          let month = i.date.getMonth();
          if(month+1 == cal.sMth){
            let day = i.getDay();
            let info = `Hold: "${i.team.teamName}" \n Tid: "${i.time}" \n Sted: "${i.place}"`
            console.log(info)
    
            cal.data += {day: info};
          }
        }
      }
    });
    
    
    /*
    -skal tjekke på seats og users når dage bliver oprettet
    -tilføje id "full" hvis fuldt event ellers id "available"

    */
    //LOAD DATA FROM DATABASE
    //hvordan data skal hentes i forhold til at indsætte i cal.data

    //Skal hente fra DB i stedet (Event.find(day: @day) hvis ikke der findes nogen event på denne dag, så  )
    /*
    cal.data = localStorage.getItem("cal-" + cal.sMth + "-" + cal.sYear);
    if (cal.data==null) {
      
      localStorage.setItem("cal-" + cal.sMth + "-" + cal.sYear, "{}");
      cal.data = {};
    } else {
      cal.data = JSON.parse(cal.data);
      console.log(cal.data)
    }
    */

    // DRAWING CALCULATIONS
    // Determine the number of blank squares before start of month
    var squares = [];
    if (cal.sMon && startDay != 1) {
      var blanks = startDay==0 ? 7 : startDay ;
      for (var i=1; i<blanks; i++) { squares.push("b"); }
    }
    if (!cal.sMon && startDay != 0) {
      for (var i=0; i<startDay; i++) { squares.push("b"); }
    }

    // Populate the days of the month
    for (var i=1; i<=daysInMth; i++) { squares.push(i); }

    // Determine the number of blank squares after end of month
    if (cal.sMon && endDay != 0) {
      var blanks = endDay==6 ? 1 : 7-endDay;
      for (var i=0; i<blanks; i++) { squares.push("b"); }
    }
    if (!cal.sMon && endDay != 6) {
      var blanks = endDay==0 ? 6 : 6-endDay;
      for (var i=0; i<blanks; i++) { squares.push("b"); }
    }

    // DRAW HTML
    // Container & Table
    var container = document.getElementById("cal-container"),
        cTable = document.createElement("table");
    cTable.id = "calendar";
    container.innerHTML = "";
    container.appendChild(cTable);

    // First row - Days
    var cRow = document.createElement("tr"),
        cCell = null,
        days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
    if (cal.sMon) { days.push(days.shift()); }
    for (var d of days) {
      cCell = document.createElement("td");
      cCell.innerHTML = d;
      cRow.appendChild(cCell);
    }
    cRow.classList.add("head");
    cTable.appendChild(cRow);

    // Days in Month
    var total = squares.length;
    cRow = document.createElement("tr");
    cRow.classList.add("day");
    for (var i=0; i<total; i++) {
      cCell = document.createElement("td");
      if (squares[i]=="b") { cCell.classList.add("blank"); }
      else {
        let date = new Date(this.sYear, this.sMth, i);
        Event.findOne({date: date},(err, data)=>{
          if(err) return handleError(err);
          if(data.users.count() == data.team.seats){
            cCell.classList.add("full")
          } else{
            cCell.classList.add("available")
          }
        })
        //finde event frem
        //tjekke om seats og users.count() er det samme
        //give dem className "full" hvis de er lig hinanden
        //give dem className "available" hvis de ikke er
        //users.count() må ikke være større end seats
        //cCell.className += "full";
        
        cCell.innerHTML = "<div class='dd'>"+squares[i]+"</div>";
        if (cal.data[squares[i]]) {
          cCell.innerHTML += "<div class='evt'>" + cal.data[squares[i]] + "</div>";
        }
        cCell.addEventListener("click", function(){
          //show2 hvis admin
          //show1 hvis normal bruger
          //ikke sikker :) plz check szechuan sauce

          let admin = false;
          let _id = ObjectID(session.passport.user);
          User.findOne({_id: _id}, (err, data)=> {
            if(data!=null){
              admin = true;
            }
          })
          if(admin){
            cal.show2(this);
          } else {
            cal.show1(this);
          }
          
        });
      }
      cRow.appendChild(cCell);
      if (i!=0 && (i+1)%7==0) {
        cTable.appendChild(cRow);
        cRow = document.createElement("tr");
        cRow.classList.add("day");
      }
    }
    // REMOVE ANY ADD/EDIT EVENT DOCKET
    cal.close();
  },


  //Read event
  show1 : function(el){
    
    cal.sDay = el.getElementsByClassName("dd")[0].innerHTML;
    
   //skal finde _id eller andet for at kunne finde event i databasen
    let date = new Date(sYear, sMth, sDay)
    let event = Event.findOne({date: date}, (err)=>{
      if(err) return handleError(err);
    var tForm = "<h1>INFO</h1>";
    tForm += "<div id='evt-date'>" + cal.sDay + " " + cal.mName[cal.sMth] + " " + cal.sYear + "</div>";
    tForm += "<section class='container'>"
    let ulInfo = ["Tid","Sted","Level","hold"]
    tForm += "<ul class='_ul1'>"
    for (let i = 0; i < ulInfo.length; i++) {
      tForm += "<li>"+ ulInfo[i] +"</li>"
    }
    tForm += "</ul>"
  //indsættelse af attributter ved anden ul (ud fra event)
    tForm += "<ul class='_ul2'>"
    tForm += "<li>" + event.time + "</li>"
    tForm += "<li>" + event.place + "</li>"
    tForm += "<li>" + event.level + "</li>"
    tForm += "<li>" + event.team.teamName + "</li>"
    tForm += "</ul>"

    tForm += "<p> ledige point: " + /* brugerens attribut med ledige point */ + "</p>"
    tForm += "</section>"

    tForm += "<input type='button' value='Afmeld' onclick='cal.afmeld()'/>";
    tForm += "<input type='button' value='Tilmeld' onclick='cal.tilmeld()'/>";
    
    //boksen skal laves og info skal indsættes
    
    //Info skal knyttes til eForm, for at komme på ind på dagen. 
    var eForm = document.createElement("form");
    eForm.innerHTML = tForm;
    var container = document.getElementById("cal-event");
    container.innerHTML = "";
    container.appendChild(eForm)
    });
  },

  show2 : function (el) {
  // cal.show() : show edit event docket for selected day
  // PARAM el : Reference back to cell clicked

    // FETCH EXISTING DATA
    cal.sDay = el.getElementsByClassName("dd")[0].innerHTML;

    // DRAW FORM
    var tForm = "<h1>" + (cal.data[cal.sDay] ? "EDIT" : "ADD") + " EVENT</h1>";
    tForm += "<div id='evt-date'>" + cal.sDay + " " + cal.mName[cal.sMth] + " " + cal.sYear + "</div>";
    //tilføjer textarea
    //tForm += "<textarea id='evt-details' required>" + (cal.data[cal.sDay] ? cal.data[cal.sDay] : "") + "</textarea>";
    
    tForm += "<section class='container'>"
    let ulInfo = ["Hold","Tid","Sted","Level"]
    let ulInfo2 = ["time", "place", "level"]
    //let hold = Team.find({}, {teamName : 1});
    /*
    skal kunne rettes hvis event er oprettet
    ellers skal blot hold vælges og fælter udfyldes
    */


    let hold = [
    prof = {
      time: "tirsdag kl 14",
      place: "hoejbjerg",
      level: "pro",
      name: "prof"
    },
    rookie = {
      time: "onsdag kl 21",
      place: "skejby",
      level: "rookie",
      name: "rookie"
    }];
    //oprette dropdown list og tilføje holdene til det
    tForm += "<select id='dropdown'>";
    //let select = document.getElementById("dropdown");
    //let hold = Team.find();
    for (let i = 0; i < hold.length; i++) {
      tForm += "<option value='" + hold[i].innerHTML + "'>" + hold[i].name + "</option>";
      //select.options[select.options.length] = new Option(hold[i], i)
    }
    tForm += "</select>"
   /*
    for (index in hold) {
      select.options[select.options.length] = new Option(hold[i], index)
    }
    */

    tForm += "<ul class='_ul1'/>"
    for (let i = 0; i < ulInfo.length; i++) {
      tForm += "<li>"+ ulInfo[i] +"</li>"
    }
    tForm += "</ul>"
    tForm += "<ul class='_ul2'/>"
    for (let i = 0; i < ulInfo2.length-1; i++) {
      tForm += "<li> <input type='text' required, id='" + ulInfo2[i] + "'</input></li>"
    }
    
    tForm += "</section>"
    
    tForm += "<input type='button' value='Close' onclick='cal.close()'/>";
    tForm += "<input type='button' value='Delete' onclick='cal.del()'/>";
    tForm += "<input type='submit' value='Save'/>";

    // ATTACH
    /*
    let ul = document.createElement("ul")
    ul.setAttribute("id","_ul");
    for (let i = 0; i < ulInfo.length; i++) {
      let li = document.createElement("li")
      li.appendChild(document.createTextNode(ulInfo[i]));
      ul.appendChild(li);      
    }
    */
    
    var eForm = document.createElement("form");
    eForm.addEventListener("submit", cal.save);
    //eForm.appendChild(ul);
    eForm.innerHTML = tForm;
    var container = document.getElementById("cal-event");
    container.innerHTML = "";
    container.appendChild(eForm)
  },

  close : function () {
  // cal.close() : close event docket

    document.getElementById("cal-event").innerHTML = "";
  },

  save : function (evt) {
  // cal.save() : save event
  //skal også gemem det i databasen
  //hvis event allerede er eksisterende skal den tjekke på dato og finde event
  //eventuelt gemme event._id inde på calendar
    evt.stopPropagation();
    evt.preventDefault();

    cal.sDay = el.getElementsByClassName("dd")[0].innerHTML;

    let tid = document.getElementById("time").value
    let sted = document.getElementById("place").value
    let hold = document.getElementById("dropdown")
    let team = hold.options[hold.selectedIndex].value

    //tjekke om der allerede er et event
    if(document.getElementById("evt-details").value !== null){
      let date =  new Date(this.sYear, this.sMth, this.sDay);
      //hente den nye information
      cal.data[cal.sDay] = ""
      Event.findOneAndUpdate({date: date}, )
    }//opret event (baseret på valgte hold)
    else{
      //det valgte team ud fra dropdown listen
      const event = new Event({
        _id: new mongoose.Types.ObjectId(),
        level: team.level,
        seats: team.users.count(),
        time: team.time,
        place: team.place,
        date: new Date(this.sYear, this.sMth, this.sDay), //den valgte dato (ikke sikker)
        users: team.users,
        team: team
    });
    user
    .save()
    .then(result => {
      console.log(result);
    })
    .catch(err => {
      console.log(err);
    });
    }

    //finde holdet i databasen og lave eventet ud fra det og gemme det

    cal.data[cal.sDay] = document.getElementById("evt-details").value;
    
    localStorage.setItem("cal-" + cal.sMth + "-" + cal.sYear, JSON.stringify(cal.data));
    cal.list();
  },

  del : function () {
  // cal.del() : Delete event for selected date
  //skal også slette det fra databasen
  //tjekke på dato og slette event
    

    if (confirm("Remove event?")) {
      delete cal.data[cal.sDay];
      //database call findAndRemove()
      localStorage.setItem("cal-" + cal.sMth + "-" + cal.sYear, JSON.stringify(cal.data));
      cal.list();
    }
  },
  afmeld : function(){
    /*
    -skal kun vises fra bruger siden
    -finde event nede i databasen
    -event.users fjern user som er logget ind
    -give user +1 ledige point
    */
   cal.sDay = el.getElementsByClassName("dd")[0].innerHTML;
   let date = new Date(this.sYear, this.sMth, this.sDay);
   let event = Event.findOne({date: date});
   for (let i = 0; i < event.users.length; i++) {
     if(event.users[i].name/* sammenligne med bruger som er logged ind */){
      //finde event i database og fjerne user fra arrayet og gemme
      //give user +1 ledige point og gemme
      
     }
     
   }

  },
  tilmeld : function(){
    /*
    -tilmeld knappen skal kun kunne trykkes hvis ledige point > 0
    -ledige point -1 når user tilmeldes
    -event.user tilføj til event i databasen
    */
   cal.sDay = el.getElementsByClassName("dd")[0].innerHTML;
   let date = new Date(this.sYear, this.sMth, this.sDay);
   let event = Event.findOne({date: date});
   if(event.users.count() < event.team.users.count()){
     //tilføje user til event arrayet i databasen
     //finde user i databasen og -1 ved ledige point
   }
  }
};

// INIT - DRAW MONTH & YEAR SELECTOR
window.addEventListener("load", function () {
  // DATE NOW
  var now = new Date(),
      nowMth = now.getMonth(),
      nowYear = parseInt(now.getFullYear());

  // APPEND MONTHS SELECTOR
  var month = document.getElementById("cal-mth");
  for (var i = 0; i < 12; i++) {
    var opt = document.createElement("option");
    opt.value = i;
    opt.innerHTML = cal.mName[i];
    if (i==nowMth) { opt.selected = true; }
    month.appendChild(opt);
  }

  // APPEND YEARS SELECTOR
  // Set to 10 years range. Change this as you like.
  var year = document.getElementById("cal-yr");
  for (var i = nowYear-10; i<=nowYear+10; i++) {
    var opt = document.createElement("option");
    opt.value = i;
    opt.innerHTML = i;
    if (i==nowYear) { opt.selected = true; }
    year.appendChild(opt);
  }

  // START - DRAW CALENDAR
  document.getElementById("cal-set").addEventListener("click", cal.list);
  cal.list();
});

//Create event
  // TILFØJ EVENTS EFTER DATO

  /**
   * to-do:
   * skal bruge event schema
   * pug fil til indtastning af data til oprettelse af et event
   * Denne data skal hentes via document.getElementById().
   * Og så skal den gemmes i databasen.
   * måske lave en addEventToCalandar(event() =>{}, day) metode som tilføjer en event til en bestem dato.
   * Man kan måske lave event() til en lambda funktion (ved ikke hvordan det kommer til at virke med parameter)
   * 
   * til sidst skal alle event hentes igen så man kan se den nye event er kommet ind
   * 
   * Er der nødvendigt at have dato, som parameter, kan man ikke bare bruge den dato som man allerede er på (cal.sDay)
   */
  //Man skal have Event.schema

function addEvents(dato) {
  /**
   * Hvordan opretter man et event:
   * - vælg en dato
   * - vælg et hold
   * - indtast alle infomationer om et event
   * - tryk gem
   * 
   * to-do:
   * -extract dato(cal.sDay), hold(Team.find(teamName :@teamName)), event info (doc.findElementById())
   * -indsæt denne info i et event schema
   * -gem schema
   * -load alle event.
   */
  let list = Team.Find();
  for (const key in list) {
    //oprettelse af event
  }
}