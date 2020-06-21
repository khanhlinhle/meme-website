var express = require('express');
var Jimp = require('jimp');
var router = express.Router();
const upload = require("../utils/upload");
const { loadOriginals, saveOriginals, loadMemes, saveMemes } = require("../utils/data");

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/originals', function (req, res, next) {
  try {
    const originals = loadOriginals()
    res.render("original", { images: originals, imagePath: "images/originals/" })
  } catch (err) {
    res.render("index", { error: err.message })
  }
});

router.get('/meme', function (req, res, next) {
  try {
    const memes = loadMemes()
    res.render("meme", { images: memes, imagePath: "images/memes/" })
  } catch (err) {
    res.render("index", { error: err.message })
  }
});

router.post("/upload", function (req, res, next) {
  upload(req, res, function (err) {
    if (err) {
      return res.render("index", { error: err.message });
    }
    if (!req.file) {
      return res.render("index", { error: "Cannot upload" });
    }
    console.log(req.file);
    const originals = loadOriginals();
    originals.push({ filename: req.file.filename });
    // if( data.filter(elm => elm.filesize === req.file.filesize).length > 0 || data.filter(elm => elm.originalname === req.file.originalname).length > 0) { //render error}
    saveOriginals(originals);
    res.render("original", {
      images: originals,
      path: "/images/originals/"
    });
  })
});

router.post("/addtext/:id", async (req, res) => {
  try {

    if (!req.body.top && !req.body.bottom) {
      return res.render("index", { error: "need to put text" });
    }

    const data = loadOriginals();
    const file = data.find((item) => item.filename === req.params.id);
    if (!file) {
      console.log("no file", req.params.id);
      return;
    }

    const filePath = `images/originals/${req.params.id}`;
    const image = await Jimp.read(`public/${filePath}`); // get original image
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK); // set the font

    console.log("69  ", req.body.top);
    console.log("70  ",req.body.bottom);

    if (req.body.top) {
      image.print(
        font,
        10,
        10,
        req.body.top
      );
    }

    if (req.body.bottom) {
      image.print(
        font,
        10,
        10,
        req.body.bottom
        // {
        //   text: req.body.bottom,
        //   alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        //   alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM,
        // },
        // dimension.width,
        // dimension.height
      );
    }

    const newMeme = Date.now().toString() + file.filename; 
    await image.writeAsync(`public/images/memes/${newMeme}`); // save the image with text 
    
    const memes = loadMemes();
    memes.push({ filename: newMeme });
    saveMemes(memes);

    return res.redirect("/meme"); // this path can be changed depends on your code
  } catch (err) {
    res.render("index", { error: err.message })
  }
});

// router.post("/meme", function (req, res, next) {
//   upload(req, res, function (err) {
//     if (err) {
//       return res.render("index", { error: err.message });
//     }
//     if (!req.file) {
//       return res.render("index", { error: "Cannot upload" });
//     }
//     console.log(req.file);
//     const memes = loadMemes();
//     memes.push({ filename: req.file.filename });
//     saveMemes(originals);
//     res.render("meme", {
//       images: memes,
//       path: "/images/memes/"
//     });
//   })
// });

module.exports = router;
