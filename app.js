const express = require('express');
const request = require('request');
const cheerio = require('cheerio');

const app = express();

const page = 'https://www.mongodb.com';
let linksFound = [];
let wordsFound = [];
let term = 'Atlas';

// Check Page Name
console.log('Page:', page)
console.log('Term:', term);

// Request the page
request(page, (err, res, body,) => {
    // Check the Response
    if (res.statusCode === 200) {
        let bodyHTML = cheerio.load(body);
        links(bodyHTML);
        linksFound.forEach(function (bodyHTML, index) {
            linkFilter(index);
        })
    }
})

const searchTerm = (bodyText, term) => {
    let textSearch = bodyText('html > body').text();
    if (textSearch && textSearch.indexOf(term) !== -1) {
        return true;
    } else {
        return false;
    }
}

const links = (bodyText) => {
    var linkTag = bodyText("a[href^='/']");
    linkTag.each(function () {
        linksFound.push(bodyText(this).attr('href'));
    });

    console.log(`Found ${linksFound.length} links`);
}

const linkFilter = (index) => {
    let nextPage = linksFound[index];
    let fullpath = page + nextPage;
    request(fullpath, (err, res, body) => {
        // Check the Response
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