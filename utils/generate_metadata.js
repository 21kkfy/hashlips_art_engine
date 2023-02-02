const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const basePath = process.cwd();
const buildDir = `${basePath}/build/json`;
const inputDir = `${basePath}/build/images`;
const {
  format,
  namePrefix,
  description,
  baseUri,
} = require(`${basePath}/src/config.js`);
const console = require("console");
const canvas = createCanvas(format.width, format.height);
const ctx = canvas.getContext("2d");
const metadataList = [];

const buildSetup = () => {
  if (fs.existsSync(buildDir)) {
    fs.rmdirSync(buildDir, { recursive: true });
  }
  fs.mkdirSync(buildDir);
};

const getImages = (_dir) => {
  try {
    return fs
      .readdirSync(_dir)
      .filter((item) => {
        let extension = path.extname(`${_dir}${item}`);
        if (extension == ".png" || extension == ".jpg") {
          return item;
        }
      })
      .map((i) => {
        return {
          filename: i,
          path: `${_dir}/${i}`,
        };
      });
  } catch {
    return null;
  }
};

const loadImgData = async (_imgObject) => {
  try {
    const image = await loadImage(`${_imgObject.path}`);
    return {
      imgObject: _imgObject,
      loadedImage: image,
    };
  } catch (error) {
    console.error("Error loading image:", error);
  }
};

const draw = (_imgObject) => {
  let w = canvas.width;
  let h = canvas.height;
  ctx.drawImage(_imgObject.loadedImage, 0, 0, w, h);
};



randomIntFromInterval = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

isNeighborColor = (color1, color2, tolerance) => {
  return (
    Math.abs(color1.r - color2.r) <= tolerance &&
    Math.abs(color1.g - color2.g) <= tolerance &&
    Math.abs(color1.b - color2.b) <= tolerance
  );
};

const saveMetadata = (_loadedImageObject) => {
  let shortName = _loadedImageObject.imgObject.filename.replace(
    /\.[^/.]+$/,
    ""
  );

  let tempAttributes = [];

  let tempMetadata = {
    name: `FACELESS HOVERBOARD NFT`,
    description: "FACELESS HOVERBOARD NFT\n(RARITIES, CHARACTERISTICS, TRAITS, PROPERTIES)\n\n\nExplore the Metaverse like never before with this 1 of 1 hoverboard NFTs that seamlessly integrate with popular Metaverse platforms.\n\n\nEach Hoverboard carries its avatars' signature texture as provenance.\n\n\nFeatures:\nFully rigged, game ready hoverboards\nLED lights for added style and visibility\n\n\nAttributes - Faceless Texture # 669\nRarity - 1%\n\n\nQUANTITY - 208 HOVERBOARD NFTS",
    image: `${baseUri}/${shortName}.png`,
    edition: Number(shortName),
    attributes: tempAttributes,
    compiler: "HashLips Art Engine",
  };

  const addRarity = () => {
    let w = canvas.width;
    let h = canvas.height;
    let i = -4;
    let count = 0;
    let imgdata = ctx.getImageData(0, 0, w, h);
    let rgb = imgdata.data;
    let newRgb = { r: 0, g: 0, b: 0 };
    const tolerance = 15;
    const rareColorBase = "NOT a Hot Dog";
    const rareColor = [
      { name: "Hot Dog", rgb: { r: 192, g: 158, b: 131 } },
      { name: "Hot Dog", rgb: { r: 128, g: 134, b: 90 } },
      { name: "Hot Dog", rgb: { r: 113, g: 65, b: 179 } },
      { name: "Hot Dog", rgb: { r: 162, g: 108, b: 67 } },
    ];

    while ((i += 10 * 4) < rgb.length) {
      ++count;
      newRgb.r += rgb[i];
      newRgb.g += rgb[i + 1];
      newRgb.b += rgb[i + 2];
    }

    newRgb.r = ~~(newRgb.r / count);
    newRgb.g = ~~(newRgb.g / count);
    newRgb.b = ~~(newRgb.b / count);

    let rarity = rareColorBase;

    rareColor.forEach((color) => {
      if (isNeighborColor(newRgb, color.rgb, tolerance)) {
        rarity = color.name;
      }
    });

    console.log(newRgb);
    console.log(rarity);
    return [
      {
        trait_type: "Faceless Texture",
        value: `# ${tempMetadata.edition}`,
      },
      {
        trait_type: "Rarity",
        value: `1%`,
      },
      {
        trait_type: "QUANTITY",
        value: "208 HOVERBOARD NFTS",
      },
    ];
  };
  tempAttributes.push(addRarity());

  fs.writeFileSync(
    `${buildDir}/${shortName}.json`,
    JSON.stringify(tempMetadata, null, 2)
  );
  metadataList.push(tempMetadata);
};

const writeMetaData = (_data) => {
  fs.writeFileSync(`${buildDir}/_metadata.json`, _data);
};

const startCreating = async () => {
  const images = getImages(inputDir);
  if (images == null) {
    console.log("Please generate collection first.");
    return;
  }
  let loadedImageObjects = [];
  images.forEach((imgObject) => {
    loadedImageObjects.push(loadImgData(imgObject));
  });
  await Promise.all(loadedImageObjects).then((loadedImageObjectArray) => {
    loadedImageObjectArray.forEach((loadedImageObject) => {
      draw(loadedImageObject);
      saveMetadata(loadedImageObject);
      console.log(
        `Created metadata for image: ${loadedImageObject.imgObject.filename}`
      );
    });
  });
  writeMetaData(JSON.stringify(metadataList, null, 2));
};

buildSetup();
startCreating();
