const fs = require('fs');

function readDir(folder: String){
    fs.readdir(folder, (error, files: String[]) => {
        if (error){
            return error;
        } else {
            return files;
        }
    });
}



export {}