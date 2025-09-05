// Generates 5–15 SVG tiles and updates manifest.json
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.join(__dirname, '..');
const artRoot = path.join(repoRoot, 'art');

function ensureDir(p){ fs.mkdirSync(p, { recursive: true }); }

function randInt(min, max){ return Math.floor(Math.random() * (max - min + 1)) + min; }
function uid(){ return Math.random().toString(36).slice(2, 10); }

function randomPalette(){
  // Pleasant pastel-ish palette generator
  const h = randInt(0, 360);
  const s = randInt(55, 75);
  const l = randInt(45, 70);
  return [`hsl(${h},${s}%,${l}%)`, `hsl(${(h+140)%360},${s}%,${l-10}%)`, `hsl(${(h+220)%360},${s-10}%,${l+10}%)`];
}

function makeSVG(seed){
  const size = 512;
  const cells = randInt(8, 20);
  const cell = size / cells;
  const pad = 0;
  const [c1,c2,c3] = randomPalette();

  let rects = '';
  for(let y=0; y<cells; y++){
    for(let x=0; x<cells; x++){
      const r = Math.random();
      const fill = r < 0.33 ? c1 : r < 0.66 ? c2 : c3;
      const rx = Math.random() < 0.1 ? 6 : 0;
      rects += `<rect x="${x*cell+pad}" y="${y*cell+pad}" width="${cell-pad*2}" height="${cell-pad*2}" rx="${rx}" fill="${fill}"/>`;
    }
  }
  const noise = randInt(0, 30);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <filter id="gr"><feTurbulence type="fractalNoise" baseFrequency="${noise/200}" numOctaves="1" result="n"/><feColorMatrix type="saturate" values="0.25"/></filter>
  </defs>
  <rect width="100%" height="100%" fill="white"/>
  ${rects}
  </svg>`;
  return svg;
}

function main(){
  const today = new Date();
  const y = today.getUTCFullYear();
  const m = String(today.getUTCMonth()+1).padStart(2,'0');
  const d = String(today.getUTCDate()).padStart(2,'0');
  const dayDir = path.join(artRoot, `${y}-${m}-${d}`);
  ensureDir(dayDir);

  const count = randInt(5, 15);
  const created = [];

  let manifest = [];
  const manifestPath = path.join(repoRoot, 'manifest.json');
  if(fs.existsSync(manifestPath)){
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8') || '[]');
  }

  for(let i=0; i<count; i++){
    const id = uid();
    const file = path.join(dayDir, `${id}.svg`);
    const svg = makeSVG(id);
    fs.writeFileSync(file, svg, 'utf-8');
    const rel = path.relative(repoRoot, file).replace(/\\/g,'/');
    const entry = {
      id, title: `Tile ${id}`, date: new Date().toISOString(), path: rel
    };
    manifest.push(entry);
    created.push({ file: rel });
    // Update manifest on each iteration so each commit can include it
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  }

  // Write the list of new files so the workflow can commit one-by-one
  const listPath = path.join(__dirname, '.newfiles.txt');
  fs.writeFileSync(listPath, created.map(x => x.file).join('\n'), 'utf-8');
  console.log(`Generated ${created.length} tiles.`);
}

main();
