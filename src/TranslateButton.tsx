


function TranslateButton({ name, others, setTrans }) {
    let translatedBuffer: ArrayBuffer;
    const transReqtoBack = ()=>{

        
        const serviceChoice = (document.getElementById("trans"+name) as HTMLSelectElement).value;
        const languageChoice =(document.getElementById("lang"+name) as HTMLSelectElement).value;
        const ogLanguage = (document.getElementById("from"+name) as HTMLSelectElement).value;

        console.log(serviceChoice," and ", languageChoice,"\n",name," and others: ",others, ogLanguage);
        
        fetch(`http://localhost:3001/api/translate/${others.pat}`,
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
        <option>LLM(AI)</option>
        </optgroup>
        </select>
        Translate
    <select name="From Language" id ={"from"+name} style={{width: '20px'}} onClick={(e)=>{e.stopPropagation();}} required >
        <optgroup label ="Original Language:">
        <option>Auto-detect</option>
        <option>English</option> 
        <option>Panjabi</option>
        <option>Hindi</option>
        </optgroup>
        </select>    
    <select name="To Language" id ={"lang"+name} style={{width: '20px'}} onClick={(e)=>{e.stopPropagation();}} required >
        <optgroup label ="Language:">
        <option>Clear Translations</option>
        <option>English</option> 
        <option>Panjabi</option>
        <option>Hindi</option>
        </optgroup>
        </select>    
    </button>


</>);

}

export default TranslateButton;