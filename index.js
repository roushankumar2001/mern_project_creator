#!/usr/bin/env node
//above will create a node env.
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const projectName = process.argv[2];  //get argument from console 
if (!projectName) {
  // return error if no argument
  console.error('❌ Please provide a project name:');
  console.log(' example  \x1b[36mmpc my_project\x1b[0m');
  process.exit(1);
}

const projectPath = path.join(process.cwd(), projectName); //get dir path

console.log(`\x1b[34m🚀 Creating MERN project: ${projectName}\x1b[0m\n`);
//make project dir and enter inside
fs.mkdirSync(projectPath);
process.chdir(projectPath);

// --- Set up server ---
console.log('\x1b[34m📦 Setting up Express server...\x1b[0m');
fs.mkdirSync(projectName + '_server');  //create server dir
// Initialize server package.json & install deps
execSync('npm init -y', { cwd: projectName+'_server', stdio: 'inherit' });
execSync('npm install express', { cwd: projectName+'_server', stdio: 'inherit' });

fs.writeFileSync(
  projectName+'_server/index.js',
  `
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, '../${projectName}_client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../${projectName}_client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log('🚀 Server running on port', PORT);
});
`
);
console.log('\n \x1b[34mcreating server Readme\x1b[0m');
fs.writeFileSync(projectName+'_server/Readme.md', `
${projectName}_server readme
  `);

// --- Set up client (Vite + React) ---
console.log('\n\x1b[34m⚛️ Setting up React + Vite frontend...\x1b[0m');
execSync(`npm create vite@latest ${projectName}_client -- --template react`, { stdio: 'inherit' });
//setup react  frontend now install dependecies
console.log('\n\x1b[34m📦 Installing frontend dependencies...\x1b[0m');
execSync('npm install', { cwd: projectName+'_client', stdio: 'inherit' });

console.log('\n \x1b[34mcreating project Readme\x1b[0m');
fs.writeFileSync('Readme.md', `
mern project ${projectName} readme
  `);

console.clear();
console.log('\x1b[42m\x1b[97m%s\x1b[0m', ` ${projectName} created successfully!\n`);
console.log('\x1b[44m\x1b[93m%s\x1b[0m', `Next steps:\n`);
console.log(`\n\x1b[90m # move to  directory \n    \x1b[36m cd ${projectName}\x1b[0m`);
console.log(`\x1b[90m  # Start backend\x1b[0m`);
console.log(`\x1b[36m     cd ${projectName}_server && node index.js\x1b[0m`);
console.log(`\x1b[90m  # In another terminal, start frontend\x1b[0m`);
console.log(`\x1b[36m     cd ${projectName}_client && npm run dev\x1b[0m`);