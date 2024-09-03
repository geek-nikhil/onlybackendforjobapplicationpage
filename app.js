const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.use(express.json());
const cors = require("cors");
app.use(cors());
app.use("/files", express.static("files"));
require('dotenv').config();

//mongodb connection----------------------------------------------
const mongoUrl = "mongodb+srv://Nikhil:nikhil@cluster0.tgufu.mongodb.net/pdf";

mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to database");
  })
  .catch((e) => console.log(e));
//multer------------------------------------------------------------
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

require("./pdfDetails");
const PdfSchema = mongoose.model("PdfDetails");
const upload = multer({ storage: storage });

app.post("/upload-files", upload.single("file"), async (req, res) => {
  console.log(req.file);                                            
  const title = req.body.title;
  const fileName = req.file.filename;
  const name  = req.body.name;
  const email  = req.body.email;
  try {
    await PdfSchema.create({ title: title, pdf: fileName , name : name, email : email });
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});
app.get("/get-files/:Name/:Email", async (req, res) => {
  const { Name, Email } = req.params;
  console.log(`Fetching files for Name: ${Name}, Email: ${Email}`);
  
  try {
    // Fetch documents from PdfSchema collection matching Name and Email
    const files = await PdfSchema.find({ name: Name, email: Email });
    console.log('Files found:', files); // Log the result
    if (files.length > 0) {
      res.send({ status: "ok", data: files });
    } else {
      res.send({ status: "ok", data: [] }); // No matching files
    }
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ status: "error", message: "Failed to fetch files" });
  }
});

app.get("/all", async (req, res) => {
  try {
    const data = await PdfSchema.find(); // Fetch all documents from the collection
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
//apis----------------------------------------------------------------
app.get("/", async (req, res) => {
  res.send("Success!!!!!!");
});

app.listen(5000, () => {
  console.log("Server Started");
});