# pullmaster-ai

A powerful command-line interface tool that leverages AI to provide comprehensive Pull Request analysis. Pullmaster AI helps teams maintain code quality by offering intelligent code review insights, focusing on security, code quality, and best practices.

## Features

- In-depth Pull Request analysis using AI
- Security vulnerability scanning
- Code quality assessment
- Bug pattern detection
- File-by-file change analysis
- Commit history review
- Dependency change tracking
- Integration with GitHub (more platforms coming soon)
- Customizable analysis rules
- Markdown report generation
- CI/CD pipeline integration support

## Installation

```bash
npm install -g pullmaster-ai
```

## Quick Start

```bash
pullmaster analyze github owner/repo pull-number
```

## Requirements

- Node.js >= 20
- Git
- GitHub API token with PR read permissions

## Configuration

Create a `.pullmasterrc` file in your project root or use command line options:

```json
{
  "github": {
    "token": "<your-github-token>"
  },
  "analysis": {
    "maxFiles": 50,
    "excludePaths": [],
    "aiModel": "sonnet-3.5"
  }
}
```

## Commands

### analyze
Performs a comprehensive analysis of a pull request:
```bash
pullmaster analyze github owner/repo pull-number [options]
```

### configure
Sets up or updates your configuration:
```bash
pullmaster configure
```

### validate
Validates your current configuration:
```bash
pullmaster validate
```

## Analysis Output

The tool provides a detailed analysis including:
- Security vulnerabilities
- Code quality issues
- Potential bugs
- Best practices recommendations
- Dependencies impact
- Suggested improvements

Reports are generated in both JSON and Markdown formats.

## Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| github.token | GitHub API token | - |
| analysis.maxFiles | Maximum number of files to analyze | 50 |
| analysis.excludePaths | Paths to exclude from analysis | [] |
| analysis.aiModel | AI model to use for analysis | gpt-4 |

## Environment Variables

- `PULLMASTER_GITHUB_TOKEN`: GitHub API token
- `PULLMASTER_CONFIG_PATH`: Custom path to config file
- `PULLMASTER_OUTPUT_DIR`: Custom path for analysis output

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Development Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/pullmaster-ai.git
cd pullmaster-ai
```

2. Install dependencies
```bash
npm install
```

3. Create a local configuration file
```bash
cp .pullmasterrc.example .pullmasterrc
```

4. Run tests
```bash
npm test
```

## License

MIT

## Support

- [Documentation](docs/README.md)
- [Issue Tracker](../../issues)
- [Discussions](../../discussions)
