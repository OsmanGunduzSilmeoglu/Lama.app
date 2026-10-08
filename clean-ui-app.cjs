const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\Gunduz\\Desktop\\Lama\\Lama_t3.1\\';

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Remove backdrop blur overlays
    content = content.replace(/bg-black\/40 backdrop-blur-sm/g, 'bg-black/50');
    content = content.replace(/bg-indigo-900\/40 backdrop-blur-md/g, 'bg-black/50');
    content = content.replace(/bg-black\/50 z-\[60\] backdrop-blur-sm/g, 'bg-black/50 z-[60]');
    content = content.replace(/backdrop-blur-md/g, '');
    content = content.replace(/backdrop-blur-sm/g, '');
    content = content.replace(/backdrop-blur-xl/g, '');
    content = content.replace(/backdrop-blur-lg/g, '');
    
    // 2. Remove heavy shadows
    content = content.replace(/shadow-2xl/g, 'shadow-xl');
    content = content.replace(/shadow-\[.*?\]/g, 'shadow-sm');

    // 3. Remove weird gradient backgrounds that make things aislop
    content = content.replace(/bg-gradient-to-[a-z]{1,2}/g, '');
    content = content.replace(/from-[a-z]+-\d+(\/\d+)?/g, '');
    content = content.replace(/via-[a-z]+-\d+(\/\d+)?/g, '');
    content = content.replace(/to-[a-z]+-\d+(\/\d+)?/g, '');
    content = content.replace(/from-white\/\d+/g, '');
    content = content.replace(/via-white\/\d+/g, '');
    content = content.replace(/to-[#A-Fa-f0-9]+/g, '');
    content = content.replace(/to-transparent/g, '');
    
    // 4. Clip text gradients
    content = content.replace(/bg-clip-text text-transparent/g, '');
    
    // Clean up multiple spaces
    content = content.replace(/  +/g, ' ');
    content = content.replace(/ className=\" /g, ' className=\"');
    content = content.replace(/ className=\' /g, ' className=\'');
    content = content.replace(/ \'/g, '\'');
    content = content.replace(/ \"/g, '\"');
    content = content.replace(/` /g, '`');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Processed ' + path.basename(filePath));
    }
}

fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.tsx')) {
        processFile(path.join(dir, file));
    }
});
