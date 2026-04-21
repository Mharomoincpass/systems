const fs = require('fs');

// 1. Update app/globals.css
const globalsPath = 'app/globals.css';
let globalsCss = fs.readFileSync(globalsPath, 'utf8');

// Replace var(--xyz): oklch(A B C) with var(--xyz): A B C
// Basically we need to unwrap oklch(...) inside :root and .dark
globalsCss = globalsCss.replace(/oklch\(([^)]+)\)/g, '\$1');

fs.writeFileSync(globalsPath, globalsCss);

// 2. Update tailwind.config.js
const tailwindPath = 'tailwind.config.js';
let tailwindConfig = fs.readFileSync(tailwindPath, 'utf8');

// Replace \"var(--xyz)\" with \"oklch(var(--xyz) / <alpha-value>)\" inside the colors object
tailwindConfig = tailwindConfig.replace(/\"var\(--([^)]+)\)\"/g, '\"oklch(var(--\$1) / <alpha-value>)\"');

fs.writeFileSync(tailwindPath, tailwindConfig);

console.log('Files updated successfully!');
