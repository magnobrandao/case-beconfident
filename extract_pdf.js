const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('c:/Users/magno/Downloads/case_beconfident_completo.pdf');

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('c:/Users/magno/Downloads/pdf-beconfident/pdf_text.txt', data.text);
    console.log("Extraction complete!");
});
