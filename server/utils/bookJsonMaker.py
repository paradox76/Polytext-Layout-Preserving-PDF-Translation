import os
import json
import re
from langdetect import detect
from PyPDF2 import PdfReader
from pdf2image import convert_from_path

folder_path = "../books"
files = os.listdir(folder_path)

pdfs = []
bookID = 0

def jsonUnitCreator(ff, id,path, lang, auth, thumb):
    
    dic = {
        "id" : id,
        "title" : ff,
        "path" : path,
        "language": lang,
        "author": auth,
        "thumbnail": thumb


           }
    print("book dict is: ", dic)
    return dic


def extractLangAuth(book, path):
    try:
            reader = PdfReader(path)
            metadat = reader.metadata
            language =""
            author = ""
            if hasattr(metadat, "language"):
                 language =  metadat.language
            if(not language):
                totalPages = len(reader.pages)
                middleP = reader.pages[totalPages//2]
                strings = middleP.extract_text()
            
                if strings:
                    language = detect(strings)
            if hasattr(metadat, "author"):
                 author = metadat.author
            return language, author
     
    except Exception as e:
         print(f"Error from file, unable to detect: {book} : {e} " )
         return ""


def thumber(file, folder):
     thumbfolder = os.path.join(folder, "thumbnail")
     pic = convert_from_path(file, first_page=1, last_page=1, poppler_path=r"Release-24.08.0-0\poppler-24.08.0\Library\bin")
     picPath = os.path.join(thumbfolder,os.path.splitext((os.path.split(file)[-1]))[0]+".png").replace("\\","/")
     pic[0].save(picPath, "PNG")
     return picPath 


for f in files:
    if ".pdf" in f.lower():
        cleanf = (re.sub(r'[^a-zA-Z0-9()]',' ',f[0:-4])).title()
        path = os.path.join(folder_path, f).replace("\\","/" )
        langAuth = extractLangAuth(f, path)
        language = langAuth[0]
        author = langAuth[1]
        thumbnail = thumber(path, folder_path)


        """below is json creation above is all the key value creation essentially"""
        pdf = jsonUnitCreator(cleanf,bookID, path, language, author, thumbnail)
        pdfs.append(pdf)
        bookID += 1


with open("allBooks.json", "w", encoding="utf-8") as qvason:
     json.dump(pdfs,qvason, indent=4, ensure_ascii=False )
     


