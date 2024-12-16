// src/commands/analyze.js
const path = require("path");
const fs = require("fs").promises;
const GitHubService = require("../services/github");
const { loadConfig } = require("../utils/config");

/**
 * Filter files based on configuration
 * @param {Array} files - List of files from GitHub
 * @param {Object} config - Analysis configuration
 * @returns {Array} Filtered files
 */
function filterFiles(files, config) {
  let filteredFiles = files;

  // Apply max files limit
  if (config.analysis?.maxFiles) {
    filteredFiles = filteredFiles.slice(0, config.analysis.maxFiles);
  }

  // Apply exclusion patterns
  if (config.analysis?.excludePaths?.length) {
    const patterns = config.analysis.excludePaths.map((p) => new RegExp(p));
    filteredFiles = filteredFiles.filter(
      (file) => !patterns.some((pattern) => pattern.test(file.filename))
    );
  }

  return filteredFiles;
}

/**
 * Prepare data for AI analysis
 * @param {Object} prData - Pull request data from GitHub
 * @returns {Object} Formatted data for AI
 */
function prepareAIData(prData) {
  return {
    pullRequest: {
      title: prData.pullRequest.title,
      description: prData.pullRequest.body,
      author: prData.pullRequest.user.login,
      baseBranch: prData.pullRequest.base.ref,
      headBranch: prData.pullRequest.head.ref,
    },
    changes: prData.files.map((file) => ({
      filename: file.filename,
      status: file.status,
      additions: file.additions,
      deletions: file.deletions,
      previousContent: file.baseContent,
      newContent: file.headContent,
    })),
    commits: prData.commits.map((commit) => ({
      message: commit.commit.message,
      author: commit.commit.author.name,
      date: commit.commit.author.date,
    })),
    metadata: {
      ...prData.metadata,
      changedFiles: prData.files.map((f) => f.filename),
      reviewers: [...new Set(prData.reviews.map((r) => r.user.login))],
    },
  };
}

/**
 * Save analysis results
 * @param {Object} results - Analysis results
 * @param {string} outputPath - Output directory path
 * @returns {Promise<void>}
 */
async function saveResults(results, outputPath) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outputDir =
    outputPath || path.join(process.cwd(), "pullmaster-results");

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  // Save JSON results
  const jsonPath = path.join(outputDir, `analysis-${timestamp}.json`);
  await fs.writeFile(jsonPath, JSON.stringify(results, null, 2));

  // Save markdown report
  const mdPath = path.join(outputDir, `analysis-${timestamp}.md`);
  const markdownReport = generateMarkdownReport(results);
  await fs.writeFile(mdPath, markdownReport);

  return {
    jsonPath,
    mdPath,
  };
}

/**
 * Generate markdown report
 * @param {Object} results - Analysis results
 * @returns {string} Markdown content
 */
function generateMarkdownReport(results) {
  return `# Pull Request Analysis Report

## Overview
- Title: ${results.pullRequest.title}
- Author: ${results.pullRequest.author}
- Base Branch: ${results.pullRequest.baseBranch}
- Head Branch: ${results.pullRequest.headBranch}

## Statistics
- Files Changed: ${results.metadata.totalFiles}
- Total Commits: ${results.metadata.totalCommits}
- Additions: ${results.metadata.additions}
- Deletions: ${results.metadata.deletions}

## Analysis Results
${results.analysis.summary}

### Security Issues
${results.analysis.security.map((issue) => `- 🔒 ${issue}`).join("\n")}

### Code Quality
${results.analysis.quality.map((issue) => `- 💡 ${issue}`).join("\n")}

### Potential Bugs
${results.analysis.bugs.map((issue) => `- 🐛 ${issue}`).join("\n")}

### Recommendations
${results.analysis.recommendations.map((rec) => `- ✨ ${rec}`).join("\n")}

## Changed Files
${results.metadata.changedFiles.map((file) => `- ${file}`).join("\n")}

## Reviewers
${results.metadata.reviewers.map((reviewer) => `- @${reviewer}`).join("\n")}
`;
}

/**
 * Analyze command handler
 */
async function analyze(provider, repoString, prNumber, options) {
  try {
    console.log("Starting pull request analysis...");

    // Load configuration
    const config = await loadConfig(options.config);

    // Initialize GitHub service
    const github = await GitHubService.initialize();

    // Get PR data
    console.log("Fetching PR data...");
    const prData = await github.analyzePR(repoString, prNumber);

    // Filter files based on configuration
    prData.files = filterFiles(prData.files, config);

    // Prepare data for AI analysis
    const aiData = prepareAIData(prData);

    // TODO: Perform AI analysis
    // This will be implemented when we add the AI service
    const aiAnalysis = {
      summary: "AI analysis pending implementation",
      security: [],
      quality: [],
      bugs: [],
      recommendations: [],
    };

    // Prepare final results
    const results = {
      ...aiData,
      analysis: aiAnalysis,
    };

    // Save results
    const { jsonPath, mdPath } = await saveResults(results, options.output);

    console.log("\nAnalysis completed successfully!");
    console.log(
      `Results saved to:\n- JSON: ${jsonPath}\n- Markdown: ${mdPath}`
    );
  } catch (error) {
    console.error("Error analyzing pull request:", error.message);
    process.exit(1);
  }
}

/**
 * Generate AI prompt from PR data
 * @param {Object} prData - Pull request data from GitHub
 * @returns {string} Formatted prompt
 */
function generatePrompt(prData) {
  const fileChanges = prData.files
    .map((file) => {
      return `
File: ${file.filename}
Status: ${file.status}
Changes: +${file.additions} -${file.deletions}
Diff:
\`\`\`
${file.patch || "Binary file changed"}
\`\`\`
`;
    })
    .join("\n");

  return `Please analyze this Pull Request and provide feedback on:
- Code quality issues
- Potential bugs or errors
- Security concerns
- Best practices recommendations
- Suggested improvements

Pull Request Details:
Title: ${prData.pullRequest.title}
Description: ${prData.pullRequest.body || "No description provided"}
Author: ${prData.pullRequest.user.login}
Base Branch: ${prData.pullRequest.base.ref}
Head Branch: ${prData.pullRequest.head.ref}

Changes Overview:
- Total Files Changed: ${prData.metadata.totalFiles}
- Total Commits: ${prData.metadata.totalCommits}
- Total Additions: ${prData.metadata.additions}
- Total Deletions: ${prData.metadata.deletions}

Commits:
${prData.commits.map((commit) => `- ${commit.commit.message}`).join("\n")}

File Changes:
${fileChanges}
`;
}

/**
 * Analyze command handler
 */
async function analyze(provider, repoString, prNumber, options) {
  try {
    console.log("Starting pull request analysis...");

    // Initialize GitHub service
    const github = await GitHubService.initialize();

    // Get PR data
    console.log("Fetching PR data...");
    const prData = await github.analyzePR(repoString, prNumber);

    // Generate prompt
    const prompt = generatePrompt(prData);

    // Save prompt to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const outputDir = options.output || process.cwd();
    const promptPath = path.join(
      outputDir,
      `pr-${prNumber}-prompt-${timestamp}.txt`
    );

    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(promptPath, prompt);

    // Save raw PR data for reference
    const dataPath = path.join(
      outputDir,
      `pr-${prNumber}-data-${timestamp}.json`
    );
    await fs.writeFile(dataPath, JSON.stringify(prData, null, 2));

    console.log("\nAnalysis preparation completed!");
    console.log(
      `Files saved:\n- Prompt: ${promptPath}\n- Raw data: ${dataPath}`
    );
  } catch (error) {
    console.error("Error analyzing pull request:", error.message);
    process.exit(1);
  }
}

module.exports = analyze;
