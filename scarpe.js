import { JSDOM } from 'jsdom';
import fs from 'fs';

async function fetchAnimalDetails(url) {
  const resp = await fetch(url);
  const text = await resp.text();
  const dom = new JSDOM(text);
  const doc = dom.window.document;

  const getText = (label) => {
    const el = [...doc.querySelectorAll('strong')]
      .find(e => e.textContent.trim().startsWith(label));
    return el ? el.parentElement.textContent.replace(label, '').trim() : '';
  };

  return {
    kingdom: getText('Kingdom'),
    phylum: getText('Phylum'),
    class: getText('Class'),
    order: getText('Order'),
    family: getText('Family'),
    genus: getText('Genus'),
    scientificName: getText('Scientific Name'),
  };
}

async function scrapeAnimals() {
  const resp = await fetch('https://a-z-animals.com/animals/');
  const html = await resp.text();
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const list = doc.querySelectorAll('.list-item.col-md-4.col-sm-6');
  const output = [];

  for (let i = 0; i < Math.min(list.length, 5); i++) {
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
