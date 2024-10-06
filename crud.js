const express = require("express");
const app = express();
const fs = require("fs");
app.use(express.json());





function readDataFromFile(callback) {
    fs.readFile("data.json", "utf-8", (err, data) => {
        if (err) {
            console.log(err);
        }
        callback(JSON.parse(data));
    });
}


function writeDataToFile(data, callback) {
    fs.writeFile("data.json", JSON.stringify(data, null, 2), "utf-8", (err) => {
        callback(err);
    });
}


function readIdFromFile(callback) {
    fs.readFile("auto_id.json", "utf-8", (err, data) => {
        if (err) {
            console.log(err);
        }
        callback(JSON.parse(data));
    });
}


function writeIdToFile(lastId, callback) {
    fs.writeFile("auto_id.json", JSON.stringify({ lastId }, null, 2), "utf-8", (err) => {
        callback(err);
    });
}




app.get("/api/posts", (req, res) => {
    readDataFromFile((data) => {   
        res.send({ data: data });
    });
});


app.post("/api/posts", (req, res) => {

    const { title, description, username } = req.body;

    if (!title || !description || !username) {
        return res.send({
            message: "Please enter title, description and username",
        });
    }

    readIdFromFile((idData) => {
        let lastId = idData.lastId;

        readDataFromFile((dataReadFromFile) => {
           
            let data = req.body;


            let currentDate = new Date()
                .toLocaleString("en-CA", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                })
                .replace(",", "");

            let newId = lastId + 1;


            let newData = { id: newId, ...data, date: currentDate };


            dataReadFromFile.push(newData);


            writeDataToFile(dataReadFromFile, () => {
             
                writeIdToFile(newId, () => {

                    res.send({ message: "Data saved successfully" });
                });
            });
        });
    });
});


app.put("/api/posts/:id", (req, res) => {
    const id = req.params.id;

    readDataFromFile((dataReadFromFile) => {
    
        const index = dataReadFromFile.findIndex((item) => item.id == id);
        if (index == -1) {
            return res.json({
                message: "post not found",
            });
        }


        const { title, description, username } = req.body;


        title ? dataReadFromFile[index].title = title : dataReadFromFile[index].title
        description ? dataReadFromFile[index].description = description : dataReadFromFile[index].description
        username ? dataReadFromFile[index].username = username : dataReadFromFile[index].username


        writeDataToFile(dataReadFromFile, () => {
            res.send({ message: "Data updated successfully" });
        });
    });
});



app.delete("/api/posts/:id", (req, res) => {
    const id = req.params.id;

    readDataFromFile((dataReadFromFile) => {
       
        const index = dataReadFromFile.findIndex((item) => item.id == id);


        if (index == -1) {
            return res.send({
                message: "item not found !",
            });
        }

        const data = dataReadFromFile.filter((item) => item.id != id);


        writeDataToFile(data, () => {

            res.send({ message: "Data deleted successfully" });
        });
    });
});

app.listen(3000, () => {
    console.log(`Server running at http://localhost:3000`);
});