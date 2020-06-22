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
    const font = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE); // set the font

    image.resize(800,800);

    if (req.body.top) {
      image.print(
        font,
        0,
        0,
        {
          text: req.body.top,
          alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
          alignmentY: Jimp.VERTICAL_ALIGN_TOP,
        },
        750,
        600
      );
    }

    if (req.body.bottom) {
      image.print(
        font,
        0,
        0,
        {
          text: req.body.bottom,
          alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
          alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM,
        },
        750,
        800
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
