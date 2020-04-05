const express = require("express");
const router = express.Router();

//Homepage routes for tabs except tilmeld/afmeld, its in user
router.get("/", (req, res) => {
    res.render("forside",{'authenticated':req.isAuthenticated()});
});
//Forside route
router.get("/forside", (req, res) => {
    res.render("forside", {'authenticated':req.isAuthenticated()});
});
//Om pilates route
router.get("/omPilates", (req, res) => {
    res.render("omPilates", {'authenticated':req.isAuthenticated()});
});
//Nyheder route
router.get("/nyheder", (req, res) => {
    res.render("nyheder", {'authenticated':req.isAuthenticated()});
});
//Om holdene route
router.get("/omHoldene", (req, res) => {
    res.render("omHoldene", {'authenticated':req.isAuthenticated()});
});
//Holdplan route
router.get("/holdplan", (req, res) => {
    res.render("holdplan", {'authenticated':req.isAuthenticated()});
});
//Priser route
router.get("/priser", (req, res) => {
    res.render("priser", {'authenticated':req.isAuthenticated()});
});
//Kontakt mig route
router.get("/kontaktMig", (req, res) => {
    res.render("kontaktMig", {'authenticated':req.isAuthenticated()});
});
//Underviser route
router.get("/underviser", (req, res) => {
    res.render("underviser", {'authenticated':req.isAuthenticated()});
});
//Link route
router.get("/links", (req, res) => {
    res.render("links", {'authenticated':req.isAuthenticated()});
});

module.exports = router;