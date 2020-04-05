let addUser = document.getElementById('addUser');
let removeUser = document.getElementById('removeUser');
let newUser = document.getElementById('newUser');
let oldUser = document.getElementById('oldUser');
// let url =require('url');
let thisSite = document.URL;
let reg = /[^\/]+(?=\/$|$)/;
// addUser.addEventListener('submit', add);
// removeUser.addEventListener('submit', remove);
newUser.onchange ='add()';
oldUser.onchange = 'remove()';
function add() {
    let team =reg.exec(thisSite)[0];
    let action_src = url.parse(thisSite).protocol + '//' + url.parse(thisSite).host + '/adduser/' + team + '/' + newUser.value;
    console.log(action_src);    
    addUser.action = action_src;    
}
function remove(event) {
    let team =reg.exec(thisSite)[0];
    let action_src = url.parse(thisSite).protocol + '//' + url.parse(thisSite).host + '/removeuser/' + team + '/' + oldUser.value;
    addUser.action = action_src;
}

let reigsterButton = document.getElementsByClassName("btnRegister");
reigsterButton.addEventListener("click", () => {
alert("Du er nu registreret som bruger")
console.log("hej");

});
