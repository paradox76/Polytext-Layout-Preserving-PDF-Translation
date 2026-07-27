import APP from './App'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { StrictMode} from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import "../style.css";

import { BrowserRouter } from 'react-router-dom';
/////////////////////////
createRoot(document.getElementById('root')).render(

    <StrictMode>
<BrowserRouter>  
<APP>
            
</APP>
</BrowserRouter>
    </StrictMode>

)