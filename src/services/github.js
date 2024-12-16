// src/services/github.js
const { Octokit } = require('@octokit/rest');
const { loadConfig } = require('../utils/config');

class GitHubService {
  constructor(token) {
    this.octokit = new Octokit({ auth: token });
  }

  /**
   * Initialize GitHub service with configuration
   * @returns {Promise<GitHubService>}
   */
  static async initialize() {
    const config = await loadConfig();
    if (!config.github?.token) {
      throw new Error('GitHub token not configured. Run: pullmaster configure --github-token <token>');
    }
    return new GitHubService(config.github.token);
  }

  /**
   * Parse repository string into owner and repo
   * @param {string} repoString - Repository in format owner/repo
   * @returns {{owner: string, repo: string}}
   */
  parseRepoString(repoString) {
    const [owner, repo] = repoString.split('/');
    if (!owner || !repo) {
      throw new Error('Invalid repository format. Use: owner/repo');
    }
    return { owner, repo };
  }

  /**
   * Get pull request metadata
   * @param {string} repoString - Repository in format owner/repo
   * @param {number} prNumber - Pull request number
   * @returns {Promise<Object>}
   */
  async getPullRequest(repoString, prNumber) {
    const { owner, repo } = this.parseRepoString(repoString);
    const { data: pr } = await this.octokit.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
    });

    return pr;
  }

  /**
   * Get pull request files
   * @param {string} repoString - Repository in format owner/repo
   * @param {number} prNumber - Pull request number
   * @returns {Promise<Array>}
   */
  async getPullRequestFiles(repoString, prNumber) {
    const { owner, repo } = this.parseRepoString(repoString);
    const { data: files } = await this.octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber,
    });

    return files;
  }

  /**
   * Get pull request commits
   * @param {string} repoString - Repository in format owner/repo
   * @param {number} prNumber - Pull request number
   * @returns {Promise<Array>}
   */
  async getPullRequestCommits(repoString, prNumber) {
    const { owner, repo } = this.parseRepoString(repoString);
    const { data: commits } = await this.octokit.pulls.listCommits({
      owner,
      repo,
      pull_number: prNumber,
    });

    return commits;
  }

  /**
   * Get pull request reviews
   * @param {string} repoString - Repository in format owner/repo
   * @param {number} prNumber - Pull request number
   * @returns {Promise<Array>}
   */
  async getPullRequestReviews(repoString, prNumber) {
    const { owner, repo } = this.parseRepoString(repoString);
    const { data: reviews } = await this.octokit.pulls.listReviews({
      owner,
      repo,
      pull_number: prNumber,
    });

    return reviews;
  }

  /**
   * Get file content
   * @param {string} repoString - Repository in format owner/repo
   * @param {string} path - File path
   * @param {string} ref - Git reference (branch, commit)
   * @returns {Promise<string>}
   */
  async getFileContent(repoString, path, ref) {
    const { owner, repo } = this.parseRepoString(repoString);
    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
        ref,
      });

      // Content is base64 encoded
      return Buffer.from(data.content, 'base64').toString('utf8');
    } catch (error) {
      if (error.status === 404) {
        return null; // File doesn't exist at this reference
      }
      throw error;
    }
  }

  /**
   * Get complete PR analysis data
   * @param {string} repoString - Repository in format owner/repo
   * @param {number} prNumber - Pull request number
   * @returns {Promise<Object>}
   */
  async analyzePR(repoString, prNumber) {
    const [pr, files, commits, reviews] = await Promise.all([
      this.getPullRequest(repoString, prNumber),
      this.getPullRequestFiles(repoString, prNumber),
      this.getPullRequestCommits(repoString, prNumber),
      this.getPullRequestReviews(repoString, prNumber)
    ]);

    // Get the content for each modified file
    const fileContents = await Promise.all(
      files.map(async (file) => {
        const [baseContent, headContent] = await Promise.all([
          this.getFileContent(repoString, file.filename, pr.base.sha),
          this.getFileContent(repoString, file.filename, pr.head.sha)
        ]);

        return {
          ...file,
          baseContent,
          headContent
        };
      })
    );

    return {
      pullRequest: pr,
      files: fileContents,
      commits,
      reviews,
      metadata: {
        totalCommits: commits.length,
        totalFiles: files.length,
        additions: files.reduce((sum, file) => sum + file.additions, 0),
        deletions: files.reduce((sum, file) => sum + file.deletions, 0),
        totalReviews: reviews.length
      }
    };
  }
}

module.exports = GitHubService;
