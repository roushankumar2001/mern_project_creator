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
fs.mkdirSync(projectName + "_server/public/client/", { recursive: true });
//create .env
fs.writeFileSync(projectName+'_server/.env',`# This is the database connection string for atlas
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/mydb
  
# Server port
PORT=5000
`);
// Initialize server package.json & install deps
fs.writeFileSync(projectName+'_server/package.json',`{
  "name": "${projectName}_server",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \\"Error: no test specified\\" && exit 1",
    "start":"node --env-file=.env --watch index.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "module"
}
`)
execSync('npm install express mongoose', { cwd: projectName + '_server', stdio: 'inherit' });
fs.mkdirSync(projectName + "_server/models/", { recursive: true });
fs.writeFileSync(projectName+'_server/models/user.js',`import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
});

export default mongoose.model('User', userSchema);
`)

fs.writeFileSync(
  projectName + '_server/index.js',
  `import express from 'express';
import mongoose from 'mongoose';
import User from './models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';
const app = express();
const PORT = 5000;

//Middleware
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public/client/dist')));
app.get('/api/test', (req, res) => { res.send('test success');})
app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.post('/api/users', async (req, res) => {
  const newUser = await User.create(req.body);
  res.json(newUser);
});
app.listen(PORT, () => {
  console.log('🚀 Server running on port', PORT);
});
`
);

console.log('\n \x1b[34mcreating server Readme\x1b[0m');
fs.writeFileSync(projectName + '_server/Readme.md', `
${projectName}_server readme
  `);



// --- Set up client (Vite + React) ---
console.log('\n\x1b[34m⚛️ Setting up React + Vite frontend...\x1b[0m');
execSync(`npm create vite@latest ${projectName}_client -- --template react`, { stdio: 'inherit' });
fs.writeFileSync(projectName + '_client/vite.config.js', `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(),react()],
  build: {
    outDir: '../${projectName}_server/public/client/', // ← change this to your desired output folder
  },
   server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000/api/',  // Your backend server
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\\/api/, ''),
      },
    },
  }
})
`
)

///modifying css for tailwind
const filePath = `${projectName}_client/src/index.css`
const existingContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
const lineToAdd = '@import "tailwindcss";\n';
// Step 2: Combine new line with old content
const newContent = lineToAdd + existingContent;

// Step 3: Write it back
fs.writeFileSync(filePath, newContent, 'utf-8');


//setup react  frontend now install dependecies
console.log('\n\x1b[34m📦 Installing frontend dependencies...\x1b[0m');
execSync('npm install', { cwd: projectName + '_client', stdio: 'inherit' });
execSync('npm install tailwindcss @tailwindcss/vite', { cwd: projectName + '_client', stdio: 'inherit' });

//modifying build command

const packagepath = projectName + '_client/package.json'; // path to your JSON file

// Step 1: Read the JSON file
const fileContent = fs.readFileSync(packagepath, 'utf-8');
const jsonData = JSON.parse(fileContent);

// Step 2: Modify the data
jsonData.scripts.build = "vite build --emptyOutDir"; // change the value of the desired key

// Step 3: Write the modified JSON back to the file
fs.writeFileSync(packagepath, JSON.stringify(jsonData, null, 2), 'utf-8');


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