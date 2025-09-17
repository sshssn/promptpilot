// Simple script to help convert HTML to PDF
const fs = require('fs');
const path = require('path');

console.log('📄 PDF Conversion Helper');
console.log('=' .repeat(40));

console.log('\n✅ Files created:');
console.log('• test-prompts.txt - Plain text version');
console.log('• test-prompts.html - Styled HTML version');

console.log('\n🔄 Conversion Options:');
console.log('');
console.log('1. 🌐 BROWSER METHOD (Recommended):');
console.log('   • Open test-prompts.html in your browser');
console.log('   • Press Ctrl+P (or Cmd+P on Mac)');
console.log('   • Select "Save as PDF"');
console.log('   • Choose "More settings" → "Options" → "Background graphics"');
console.log('   • Click "Save"');
console.log('');
console.log('2. 📝 WORD METHOD:');
console.log('   • Open Microsoft Word');
console.log('   • File → Open → test-prompts.html');
console.log('   • File → Export → Create PDF/XPS');
console.log('   • Save as "joblogic-test-prompts.pdf"');
console.log('');
console.log('3. 🌍 ONLINE CONVERTER:');
console.log('   • Go to https://html-pdf-converter.com/');
console.log('   • Upload test-prompts.html');
console.log('   • Download the PDF');
console.log('');
console.log('4. 💻 COMMAND LINE (if you have wkhtmltopdf):');
console.log('   wkhtmltopdf test-prompts.html joblogic-test-prompts.pdf');

console.log('\n🎯 What the PDF contains:');
console.log('• 7 different prompt examples');
console.log('• 5 prompts with specific issues to find');
console.log('• 2 well-structured examples');
console.log('• Clear test instructions');
console.log('• Expected analysis focus areas');

console.log('\n🚀 Ready to test!');
console.log('Once you have the PDF, upload it to your Prompt Evaluator at:');
console.log('http://localhost:9002');

