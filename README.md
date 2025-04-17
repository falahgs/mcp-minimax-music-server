# MCP MiniMax Music Server

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

A Model Context Protocol (MCP) server implementation for AI-powered audio generation using the MiniMax Music API. Developed by Falah.G.Salieh.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

## 🎯 Overview

This MCP server enables AI agents to generate music and audio content using the MiniMax Music API through the Model Context Protocol. It provides seamless integration with MCP hosts like Claude Desktop, allowing AI agents to create music and audio based on text prompts.

## ✨ Features

- AI-powered music generation
- Support for MiniMax Music model
- Two-step generation process with status checking
- Seamless integration with Claude Desktop
- Environment variable support for API keys
- Detailed error handling and reporting

## 🔧 Prerequisites

- Node.js (v16 or higher)
- TypeScript (v5.3.3 or higher)
- Claude Desktop (latest version)
- AIML API Key
- Windows/Linux/macOS operating system

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mcp-minimax-music-server.git
   cd mcp-minimax-music-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the server:
   ```bash
   npm run build
   ```

## ⚙️ Configuration

### Claude Desktop Configuration

1. Locate your Claude Desktop configuration file:
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

2. Add the following configuration:
   ```json
   {
     "mcpServers": {
       "minimax-music-server": {
         "command": "node",
         "args": [
           "G:\\mcp-minimax-music-server\\build\\index.js"
         ],
         "env": {
           "AIML_API_KEY": "Bearer your-aiml-api-key-here"
         }
       }
     }
   }
   ```

   > ⚠️ **Important**: 
   > - Replace the path with your actual server path
   > - Add "Bearer " prefix to your API key
   > - Use double backslashes in Windows paths

### API Key Setup

Your AIML API key can be configured in two ways:

1. **Environment Variables (Recommended)**
   - Set in Claude Desktop config as shown above
   - Prefix with "Bearer " (include the space)
   - Example: `"AIML_API_KEY": "Bearer 3d90d64a000c4e6eb02df7e52d2166d2"`

2. **Direct Configuration**
   - Pass the API key directly in the generation request
   - Less secure, but useful for testing

## 🚀 Usage

### Basic Usage

The server provides a tool called `generate_audio` with the following parameters:

- `prompt` (required): Text prompt for audio generation
- `model` (optional): Set to "minimax-music"
- `reference_audio_url` (optional): URL of reference audio
- `generation_id` (optional): ID from previous generation for status checking

### Example Commands

1. Start new generation:
   ```
   Generate audio with prompt "Create a romantic love song with gentle acoustic guitar and soft vocals"
   ```

2. Check generation status:
   ```
   Generate audio with generation_id "abc123" and prompt "Check status"
   ```

### Response Format

```json
{
  "toolResult": {
    "status": "completed",
    "id": "generation-id",
    "audio_file": {
      "url": "https://cdn.example.com/audio.mp3",
      "content_type": "audio/mpeg",
      "file_name": "output.mp3",
      "file_size": 1024000
    }
  }
}
```

## 📚 API Reference

### MiniMax Music Model

The server uses the MiniMax Music model which:
- Specializes in music generation
- Requires reference audio for style matching
- Supports lyric generation with ## delimiters
- Generates high-quality musical output

### Generation Process

1. **Step 1: Submit Generation**
   - Send prompt and parameters
   - Receive generation ID

2. **Step 2: Check Status**
   - Poll status using generation ID
   - Download audio when complete

## 🔍 Troubleshooting

### Common Issues

1. **Authentication Errors (401)**
   - Verify API key format (should start with "Bearer ")
   - Check API key validity
   - Ensure correct configuration in `claude_desktop_config.json`

2. **Path Issues**
   - Use correct path format for your OS
   - Windows: Use double backslashes
   - Verify build directory exists

3. **Generation Errors**
   - Check prompt format (should be wrapped in ##...## for lyrics)
   - Ensure reference audio URL is accessible
   - Verify prompt length and content

### Debug Steps

1. Rebuild the server:
   ```bash
   npm run build
   ```

2. Restart Claude Desktop

3. Check server logs for errors

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details

## 👤 Author

**Falah.G.Salieh**
- Location: Baghdad, Iraq
- Role: Developer & AI Integration Specialist
- Year: 2025

## 🌟 Support

Need help? Here's how to get support:

1. Check the troubleshooting section
2. Open an issue in the repository
3. Contact the author directly

---

*This project is part of the Model Context Protocol ecosystem, enabling seamless integration between AI agents and external services.* 