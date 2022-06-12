import { promises as fs } from "fs";
import { readSwatchesFile, createSwatchesFile } from "procreate-swatches";
import axios from "axios";

const ALL_PALETTES = ["resurrect-64", "endesga-32"];

const LOSPEC_BASE_URL = `https://lospec.com/palette-list/`;

const getSwatchFile = async (name) => {
  const { data } = await axios.get(`${LOSPEC_BASE_URL}/${name}.json`);
  return data;
};

const swatchToRgb = (colors) => {
  const rgbColors = colors
    .map((color) => color.match(/.{1,2}/g))
    .map((color) => [color.map((part) => parseInt(part, 16)), "rgb"]);
  return rgbColors;
};

(async () => {
  await Promise.all(
    ALL_PALETTES.map(async (current) => {
      const swatch = await getSwatchFile(current);
      const name = swatch.name;
      const colors = swatchToRgb(swatch.colors);

      console.log(colors);

      const swatchesFile = await createSwatchesFile(name, colors);
      console.log(swatchesFile);

      fs.writeFile(`output/${name}.swatches`, Buffer.from(swatchesFile));

      return Promise.resolve();
    })
  );
})();
