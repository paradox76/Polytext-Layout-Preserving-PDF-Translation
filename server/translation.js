import express from 'express';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs/promises';
import path from 'path';


import Tesseract from 'tesseract.js';
import { pdf as pdftoimg } from 'pdf-to-img';

import translate from 'google-translate-api-x';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

import sharp from 'sharp';

import { GoogleGenAI } from '@google/genai';


const googleToTesseract = {
    'en': 'eng', 'pa': 'pan', 'hi': 'hin', 'ar': 'ara', 'ur': 'urd',
    'mr': 'mar', 'ne': 'nep', 'sa': 'san', 'fr': 'fra', 'es': 'spa',
    'de': 'deu', 'pt': 'por', 'it': 'ita', 'nl': 'nld', 'pl': 'pol',
    'sv': 'swe', 'tr': 'tur', 'ro': 'ron','ru': 'rus'
};

const SCALE = 7;

pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/legacy/build/pdf.worker.mjs';
export const transRoute = express.Router();




const pdfPageMaker = async (buffer, pgnum, finalLang, oldpack, pageColor, dimsOCR) => {


    pgnum = pgnum - 1;
    const doc = await PDFDocument.load(buffer);
    const testDoc = await PDFDocument.create();
    const copiedPage = await testDoc.copyPages(doc, [pgnum]);
    const page = copiedPage[0];

    const { width, height } = page.getSize();



    let { ogTextArray, trans, startCord, endCord, fontsize } = oldpack;


    console.log("first Consoled from pdfmaker", ogTextArray, trans, startCord, endCord, fontsize);
    console.log(ogTextArray.length, startCord.length, endCord.length, fontsize.length);
    let fontFile;

    switch (finalLang) {
        case 'pa':
            fontFile = await fs.readFile('./fonts/NotoSerifGurmukhi-Regular.ttf');
            console.log('punjabi', fontFile.length);
            break;
        case 'fa':
        case 'pe':
        case 'ar':
        case 'ur':
            fontFile = await fs.readFile('./fonts/NotoSansArabic-Regular.ttf')
            break;
        case 'hi':
            fontFile = await fs.readFile('./fonts/TiroDevanagariHindi-Regular.ttf');
            break;

        default:
            fontFile = await fs.readFile('./fonts/NotoSans-Regular.ttf')
            break;
    }

    testDoc.registerFontkit(fontkit);
    const font = await testDoc.embedFont(fontFile);

    let newstartCord;
    let newendCord;
    if (pageColor) {

        newstartCord = startCord.map((e, i) => {
            if (e === 0 || !e) {
                return { x: 0, y: 0 };  
            }
            let x = e.x0 / dimsOCR.width * width;
            let y = (dimsOCR.height - e.y0) / dimsOCR.height * height;

            return { x, y };
        });


        newendCord = endCord.map((e, i) => {
            if (typeof startCord[i] === 'number') return { x: 0, y: 0 };
            let x = e.x1 / dimsOCR.width * width;
            let y = (dimsOCR.height - e.y1) / dimsOCR.height * height;

            return { x, y };
        });

        fontsize = fontsize.map((e) => e / SCALE);

        startCord = newstartCord;
        endCord = newendCord;

    }

    // console.log(ogTextArray, trans, startCord, endCord, fontsize);
    //console.log(ogTextArray.length, startCord.length, endCord.length, fontsize.length);




    if (pageColor) {

        let b = startCord.length;
        for (let a = 0; a < b; a++) {

            const x = startCord[a].x; const y = endCord[a].y; let f = fontsize[a];

            if (f == 0) { f = 15; }
            const WIDTH = endCord[a].x - startCord[a].x;
            const yCordFix = 0.25 * f;
            const HEIGHT = ((startCord[a].y - endCord[a].y) > fontsize[a] + yCordFix) ? (startCord[a].y - endCord[a].y) : (fontsize[a] + yCordFix);

            let str = trans[a];






            console.log("height is", HEIGHT);
            page.drawRectangle({ x: x, y: y, width: WIDTH, height: HEIGHT, color: pageColor });

            //     page.drawText(str, { x: x, y: y+1.3*yCordFix, maxWidth: WIDTH, font: font, size: newf });
            //  console.log(ogTextArray[a], "Width is: ", WIDTH, startCord[a], endCord[a]);

        }




        for (let a = 0; a < b; a++) {

            const x = startCord[a].x; const y = endCord[a].y; let f = fontsize[a];

            if (f == 0) { f = 15; }
            const WIDTH = endCord[a].x - startCord[a].x;
            const yCordFix = 0.25 * f;
            const HEIGHT = ((startCord[a].y - endCord[a].y) > fontsize[a] + yCordFix) ? (startCord[a].y - endCord[a].y) : (fontsize[a] + yCordFix);

            const str = trans[a];
            let transWidth;
            let newf = f;


            let flag = true;

            while (flag) {
                transWidth = font.widthOfTextAtSize(str, newf);
                if (transWidth >= WIDTH) {

                    newf = WIDTH / (transWidth + 5) * newf;

                } else {
                    flag = false;
                }
            }





            //  page.drawRectangle({ x: x, y: y, width: WIDTH, height: HEIGHT, color: pageColor });
            if (!str) {

                str = "?";
            }
            page.drawText(str, { x: x, y: y + 1.3 * yCordFix, maxWidth: WIDTH, font: font, size: newf });
            //  console.log(ogTextArray[a], "Width is: ", WIDTH, startCord[a], endCord[a]);

        }









    } else {


        //this is for non-ocr/normal texts
        let b = startCord.length;
        console.log("b length is: ", b);

        for (let a = 0; a < b; a++) {
            try {
                const x = startCord[a].x; const y = startCord[a].y; let f = fontsize[a];
                const WIDTH = (endCord[a].x - x);
                if (WIDTH <= 0) continue;
                const yCordFix = 0.25 * f;

                const str = trans[a];
                if (!str || str == "") continue;

                let transWidth;
                let newf = f;


                let flag = true;

                while (flag) {

                    transWidth = font.widthOfTextAtSize(str, newf);
                    if (transWidth >= WIDTH) {

                        newf = WIDTH / (transWidth + 5) * newf;

                    } else {
                        flag = false;
                    }
                }



                page.drawRectangle({ x: x, y: y - yCordFix, width: WIDTH, height: f, color: rgb(1, 1, 1) });
                page.drawText(str, { x: x, y: y, maxWidth: WIDTH, font: font, size: newf });
                //console.log("loop running" + a);
            } catch (error) {


                console.error(error);
            }
        }


    }


    testDoc.addPage(page);
    const testFile = await testDoc.save();
    await fs.writeFile('./testing/testingPage.pdf', testFile);

    return testFile;

}







async function LLMCall(stringArray, finalLanguage, startCord, type) {
// endCord passed as 'type' intentionally, any non"normal" value routes to OCR branch

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    console.log("The llm function call is working", type);
    const CHUNK_SIZE = 15;
    const chunks = [];
    for (let i = 0; i < stringArray.length; i += CHUNK_SIZE) {
        chunks.push(i);
    }

    let translatedMap = {};


    for (const startIdx of chunks) {
        const chunkArr = [];
        if (type == "normal") {
            //console.log("normal one ran");
            for (let i = startIdx; i < Math.min(startIdx + CHUNK_SIZE, stringArray.length); i++) {
                chunkArr.push({
                    cord: `${startCord[i].x},${startCord[i].y}`,
                    text: stringArray[i]
                });
            }

        } else {

            for (let i = startIdx; i < Math.min(startIdx + CHUNK_SIZE, stringArray.length); i++) {
                chunkArr.push({
                    cord: `${startCord[i].x0},${startCord[i].y0}`,
                    text: stringArray[i]
                });
            }
        }

        // console.log("from llm func, chunkarray", chunkArr);
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite-preview',
            contents: JSON.stringify(chunkArr),
            config: {
                responseMimeType: "application/json",
                systemInstruction: `You are a translation engine integrated into a PDF translation application. Your output is used directly to render translated text onto a PDF page, so structural accuracy is critical — any deviation from the required format will corrupt the output. You will receive a JSON array of objects, each with a "cord" field (coordinate string) and a "text" field (a line of text). These are consecutive lines from a book page. Read ALL lines first before translating any of them, then translate each line as if it were part of a naturally flowing paragraph rather than an isolated sentence. Some lines may end with a hyphen (-) indicating a word broken across lines — treat the hyphenated fragment and the continuation on the next line as one complete word for translation purposes, but still return them as separate elements. Return the EXACT same array with each object having an additional "translation" field containing the translated version of "text" in ${finalLanguage}. Never modify the "cord" or "text" fields. Never add, remove, or reorder any objects in the array. Translate each line exactly as provided without attempting to correct, interpret, or merge any garbled or unclear text.`

            }
        });

        console.log(response.usageMetadata);
        const parsed = JSON.parse(response.text);
        for (const item of parsed) {
            translatedMap[item.cord] = item.translation;
        }
    }

    //console.log(stringArray.length, Object.keys(translatedMap).length);
    return translatedMap;
}






////////////////////////////
async function Translate(name, side, pgnum, pat, ogLanguage, finaLanguage, service) {

    const bookPath = path.join('./books', pat);

    const Boffer = await fs.readFile(bookPath);

    const bookBuffer = new Uint8Array(Boffer);
    const copyBuffer = new Uint8Array(Boffer);

    const pdf = await pdfjsLib.getDocument(bookBuffer).promise;
    const pageFind = await pdf.getPage(pgnum);

    // now that we have page, its time to extract the coordinates and text, maybe first i should try to print some of the text
    const textContent = await pageFind.getTextContent();
    console.log("Step 1: textcontent check? ", textContent.items.length);

    // console.log("Page content?", textContent);
    let newPage;


    if (textContent.items.length == 0) {

        let { cleanParas: trans, pageColor, fontsizeArr: fontsize, dimsOCR } = await processOCRText(name, side, pgnum, pat, ogLanguage, finaLanguage);
        //console.log(trans);
        let stringArray = trans.map((e, i) => e.line);
        let lang1 = ogLanguage.toLowerCase().substring(0, 2);
        let lang2 = finaLanguage.toLowerCase().substring(0, 2);
        let startCord = trans.map((e) => e.startCords);
        let endCord = trans.map((e) => e.endCords);

        let response;
        //console.log("this is the stringarray: ", stringArray);
        //    console.log(" logged from translate function: ", stringArray, startCord, endCord);

        console.log(service);



        if (service == "LLM(AI)") {

            const llmResponse = await LLMCall(stringArray, finaLanguage, startCord, endCord);
            trans = startCord.map(c => llmResponse[`${c.x0},${c.y0}`]);
            //    console.log(stringArray, trans);
            console.log(stringArray.length, trans.length);





        } else {
            if (ogLanguage == 'Auto-detect') {

                response = await translate(stringArray, { autoCorrect: true, to: lang2 });

            } else {

                response = await translate(stringArray, { autoCorrect: true, from: lang1, to: lang2 });

            }


            trans = response.map((e, i) => e.text);
        }


        const pack = { ogTextArray: stringArray, trans, startCord, endCord, fontsize };

        //console.log(pack);





        newPage = await pdfPageMaker(copyBuffer, pgnum, lang2, pack, pageColor, dimsOCR);

        await pdf.destroy();

        return newPage;

    } else {


        const lines = await processNormText(name, side, pgnum, pat, ogLanguage, finaLanguage, textContent);
        let ogTextArray = lines.page;
        let startCord = lines.startCord;
        let endCord = lines.endCord;
        let fontsize = lines.fontSize;

        let lang1 = ogLanguage.toLowerCase().substring(0, 2);
        let lang2 = finaLanguage.toLowerCase().substring(0, 2);
        let response;
        let trans = "";


        if (service == "LLM(AI)") {

            const type = "normal";

            const llmResponse = await LLMCall(ogTextArray, finaLanguage, startCord, type);
            trans = startCord.map(c => llmResponse[`${c.x},${c.y}`]);
            // console.log(ogTextArray, trans);
            //  console.log(ogTextArray.length, trans.length);





        } else {
            if (ogLanguage == 'Auto-detect') {

                response = await translate(ogTextArray, { to: lang2, autoCorrect: true });

            } else {

                response = await translate(ogTextArray, { from: lang1, to: lang2, autoCorrect: true });

            }

            trans = response.map((e, i) => e.text);
        }

        const oldpack = { ogTextArray, trans, startCord, endCord, fontsize };
        console.log(trans);
        newPage = await pdfPageMaker(copyBuffer, pgnum, lang2, oldpack);

        await pdf.destroy();
        return newPage;
    }
}









async function processOCRText(name, side, pgnum, pat, ogLanguage, finaLanguage) {

    const bookPath = path.join('./books', pat);

    const Boffer = await fs.readFile(bookPath);



    // now that we have page, its time to extract the coordinates and text, maybe first i should try to print some of the text



    const doc = await pdftoimg(Boffer, { scale: SCALE });
    const pageImg = await doc.getPage(pgnum);
    let lang;
    let tessWorker;
    let ocrResult;
    let pageColor;

    const metadata = await sharp(pageImg).metadata();
    const { width, height } = metadata;
    const { data } = await sharp(pageImg).raw().toBuffer({ resolveWithObject: true });
    const dimsOCR = { width, height };


    let x1 = Math.ceil(0.05 * (width - 1));
    let x2 = width - x1;
    let x3 = x1;
    let x4 = x2;



    let y1 = Math.ceil(0.05 * (height - 1));
    let y2 = y1;
    let y3 = height - y1;
    let y4 = y3;

    const channels = metadata.channels;

    const index1 = channels * (y1 * width) + channels * x1;
    const index2 = channels * (y2 * width) + channels * x2;
    const index3 = channels * (y3 * width) + channels * x3;
    const index4 = channels * (y4 * width) + channels * x4;

    const RGB1 = { R: data[index1], G: data[index1 + 1], B: data[index1 + 2] };
    const RGB2 = { R: data[index2], G: data[index2 + 1], B: data[index2 + 2] };
    const RGB3 = { R: data[index3], G: data[index3 + 1], B: data[index3 + 2] };
    const RGB4 = { R: data[index4], G: data[index4 + 1], B: data[index4 + 2] };

    //console.log(metadata);
    //console.log(RGB1, RGB2, RGB3, RGB4);

    const meanR = (RGB1.R + RGB2.R + RGB3.R + RGB4.R) / 4;
    const meanG = (RGB1.G + RGB2.G + RGB3.G + RGB4.G) / 4;
    const meanB = (RGB1.B + RGB2.B + RGB3.B + RGB4.B) / 4;

    // Calculate deviation from mean for each corner
    const dev1 = Math.abs(RGB1.R - meanR) + Math.abs(RGB1.G - meanG) + Math.abs(RGB1.B - meanB);
    const dev2 = Math.abs(RGB2.R - meanR) + Math.abs(RGB2.G - meanG) + Math.abs(RGB2.B - meanB);
    const dev3 = Math.abs(RGB3.R - meanR) + Math.abs(RGB3.G - meanG) + Math.abs(RGB3.B - meanB);
    const dev4 = Math.abs(RGB4.R - meanR) + Math.abs(RGB4.G - meanG) + Math.abs(RGB4.B - meanB);

    // Find maximum deviation (the outlier)
    const maxDev = Math.max(dev1, dev2, dev3, dev4);

    // Sum RGB values, excluding the outlier
    let totalR = 0, totalG = 0, totalB = 0, count = 0;

    if (dev1 !== maxDev) { totalR += RGB1.R; totalG += RGB1.G; totalB += RGB1.B; count++; }
    if (dev2 !== maxDev) { totalR += RGB2.R; totalG += RGB2.G; totalB += RGB2.B; count++; }
    if (dev3 !== maxDev) { totalR += RGB3.R; totalG += RGB3.G; totalB += RGB3.B; count++; }
    if (dev4 !== maxDev) { totalR += RGB4.R; totalG += RGB4.G; totalB += RGB4.B; count++; }

    // Calculate new mean and normalize
    const avgR = (totalR / count) / 255;
    const avgG = (totalG / count) / 255;
    const avgB = (totalB / count) / 255;

    pageColor = rgb(avgR, avgG, avgB);




    // lang = ((ogLanguage == "Auto-detect") ? (await Tesseract.detect(pageImg)).data.script : ogLanguage).toLowerCase().substring(0, 3);
    const scriptMap = {
        latin: 'eng', cyrillic: 'rus', devanagari: 'hin', arabic: 'ara',
        gurmukhi: 'pan', han: 'chi_sim', japanese: 'jpn', korean: 'kor',
        greek: 'ell', hebrew: 'heb', thai: 'tha', bengali: 'ben'
    };

    if (ogLanguage == "Auto-detect") {
        const detected = ((await Tesseract.detect(pageImg)).data.script || '').toLowerCase();
        lang = scriptMap[detected] || 'eng';
    } else {
        lang = ogLanguage.toLowerCase().substring(0, 3);
    }



    tessWorker = await Tesseract.createWorker(googleToTesseract[lang], 1, {
        errorHandler: (error) => {
            console.error('Tesseract worker error:', error);
        }
    });



    console.log(lang);

    ocrResult = await tessWorker.recognize(pageImg, {}, { blocks: true, text: true });
    // console.log(ocrResult.data.blocks[0].paragraphs[0].lines);

    const paras = ocrResult.data.blocks[0].paragraphs;

    const cleanParas = [];
    let cleans = {};
    let fontsizeArr = [];
    for (const e of paras) {
        cleans = paraCleaner(e.lines);
        cleanParas.push(...(cleans.cleanParas));
        fontsizeArr.push(...(cleans.fontsizeArr));




        //  cleanParas.push(packed);

    }
    //console.log(cleanParas);


    // console.log(cleanParas, "Font Sizes are: ", fontsizeArr);
    // console.log(cleanParas.length, fontsizeArr.length);

    await tessWorker.terminate();



    //  console.log(cleanParas);
    return { cleanParas, pageColor, fontsizeArr, dimsOCR };
}

function paraCleaner(uglyParalines) {



    let emptyLines = 0;
    const allParaLines = [];
    let startCords = 0;
    let endCords = 0;
    let curline = "";
    let firstLine = true;
    let fontsize = 0;
    let fontsizeArr = [];



    //    console.log("Ugly para var is:", uglyParalines, "The parentPara var is:", parentPara);
    for (const line of uglyParalines) {
        // console.log(line.text, line.confidence,'\n');
        if (line.confidence > 45 && line.text.length > 5) {
            allParaLines.push({
                startCords: { x0: line.bbox.x0, y0: line.bbox.y0 }, endCords: {
                    x1: line.bbox.x1,
                    y1: (line.baseline.y1 > line.baseline.y0) ? (line.baseline.y1 + line.rowAttributes.descenders) : (line.baseline.y0 + line.rowAttributes.descenders)
                },
                line: line.text
            });
            fontsizeArr.push(line.rowAttributes.rowHeight - line.rowAttributes.descenders);


        }
    }


    // console.log(allParaLines, "Font sizes are: ",fontsizeArr);
    // console.log(allParaLines.length, fontsizeArr.length);




    return { cleanParas: allParaLines, fontsizeArr };



}
/* const reseter = (empties) => {


     if (empties >= 2) {
         endCords = { x1: maxX, y1: maxY };
       //  endCords = { x1: curline.bbox.x1, y1: curline.bbox.y1 };
         const pack = { startCords, endCords, cleanPara };
         console.log("rhis ran", startCords, endCords);
         cleanParas.push(pack);
         emptyLines = 0;
         startCords = 0;
         cleanPara = "";
         firstLine = true;
         fontsizeArr.push(fontsize);
         fontsize = 999999;

         minX = Infinity;
         maxX = -Infinity;
         minY = Infinity;
         maxY = -Infinity;


     }

 }


 for (const e of uglyPara) {

     minX = Math.min(minX, e.bbox.x0);
     maxX = Math.max(maxX, e.bbox.x1);
     minY = Math.min(minY, e.bbox.y0);
     maxY = Math.max(maxY, e.bbox.y1);


     const curCord = JSON.stringify(e.bbox);
     const confidence = e.confidence;
     let text = e.text;
     fontsize =Math.min(fontsize, Math.abs(e.bbox.y1 - e.bbox.y0));

     curline = e;
     if (firstLine) {

         // startCords = { x0: e.bbox.x0, y0: e.bbox.y0 };
         startCords = { x0: minX, y0: minY }; 
         firstLine = false;
     }

     reseter(emptyLines);

     if (confidence > 45 && (curCord != lastCord)) {


         if (lastCord != 0 && ((JSON.parse(lastCord)).x0 > (JSON.parse(curCord).x0) + 15)) {
             reseter(5);
             minX = e.bbox.x0;
             maxX = e.bbox.x1;
             minY = e.bbox.y0;
             maxY = e.bbox.y1;
             startCords = { x0: minX, y0: minY };
             firstLine = false;
         }
         cleanPara = cleanPara + text;
         lastCord = curCord;
     } else {
         if (confidence <= 45 && curCord != lastCord) {



             text = '\n';
             cleanPara = cleanPara + text;
             lastCord = curCord;


         }


     }

     if (text == '\n') { emptyLines++; } else { emptyLines = 0; }




 }

 startCords = { x0: minX, y0: minY };
 endCords = { x1: maxX, y1: maxY };

//  endCords = { x1: curline.bbox.x1, y1: curline.bbox.y1 };
 console.log("rhis ran", startCords, endCords);
 const pack = { startCords, endCords, cleanPara };
 cleanParas.push(pack);
 fontsizeArr.push(fontsize);
 
 }*/











async function processNormText(bookName, pageSide, pageNumber, fullPath, oglanguage, finaLanguage, textContent) {


    const text = textContent.items;

    // console.log(text.slice(5));
    //console.log(text);
    function lineMaker() {
        let line = "";
        let page = [];
        let firstWord = true;

        let startCord = [];
        let endCord = []
        let transform;
        let fontSize = [];

        let height
        let width;
        let totalwidth = 0;
        let tempStartCords = 0;
        let word;
        let prevheight = -1;
        let lastword;

        for (word of text) {

            width = word.width;
            totalwidth = width + totalwidth;
            transform = word.transform;
            height = transform[3];
            //  line = line + word.str;


            if (firstWord == false && height < prevheight && line != '') {
                // console.log('Height drop pushing:', line, 'at word:', word.str);
                endCord.push({ x: lastword.transform[4] + lastword.width, y: lastword.transform[5] });
                fontSize.push(lastword.transform[3]);
                page.push(line);
                line = '';
                firstWord = true;
                totalwidth = 0;




            } else {
                if ((firstWord == false && lastword && Math.abs(transform[5] - lastword.transform[5]) > 2)) {

                    endCord.push({ x: lastword.transform[4] + lastword.width, y: lastword.transform[5] });
                    fontSize.push(lastword.transform[3]);
                    page.push(line);
                    line = '';
                    firstWord = true;
                    totalwidth = 0;
                }
            }


            line = line + word.str;
            if (firstWord) {
                //    console.log('Pushing startCord for word:', word.str);
                startCord.push({ x: transform[4], y: transform[5] });
                tempStartCords = { x: transform[4], y: transform[5] };
                // endCord.push({ x: transform[4] + width, y: transform[5] });
                //fontSize.push(height);
                firstWord = false;

            }


            if (word.hasEOL == true) {
                //    console.log('hasEOL pushing:', line, 'at word:', word.str);
                endCord.push({ x: transform[4] + width, y: transform[5] });
                fontSize.push(height);
                page.push(line);
                line = '';
                firstWord = true;
                totalwidth = 0;




            }


            prevheight = height;
            lastword = word;
        }


        if (word.hasEOL == false && line !== '') {
            endCord.push({ x: transform[4] + width, y: transform[5] });
            fontSize.push(height);
            page.push(line);


        }

        ({ page, startCord, endCord, fontSize } = emptyLineRemover(page, startCord, endCord, fontSize));


        return { page, startCord, endCord, fontSize };
    }


    const pageText = lineMaker();
    // console.log("consoled from pronormtext",pageText.page, pageText.startCord, pageText.endCord, pageText.fontSize);
    //console.log(pageText.page.length, pageText.startCord.length, pageText.endCord.length, pageText.fontSize.length);

    return pageText;


}

function emptyLineRemover(page, startCord, endCord, fontSize) {

    let emptyIdx = [];
    page.map((e, i) => {

        if (e == '') {
            emptyIdx.push(i);
        }

    });

    emptyIdx.reverse().map((e, i) => {

        page.splice(e, 1);
        startCord.splice(e, 1);
        endCord.splice(e, 1);
        fontSize.splice(e, 1);

    });


    return { page, startCord, endCord, fontSize };

}

transRoute.post('/:bookPath', async (req, res) => {
    try {
        const bookName = req.params.bookPath;
        const info = req.body;
        const pageSide = info.name;
        const pageNumber = info.others.currentPage;
        const fullPath = info.others.pat;
        const service = info.serviceChoice;

        const oglanguage = req.body.ogLanguage;
        const finaLanguage = req.body.languageChoice;

        const Translated = await Translate(bookName, pageSide, pageNumber, fullPath, oglanguage, finaLanguage, service);

        // console.log(translated);

        res.type('pdf');
        res.send(Translated);


        res.end();
    } catch {
        
        console.error("Translation failed:", error);
        res.status(500).json({ error: "Translation failed" });


    }
})