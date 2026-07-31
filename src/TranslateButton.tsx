import { serverAddress } from "./App";

function TranslateButton({ name, others, setTrans }) {
    let translatedBuffer: ArrayBuffer;
    const transReqtoBack = ()=>{

        
        const serviceChoice = (document.getElementById("trans"+name) as HTMLSelectElement).value;
        const languageChoice =(document.getElementById("lang"+name) as HTMLSelectElement).value;
        const ogLanguage = (document.getElementById("from" + name) as HTMLSelectElement).value;
        
        if (languageChoice === "Clear Translations") {
            setTrans({ transVisible: false });
            return;
        }

        console.log(serviceChoice," and ", languageChoice,"\n",name," and others: ",others, ogLanguage);
        
        fetch(serverAddress+`api/translate/${others.pat}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
                ,
                body: JSON.stringify({ name, others, serviceChoice, languageChoice, ogLanguage })


            }

        ).then((value) => {
            
           return (value.arrayBuffer().then((e) => {
               
                translatedBuffer = e;
               
            }));
        }).then(
            () => {
                console.log("buffer is : ", translatedBuffer);
                setTrans({ translatedBuffer, currentPage: others.currentPage, transVisible: true, side: name })
            });


   

    };
    return(<>

        <button onClick={transReqtoBack}> 
            <select name="Translator" id={"trans"+name} style={{width: '20px'}} onClick={(e)=>{e.stopPropagation();}} required>
                <optgroup label = "Service to use:">
                <option>Google</option>
                <option selected>LLM(AI)</option>
                </optgroup>
                </select>
                Translate
                <select name="From Language" id ={"from"+name} style={{width: '20px'}} onClick={(e)=>{e.stopPropagation();}} required defaultValue="auto">
                <optgroup label ="Original Language:">
                <option >Auto-detect</option>
                <option value="en">English</option> 
                <option value="pa">Panjabi</option>
                <option value="hi">Hindi</option>
                <option value="ar">Arabic</option>
                <option value="ur">Urdu</option>
                <option value="mr">Marathi</option>
                <option value="ne">Nepali</option>
                <option value="sa">Sanskrit</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
                <option value="de">German</option>
                <option value="pt">Portuguese</option>
                <option value="it">Italian</option>
                <option value="nl">Dutch</option>
                <option value="pl">Polish</option>
                <option value="sv">Swedish</option>
                <option value="tr">Turkish</option>
                    <option value="ro">Romanian</option>
                    <option value="ru">Russian</option>

                </optgroup>
                </select>    
            <select name="To Language" id ={"lang"+name} style={{width: '20px'}} onClick={(e)=>{e.stopPropagation();}} required defaultValue="pa">
                <optgroup label ="Language:">
                <option >Clear Translations</option>
                <option value="en">English</option>
                <option value="pa">Panjabi</option>
                <option value="hi">Hindi</option>
                <option value="ar">Arabic</option>
                <option value="ur">Urdu</option>
                <option value="mr">Marathi</option>
                <option value="ne">Nepali</option>
                <option value="sa">Sanskrit</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
                <option value="de">German</option>
                <option value="pt">Portuguese</option>
                <option value="it">Italian</option>
                <option value="nl">Dutch</option>
                <option value="pl">Polish</option>
                <option value="sv">Swedish</option>
                <option value="tr">Turkish</option>
                    <option value="ro">Romanian</option>
                    <option value="ru">Russian</option>
                </optgroup>
                </select>
            </button>
        
        
        </>);

}

export default TranslateButton;