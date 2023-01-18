import { promises as fs } from "fs";
import { readSwatchesFile, createSwatchesFile } from "procreate-swatches";
import axios from "axios";
import _ from "lodash";

const ALL_PALETTES = [
  "apollo",
  "cc-29",
  "endesga-32",
  "endesga-64",
  "famicube",
  "fantasy-24",
  "journey",
  "lospec500",
  "lospec500",
  "pear36",
  "resurrect-64",
  "slso8",
  "slso8",
  "sweetie-16",
  "vinik24",
  "vinik24",
  "zughy-32",
  "aap-64",
];

const LOSPEC_BASE_URL = `https://lospec.com/palette-list`;

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

const getTitle = (name, index, author) =>
  author ? `${name} - ${author} - ${index}` : `${name} - ${index}`;

(async () => {
  await Promise.all(
    ALL_PALETTES.map(async (current) => {
      const swatch = await getSwatchFile(current);
      const name = swatch.name;
      const author = swatch?.author || null;
      // One procreate palette supports only 30 colors
      const chunkedColors = _.chunk(swatchToRgb(swatch.colors), 30);

      const totalColors = swatch.colors.length;
      const totalChunks = chunkedColors.length;
      console.log(`Palette has ${totalColors}, ${totalChunks} files`);

      return chunkedColors.map(async (colors, index) => {
        const current = index + 1;

        const title = getTitle(name, current, author);

        const swatchesFile = await createSwatchesFile(title, colors);
        console.log(`Saving ${name} (${current}/${totalChunks})`);
        return fs.writeFile(
          `output/${title}.swatches`,
          Buffer.from(swatchesFile)
        );
      });
    })
  ).catch(console.error);
})();
