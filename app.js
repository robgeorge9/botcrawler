const express = require('express');
const request = require('request');
const cheerio = require('cheerio');

const app = express();

const page = 'https://www.mongodb.com';
let linksFound = [];
let wordsFound = [];
let term = 'Atlas';

// Display Page Name & Term
console.log('Page:', page)
console.log('Term:', term);

// Initialize the check of the page and run the crawl
request(page, (err, res, body,) => {
    if (res.statusCode === 200) {
        let bodyHTML = cheerio.load(body);
        links(bodyHTML);
        linksFound.forEach(function (bodyHTML, index) {
            linkFilter(index);
        })
    }
})

// Check the body response for the text
const searchTerm = (bodyText, term) => {
    let textSearch = bodyText('html > body').text();
    if (textSearch && textSearch.indexOf(term) !== -1) {
        return true;
    } else {
        return false;
    }
}

// Find all of the links on the page and store in an array
const links = (bodyText) => {
    var linkTag = bodyText("a[href^='/']");
    linkTag.each(function () {
        linksFound.push(bodyText(this).attr('href'));
    });

    console.log(`Found ${linksFound.length} links`);
}

// Loop through the linksFound array and check if the term is found on the page. If it is, add that page to the wordsFound array.
const linkFilter = (index) => {
    let nextPage = linksFound[index];
    let fullpath = page + nextPage;
    request(fullpath, (err, res, body) => {
        if (res.statusCode === 200) {
            let bodyHTML = cheerio.load(body);
            if (searchTerm(bodyHTML, term)) {
                wordsFound.push(nextPage);
                console.log(`Word ${term} found on ${nextPage}`)
                linksFound.shift();
            } else {
                linksFound.shift();
            }
        }
        if (linksFound.length === 0) {
            console.log(`Total Number of pages ${term} found on: ${wordsFound.length}`)
        }
    })
}

app.listen(3000);
