import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

// Create images folder if it doesn't exist
if (!fs.existsSync('./images')) {
  fs.mkdirSync('./images');
}

async function fetchAnimalDetails(url) {
  const resp = await fetch(url);
  const text = await resp.text();
  const dom = new JSDOM(text);
  const doc = dom.window.document;

  const output = {}; 

  const keys = doc.querySelectorAll('.animal-facts dt');
  const values = doc.querySelectorAll('.animal-facts dd');

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i].textContent.trim();
    const value = values[i].textContent.trim();
    output[key] = value;
  }

  dom.window.close();
  return output;
}

// Image download function
async function imagedownload(url, filepath) {
  const resp = await fetch(url);
  const buffer = await resp.arrayBuffer();
  fs.writeFileSync(filepath, Buffer.from(buffer));
}

// download checkmark png
const downloadCheckmark = async () => {
  const url = 'https://a-z-animals.com/wp-content/themes/fwp-az-animals-theme/assets/images/checkmark.png';
  const logoUrl = 'https://a-z-animals.com/wp-content/themes/fwp-az-animals-theme/assets/images/logo/logo.png';
  const filepath = path.join('./images', 'checkmark.png');
  const logoFilepath = path.join('./images', 'logo.png');
  await imagedownload(url, filepath);
  await imagedownload(logoUrl, logoFilepath);
  console.log('✓ Checkmark and Logo downloaded');
};

async function scrapeAnimals() {

  await downloadCheckmark();

  const resp = await fetch('https://a-z-animals.com/animals/');
  const html = await resp.text();
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const list = doc.querySelectorAll('.list-item.col-md-4.col-sm-6');
  const output = [];

  for (let i = 0; i < Math.min(list.length, 3); i++) {
    const a = list[i].querySelector('a');
    if (!a) continue;

    const name = a.textContent.trim();
    const link = a.href;

    console.log(`Fetching details for: ${name}`);
    const classification = await fetchAnimalDetails(link);

    output.push({ name, link, classification });
  }

  fs.writeFileSync('animals.json', JSON.stringify(output, null, 2));
  console.log('Data saved to animals.json');
}

scrapeAnimals();