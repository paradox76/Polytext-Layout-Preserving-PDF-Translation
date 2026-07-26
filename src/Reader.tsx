import { useParams } from "react-router-dom";
import HTMLFlipBook from "react-pageflip";
import * as pdfjsLib from 'pdfjs-dist';
import { useEffect, useRef, useState } from "react";
import 'pdfjs-dist/web/pdf_viewer.css';

import TranslateButton from "./TranslateButton";


//  let flipbookIndexonFlip=0;
function Reader() {
    console.log("Reader component rendering");

    try {
        const { pat } = useParams();

        const [canvases, setCanvases] = useState<any>([]);
        const [loading, setLoading] = useState(true);
        const [currentPage, setCurrentPage] = useState(1);
        const [pageCache, setPageCache] = useState<any>({});
        const [currentBook, setCurrentBook] = useState<any>(null);
        const [transPage, setTransPage] = useState<any>({ transVisible: false });

        const viewport = useRef<any>();
        const ogHeldCanvas = useRef<any>();



        const EDGE = 4;

        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
            'pdfjs-dist/build/pdf.worker.mjs',
            import.meta.url
        ).toString();

        useEffect(
            () => {
                console.log("load page useffect ran..");
                loadPDF(currentPage);



            }

            , [currentBook, currentPage]);

        useEffect(() => {

            if (transPage.transVisible) {
                console.log("visible? ", transPage.transVisible, viewport.current);
                replacePage();



            }
        }, [transPage]);




            useEffect(() => {
                return () => {
                    if (currentBook) {
                        currentBook.destroy();
                    }
                };
            }, [currentBook]); // Cleanup when currentBook changes or unmounts






     


        const loadPDF = async (crntPage: any) => {

            try {

                if (currentBook == null) {

                    const pdf = await pdfjsLib.getDocument(`http://localhost:3001/books/${pat}`).promise;

                    setCurrentBook(pdf);

                    return;
                }

                const startPage = Math.max(1, crntPage - EDGE);
                const endPage = Math.min(currentBook.numPages, crntPage + EDGE);

                const pageCanvases = [];
                let cache = [];

                // let fpPageIndex =0; //useless just for debugging during previous implementation
                for (let pageNum = startPage; pageNum <= endPage; pageNum++) {


                    if (pageCache[pageNum]) {

                        pageCanvases[pageNum] = { canvas: pageCache[pageNum], pageNum };
                        cache[pageNum] = pageCache[pageNum];


                    } else {

                        const page = await currentBook.getPage(pageNum);


                        const canvas = document.createElement('canvas');

                        viewport.current = page.getViewport({ scale: 1.5 });
                        canvas.height = viewport.current.height;
                        canvas.width = viewport.current.width;

                        await page.render({ canvas: canvas, viewport: viewport.current }).promise;
                        page.cleanup();
                        cache[pageNum] = canvas;

                        pageCanvases[pageNum] = { canvas, pageNum };

                    }


                }
                if (cache.length != 0) { setPageCache(() => ({ ...cache })); }

                setCanvases(pageCanvases);




                setLoading(false);

            } catch (error) {
                console.error('Error loading PDF:', error);
                setLoading(false);
            }
        };

        async function replacePage() {
            try {

                console.log("Buffer recieved is: ", transPage.translatedBuffer);
                const bufferCopy = transPage.translatedBuffer.slice(0);
                const trans1 = pdfjsLib.getDocument(bufferCopy);

                let tempPage = await (await trans1.promise).getPage(1);
                const transCanvas = document.createElement("canvas");
                transCanvas.width = viewport.current.width;
                transCanvas.height = viewport.current.height;
                console.log("width is :", transCanvas.width);
                await tempPage.render({ canvas: transCanvas, viewport: viewport.current }).promise;
                tempPage.cleanup();

                if (transPage.side == "left") {
                    ogHeldCanvas.current = canvases[currentPage + 1];
                    canvases[currentPage + 1] = { canvas: transCanvas, pageNum: canvases[currentPage + 1].pageNum, temp: true };
                    const tempCan = [...canvases];

                    console.log(transCanvas.baseURI);

                    setCanvases(tempCan);
                    console.log("from replacepage",canvases);

                }
                else { 
                    ogHeldCanvas.current = canvases[currentPage];
                    canvases[currentPage] = { canvas: transCanvas, pageNum: canvases[currentPage].pageNum };
                    const tempCan = [...canvases];
                    setCanvases(tempCan);


                }
                trans1.destroy();




            }
            catch (e) {

                console.error("Error in trans pager: ", e);

            }
        }






        if (loading) {
            return <div>Loading PDF...</div>;
        }


        //  console.log("Number of pages:", canvases.length);
        // console.log("Pages array:", canvases, "Current page is : ", currentPage);
        console.log("Current page is : ", currentPage);
        //  console.log("Cache array is: ",pageCache);



        return (
            <>
                <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '10px', right: '51%', zIndex: 100, opacity: 0.7 }}>
                        <TranslateButton name="left" others={{ currentPage, pat }} setTrans={setTransPage} ></TranslateButton></div>

                    <div style={{ position: 'absolute', top: '10px', left: '51%', zIndex: 100, opacity: 0.7 }}>
                        <TranslateButton name="right" setTrans={setTransPage} others={{ currentPage: ((currentPage == 1) ? currentPage : currentPage + 1), pat }} >
                        </TranslateButton></div>

                    <HTMLFlipBook
                        //pageNum ={currentPage['pdfPage']-1}
                        startPage={0}

                        // ref={flipbookRef}
                        width={(viewport.current) ? (viewport.current.width) : (60)}
                        height={(viewport.current) ? (viewport.current.height) : 80}
                        maxWidth={'100%'}

                        onFlip={(e: any) => {
                            //   console.log("Page flipped to:", e.data,"to Real pdf page: ",canvases[e.data].pageNum);
                            //   console.log(e);
                            //  flipbookIndexonFlip =e.data;
                            setCurrentPage(e.data + 1);
                        }}


                        {...({


                            size: "fixed",
                            minWidth: 315,
                            maxWidth: 1000,
                            minHeight: 420,
                            maxHeight: 1350,
                            maxShadowOpacity: 0.5,
                            showCover: true,
                            mobileScrollSupport: false,
                            style: {},
                            className: "",


                            drawShadow: true,
                            flippingTime: 1000,
                            usePortrait: true,
                            startZIndex: 0,
                            autoSize: false,
                            maxPageTextureSize: 0,
                            showPageCorners: true,
                            disableFlipByClick: true,





                        } as any)}


                    >

                        {[...(Array(currentBook.numPages))].map((element, index: any) => (

                            <div key={index}>
                              
                                {(index < currentPage + EDGE && index > currentPage - EDGE && (canvases[index + 1]))
                                    ? (<CanvasPage canvas={canvases[index + 1].canvas} />) : (<div>Loading...</div>)}
                        
                            </div>
                        ))}


                    </HTMLFlipBook>
                </div>
            </>
        );
    }
    catch (e) {

        console.error('Error in reader:', e);


    }
}





const CanvasPage = ({ canvas }: { canvas: HTMLCanvasElement }) => {
    try {
        const divRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            if (divRef.current && canvas) {
                divRef.current.innerHTML = ''; // Clear first
                canvas.style.width = '100%';   // Make canvas responsive to flipbook page size
                canvas.style.height = '100%';
                canvas.style.objectFit = 'contain'; // Maintain aspect ratio
                canvas.style.border = '1px solid #ddd';
                canvas.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.1)';
                canvas.style.borderRadius = '2px';

                divRef.current.appendChild(canvas);
            }


        }, [canvas]);

        return <div ref={divRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}></div>;

    } catch (e) {

        console.log("Error in canavs component maker", e);
    }

};


export default Reader;