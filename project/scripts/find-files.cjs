#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function findFiles(dir, patterns, results = []) {
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and .git directories
        if (file !== 'node_modules' && file !== '.git') {
          findFiles(fullPath, patterns, results);
        }
      } else if (stat.isFile()) {
        // Check if file matches any of our patterns
        const relativePath = path.relative('.', fullPath);
        
        for (const pattern of patterns) {
          if (pattern.test(relativePath)) {
            results.push(relativePath);
            break;
          }
        }
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }
  
  return results;
}

// Define the patterns we're looking for
const patterns = [
  /^\.\/docs\/.*\.md$/,           // *.md files in docs directory
  /COMMANDES_.*$/,                // Files starting with COMMANDES_
  /DEPLOY_.*$/,                   // Files starting with DEPLOY_
  /FIND_.*$/,                     // Files starting with FIND_
  /INSTALL_.*$/,                  // Files starting with INSTALL_
  /PUSH_.*$/,                     // Files starting with PUSH_
  /SYNC_.*$/                      // Files starting with SYNC_
];

// Find matching files
const matchingFiles = findFiles('.', patterns);

// Sort and limit to first 20 results
const sortedFiles = matchingFiles.sort();
const limitedFiles = sortedFiles.slice(0, 20);

// Output results
if (limitedFiles.length > 0) {
  console.log(limitedFiles.join('\n'));
} else {
  console.log('No matching files found.');
}