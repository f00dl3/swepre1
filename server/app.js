const express = require("express");
const bodyParser = require("body-parser");
const app = express()
        .use(bodyParser.json());
const fs = require('fs');

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

let dsFile = "datastore.json";
let datastore = fs.readFileSync(dsFile);
let nDatastore = {};
let rData = "";

function getMax2(array, prop) {
    var max = Math.max.apply(Math, array.map(function(o) { return o[prop]; }));
    return max;
}

function sortByProperty(prop) {
    return function(a, b) {
        if(a[prop] > b[prop]) return 1;
        else if(a[prop] < b[prop]) return -1;
        return 0;
    };
}

app
    .get("/health", (req, res) => {
        res.status(200).send("Don't panic.");
    })
    .get("/api/books", (req, res) => {
        let maxBookID = -1;
        let bookJSONdata = "";
        datastore = fs.readFileSync(dsFile);
        try { bookJSONdata = datastore; } catch (e) { rData += " Err1: " + e.message + "\n"; }
        let bookParsedJSON = JSON.parse(bookJSONdata);
        let bookArray = bookParsedJSON.books;
        try { bookArray.sort(sortByProperty("title")); } catch (e) {}
        let sortedBookMasterArray = { "books": bookArray };
        rData = JSON.stringify(sortedBookMasterArray);
        res.status(201).send(rData);
    })
    .post("/api/books", (req, res) => {
        let maxBookID = -1;
        let bookJSONdata = "";
        try { bookJSONdata = datastore; } catch (e) { rData += " Err1: " + e.message + "\n"; }
        //console.log("Read file input: " + datastore);
        let bookParsedJSON = JSON.parse(bookJSONdata);
        let bookArray = bookParsedJSON.books;
        try { maxBookID = getMax2(bookArray, "id"); } catch (e) { rData += " Err2: " + e.message + "\n"; }
        let tId = maxBookID + 1;
        let author = ""; try { author = req.body.author; } catch (e) { }
        let title = ""; try { title = req.body.title; } catch (e) { }
        let yearPublished = "";try { yearPublished = req.body.yearPublished; } catch (e) { }
        let tJsonObj = { id: tId, author: author, title: title, yearPublished: yearPublished };
        //console.log("Book array to write: " + bookArray);
        try { bookArray.push(tJsonObj); } catch (e) { bookArray = [ tJsonObj ]; }
        nDatastore = { "books": bookArray };
        fs.writeFile(dsFile, JSON.stringify(nDatastore), err => { });
        //console.log("dbg: New Datastore = " + JSON.stringify(nDatastore));
        datastore = fs.readFileSync(dsFile);
        //console.log("dbg: Re-read file = " + datastore);
        res.status(201).send(JSON.stringify(tJsonObj));                
    })
    .delete("/api/books", (req, res) => {
        nDatastore = { "books": {} };
        fs.writeFile(dsFile, JSON.stringify(nDatastore), err => { });
        datastore = fs.readFileSync(dsFile);
        res.status(204).send();                
    });

module.exports = app;
