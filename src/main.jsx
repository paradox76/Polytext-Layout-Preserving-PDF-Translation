import APP from './App'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { StrictMode, useEffect, useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import "../style.css";
import { PDFDocument } from 'pdf-lib';

/////////////////////////
createRoot(document.getElementById('root')).render(

    <StrictMode>
        <APP>
            
        </APP>

    </StrictMode>

)