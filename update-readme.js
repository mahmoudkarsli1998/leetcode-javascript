#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Auto-update README.md with solutions from the solutions folder
 * Run this script whenever you add new solutions
 */

// Configuration
const SOLUTIONS_DIR = './solutions';
const README_FILE = './README.md';
const WEBSITE_URL = 'https://leetcodejavascript.com';

// Difficulty levels and their colors for future enhancement
const DIFFICULTY_LEVELS = {
    'Easy': '🟢',
    'Medium': '🟡', 
    'Hard': '🔴'
};

/**
 * Extract problem info from filename
 * Example: "0001-two-sum.js" -> { number: 1, title: "Two Sum", filename: "0001-two-sum.js" }
 */
function parseFilename(filename) {
    if (!filename.endsWith('.js')) return null;
    
    const match = filename.match(/^(\d{4})-(.+)\.js$/);
    if (!match) return null;
    
    const [, numberStr, titleSlug] = match;
    const number = parseInt(numberStr, 10);
    const title = titleSlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    
    return { number, title, filename, titleSlug };
}

/**
 * Extract difficulty from solution file content
 * Looks for comments like "Easy", "Medium", "Hard" at the top of the file
 */
function extractDifficulty(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').slice(0, 10); // Check first 10 lines
        
        for (const line of lines) {
            const lowerLine = line.toLowerCase();
            if (lowerLine.includes('easy')) return 'Easy';
            if (lowerLine.includes('medium')) return 'Medium';
            if (lowerLine.includes('hard')) return 'Hard';
        }
        
        return 'Unknown';
    } catch (error) {
        return 'Unknown';
    }
}

/**
 * Get all solution files and their metadata
 */
function getSolutions() {
    if (!fs.existsSync(SOLUTIONS_DIR)) {
        console.log('Solutions directory not found. Creating it...');
        fs.mkdirSync(SOLUTIONS_DIR, { recursive: true });
        return [];
    }
    
    const files = fs.readdirSync(SOLUTIONS_DIR);
    const solutions = [];
    
    for (const file of files) {
        const parsed = parseFilename(file);
        if (parsed) {
            const filePath = path.join(SOLUTIONS_DIR, file);
            const difficulty = extractDifficulty(filePath);
            
            solutions.push({
                ...parsed,
                difficulty,
                filePath: `./solutions/${file}`
            });
        }
    }
    
    // Sort by problem number
    return solutions.sort((a, b) => a.number - b.number);
}

/**
 * Generate the table of contents markdown
 */
function generateTableOfContents(solutions) {
    if (solutions.length === 0) {
        return `| # | Title | Difficulty |
|---|-------|------------|
| | *Your solutions will appear here as you add them* | |`;
    }
    
    let table = `| # | Title | Difficulty |
|---|-------|------------|`;
    
    for (const solution of solutions) {
        const difficultyWithIcon = `${DIFFICULTY_LEVELS[solution.difficulty] || ''} ${solution.difficulty}`;
        table += `\n| ${solution.number} | [${solution.title}](${solution.filePath}) | ${difficultyWithIcon} |`;
    }
    
    return table;
}

/**
 * Calculate progress statistics
 */
function calculateProgress(solutions) {
    const stats = {
        total: solutions.length,
        easy: 0,
        medium: 0,
        hard: 0
    };
    
    for (const solution of solutions) {
        switch (solution.difficulty.toLowerCase()) {
            case 'easy':
                stats.easy++;
                break;
            case 'medium':
                stats.medium++;
                break;
            case 'hard':
                stats.hard++;
                break;
        }
    }
    
    return stats;
}

/**
 * Generate README content
 */
function generateReadmeContent(solutions, stats) {
    const totalText = stats.total > 0 ? `${stats.total}+ LeetCode solutions` : 'LeetCode solutions';
    const progressText = stats.total > 0 ? `${stats.total} (and counting!)` : '0 (just getting started!)';
    
    return `# ${totalText} in JavaScript

${stats.total > 0 ? `*Updated: ${new Date().toLocaleDateString()}*` : '*Start your LeetCode journey here!*'}

${WEBSITE_URL}

## Table of Contents:

${generateTableOfContents(solutions)}

## Languages
- JavaScript (100%)

## Progress
- **Total Problems Solved**: ${progressText}
- **Easy**: ${stats.easy}
- **Medium**: ${stats.medium}  
- **Hard**: ${stats.hard}

## Topics Covered
${stats.total > 0 ? 'Topics will be automatically detected and listed here as you add more solutions.' : 'Topics will appear here as you solve problems covering different algorithms and data structures.'}

## Getting Started
This repository contains my personal journey solving LeetCode problems. Each solution includes:
- Clean, readable JavaScript code
- Detailed comments explaining the approach
- Time and space complexity analysis
- Test cases

## How to Use
1. Browse the solutions in the table above
2. Click on any problem title to view the solution
3. Each file contains the problem description, solution, and test cases
4. Run any solution with: \`node solutions/XXXX-problem-name.js\`

## Contributing
Feel free to:
- Suggest optimizations for existing solutions
- Add alternative approaches
- Report any issues or bugs
- Improve documentation

## Auto-Update
This README is automatically updated using \`update-readme.js\`. 
Run \`node update-readme.js\` after adding new solutions.

## License
MIT License

---
*Last updated: ${new Date().toISOString().split('T')[0]}*
*Solutions: ${stats.total} | Easy: ${stats.easy} | Medium: ${stats.medium} | Hard: ${stats.hard}*`;
}

/**
 * Update README.md file
 */
function updateReadme() {
    console.log('🔍 Scanning solutions directory...');
    
    const solutions = getSolutions();
    const stats = calculateProgress(solutions);
    
    console.log(`📊 Found ${stats.total} solutions:`);
    console.log(`   🟢 Easy: ${stats.easy}`);
    console.log(`   🟡 Medium: ${stats.medium}`);
    console.log(`   🔴 Hard: ${stats.hard}`);
    
    const readmeContent = generateReadmeContent(solutions, stats);
    
    try {
        fs.writeFileSync(README_FILE, readmeContent, 'utf8');
        console.log('✅ README.md updated successfully!');
        
        if (solutions.length > 0) {
            console.log('\n📋 Latest solutions:');
            solutions.slice(-5).forEach(sol => {
                console.log(`   ${sol.number}. ${sol.title} (${sol.difficulty})`);
            });
        } else {
            console.log('\n🚀 Ready to add your first solution!');
            console.log('   Create: solutions/0001-two-sum.js');
            console.log('   Then run: node update-readme.js');
        }
        
    } catch (error) {
        console.error('❌ Error updating README.md:', error.message);
        process.exit(1);
    }
}

/**
 * CLI interface
 */
function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
📚 LeetCode README Auto-Updater

Usage: node update-readme.js [options]

Options:
  --help, -h     Show this help message
  --dry-run      Show what would be updated without writing
  --stats        Show current statistics only

Examples:
  node update-readme.js           # Update README.md
  node update-readme.js --stats   # Show current stats
  node update-readme.js --dry-run # Preview changes
        `);
        return;
    }
    
    if (args.includes('--stats')) {
        const solutions = getSolutions();
        const stats = calculateProgress(solutions);
        console.log('📊 Current Statistics:');
        console.log(`   Total: ${stats.total}`);
        console.log(`   Easy: ${stats.easy}`);
        console.log(`   Medium: ${stats.medium}`);
        console.log(`   Hard: ${stats.hard}`);
        return;
    }
    
    if (args.includes('--dry-run')) {
        console.log('🔍 Dry run mode - showing what would be updated...');
        const solutions = getSolutions();
        const stats = calculateProgress(solutions);
        console.log('\nGenerated content preview:');
        console.log('=' .repeat(50));
        console.log(generateReadmeContent(solutions, stats).slice(0, 500) + '...');
        console.log('=' .repeat(50));
        return;
    }
    
    updateReadme();
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { updateReadme, getSolutions, calculateProgress };