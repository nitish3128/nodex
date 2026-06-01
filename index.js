#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import 'dotenv/config';


import 'dotenv/config';
const API_KEY = "here api"; 

const program = new Command();

program
  .version('1.0.0')
  .description('A CLI tool to generate code projects using Gemini')
  .argument('<prompt>', 'The description of what you want to build')
  .option('-d, --dir <dirname>', 'The output directory', 'generated-code')
  .action(async (prompt, options) => {
    
    const outputDir = path.resolve(process.cwd(), options.dir);
    const spinner = ora(`Asking Gemini (Directly) to build: "${prompt}"...`).start();

    try {
    
      const payload = {
        contents: [{
          parts: [{
            text: `
              You are an expert full-stack developer. 
              The user wants a web application. 
              
              You must output ONLY a valid JSON array. 
              Do not output markdown, explanations, or code blocks.
              The JSON array must contain objects with "filename" and "content".
              
              Request: "${prompt}"
            `
          }]
        }]
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google API Error: ${response.status} ${response.statusText}\nDetails: ${errorText}`);
      }

      const data = await response.json();
      
    
      const generatedText = data.candidates[0].content.parts[0].text;
      
    
      const cleanJson = generatedText.replace(/```json/g, '').replace(/```/g, '');

   
      let files;
      try {
        files = JSON.parse(cleanJson);
      } catch (e) {
        throw new Error("Gemini returned text, but it wasn't valid JSON. Try again.");
      }

      spinner.text = 'Writing files to disk...';

     
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      for (const file of files) {
        const filePath = path.join(outputDir, file.filename);
        await fs.outputFile(filePath, file.content);
        console.log(chalk.green(`✔ Created: ${file.filename}`));
      }

      spinner.succeed(chalk.blue(`Success! Project created in /${options.dir}`));

    } catch (error) {
      spinner.fail('Something went wrong.');
      console.error(chalk.red(error.message));
    }
  });


program.parse(process.argv);



//npm init -y
//npm install commander chalk ora fs-extra dotenv
//npm link
//expressoot "test"


