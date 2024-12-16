# pr-sage

A command-line interface tool that leverages AI to provide intelligent analysis of Pull Requests. PR Sage helps teams maintain code quality by offering automated code review insights, best practices recommendations, and potential issue detection.

## Features

- Deep analysis of Pull Request changes using AI
- Code quality assessment
- Security vulnerability detection
- Best practices recommendations
- Integration with major Git platforms
- Customizable rules and thresholds
- CI/CD pipeline integration support

## Installation

```bash
npm install -g pr-sage
```

## Quick Start

```bash
pr-sage analyze <pull-request-url>
```

## Requirements

- Node.js >= 18
- Git
- Valid API credentials for your Git platform

## Configuration

Create a `.prsagerc` file in your project root or use command line options:

```json
{
  "gitProvider": "github",
  "apiToken": "<your-token>",
  "customRules": []
}
```

## Commands

### analyze
Performs a comprehensive analysis of a pull request:
```bash
pr-sage analyze <pull-request-url> [options]
```

### configure
Sets up or updates your configuration:
```bash
pr-sage configure
```

### validate
Validates your current configuration:
```bash
pr-sage validate
```

## Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| gitProvider | Git platform provider (github, gitlab, bitbucket) | github |
| apiToken | Authentication token for Git platform | - |
| customRules | Array of custom analysis rules | [] |
| maxFiles | Maximum number of files to analyze | 50 |
| excludePaths | Paths to exclude from analysis | [] |

## Environment Variables

- `PRSAGE_TOKEN`: Git platform API token
- `PRSAGE_PROVIDER`: Git platform provider
- `PRSAGE_CONFIG_PATH`: Custom path to config file

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Development Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/pr-sage.git
cd pr-sage
```

2. Install dependencies
```bash
npm install
```

3. Create a local configuration file
```bash
cp .prsagerc.example .prsagerc
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
