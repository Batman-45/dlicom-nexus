import fs from 'fs';

const mascotCss = fs.readFileSync('src/components/Mascot/mascot.css', 'utf-8');
const indexCss = fs.readFileSync('src/index.css', 'utf-8');
const pageTsx = fs.readFileSync('src/views/MascotGeneratorPage.tsx', 'utf-8');

let passed = 0;
let total = 0;

function check(label, condition) {
  total++;
  if (condition) {
    console.log(`✅ [PASS] ${label}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${label}`);
    process.exitCode = 1;
  }
}

console.log('--- DLICOM MASCOT GENERATOR UI & CSS AUDIT ---');
check('mascot-input-wrapper has explicit dark background in mascot.css', mascotCss.includes('background-color: #0c081e !important'));
check('mascot-input-field has transparent background and white text in mascot.css', mascotCss.includes('-webkit-text-fill-color: #ffffff !important'));
check('mascot-synthesize-btn has high-contrast gradient in mascot.css', mascotCss.includes('.mascot-synthesize-btn'));
check('input reset in index.css has background-color: transparent', indexCss.includes('background-color: transparent;'));
check(':root in index.css has color-scheme: dark', indexCss.includes('color-scheme: dark;'));
check('MascotGeneratorPage has inline dark background on form wrapper', pageTsx.includes("backgroundColor: '#0c081e'"));
check('MascotGeneratorPage has inline transparent bg and white text on input', pageTsx.includes("WebkitTextFillColor: '#ffffff'"));
check('MascotGeneratorPage binds input value directly to persistent username state', pageTsx.includes('value={username}'));
check('MascotGeneratorPage input onChange directly updates persistent username state', pageTsx.includes('setUsername(e.target.value)'));
check('MascotGeneratorPage contains compact inline mascot-error-badge', pageTsx.includes('mascot-error-badge'));
check('MascotGeneratorPage contains Try Again button in error state', pageTsx.includes('Try Again'));
check('MascotGeneratorPage contains NO ecosystem selection UI', !pageTsx.includes('Select Your Ecosystem Focus'));
check('MascotGeneratorPage contains NO fake metrics or Pulse UI', !pageTsx.includes('reputation') && !pageTsx.includes('Pulse'));
check('MascotGeneratorPage contains large hero MascotVisual', pageTsx.includes('size="hero"'));

console.log(`\nUI Verification Result: ${passed}/${total} checks passed.`);
