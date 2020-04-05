const express = require("express");
const app = express();

/*
app.post("/", function(req, res) {
    req.body.u_list.addEventListener("click", selectedTab, false);
})
*/

function selectedTab() {
  console.log("selectedTab() bliver kørt :)");
  let item;
  let ulItem;
  reset = () => {
    ulItem = req.body.u_list;
    for (let i = 0; i < ulItem.length; i++) {
      item = ulItem[i].setAttribute("class", null);
    }
  };
  app.post("/", function(req, res) {
    ulItem = req.body.u_list;
    item = ulItem[ulItem.selectedIndex];
    item.setAttribute("class", "current");
  });
}
/*
$app.post("/", function(req, res) {
    $('.main-nav ul li a').click(function () {
        $('.main-nav ul li').removeClass('selected');
        $(req.body.currentTarget).parent('li').addClass('selected');
    });
});
*/

//_----------------------------------
let i = 0; // Start Point
let images = []; // Images Array
let time = 3000; // Time Between Switch

// Image List
images[0] = "image1.jpg";
images[1] = "image2.jpg";
images[2] = "image3.jpg";
images[3] = "image4.jpg";

// Change Image
function changeImg() {
  document.slide.src = images[i];

  // Check If Index Is Under Max
  if (i < images.length - 1) {
    // Add 1 to Index
    i++;
  } else {
    // Reset Back To O
    i = 0;
  }
  // Run function every x seconds
  setTimeout("changeImg()", time);
}
// Run function when page loads
window.onload = changeImg;
