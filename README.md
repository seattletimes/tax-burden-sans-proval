# Compare local business taxes

This is a Vue app, with very bulky index.html and main.js. Some code has been refactored out for a slightly cleaner product though:

- info.js is a Vue component for those little "i" info circles that hooks them up to open up little detail boxes. It was used more previously, but since I moved a lot of the info in these info boxes into hover boxes, it now has some garbage leftovers (e.g. the `activeCities` variable and everything related to that, I believe)

- equation.js is a Vue component for building the annotated equations that pops up. You feed it an array of parts (two part arrays, which are annotated multiplicands like ['$5 million', 'Your business income'] and one part arrays which are simple values like ["="]) and it builds an equation with flex box

- calculate.js does all the calculation of the taxes, taking the businessInputs (gross revenue, employees, type of business, proprety value - known as 'space' for historical reasons, and sales tax percent) and the tax rates from the cities, and spits out a tax calculation, the parts for the annotated equation, and any caveat that should be printed from the annotation.

- The examples (supermarket, software) are in examples.js. The limits for how you can adjust the inputs are in main.js. Tax rates all come from here: https://docs.google.com/spreadsheets/d/1Fq_P4kEuDKxnleOXWuiOszYdeQpm6qdUF2Or7PuzMjA/edit#gid=0 except for a few cases (see the cells marked -1 in the sheet) which have custom logic in calculate.js

**^I set that spreadsheet so anyone can edit it. I will keep an eye out for the story publishing and make it private when I see it, so that this project can be open source afteward. Just don't want anyone messing with it.**

The project is intended to be embedded, and it needs a few more things before publishing (production: true, url, title, description, social image in `project.json`). Everything needs to be copy edited, and I think the methodology definitely needs some text changes (there are portions which are not complete sentences, which probably should be to match style).

Things got a bit rushed at the end (sorry!) and I wanted to make the full methodology slide down like the info boxes when you click "Tap to read full methodology" but I was having issues with Vue transitions. This ... is not really a priority. But it woud be nice.

Hopefully won't need more besides cosmetic, text, and number changes. Emily knows how to reach me in case of emergency. :)