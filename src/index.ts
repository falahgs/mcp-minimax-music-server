import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
  CallToolRequest,
} from "@modelcontextprotocol/sdk/types.js";
import fetch from 'node-fetch';

interface AudioGenerationParams {
  model?: string;
  reference_audio_url?: string;
  prompt: string;
  api_key: string;
  generation_id?: string;
}

interface GenerationPayload {
  model: string;
  prompt: string;
  reference_audio_url?: string;
}

interface GenerationResponse {
  status: string;
  id: string;
  audio_file?: {
    url: string;
    content_type: string;
    file_name: string;
    file_size: number;
  };
  error?: string;
}

const server = new Server({
  name: "minimax-music-server",
  version: "1.0.0",
}, {
  capabilities: {
    tools: {}
  }
});

// Define the audio generation tool
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [{
      name: "generate_audio",
      description: "Generate audio using AIML API. The process has two steps: 1) Submit generation request 2) Get the generated audio. If generation_id is not provided, it will start a new generation.",
      inputSchema: {
        type: "object",
        properties: {
          model: {
            type: "string",
            description: "The model to use for generation (stable-audio or minimax-music)",
            default: "minimax-music"
          },
          reference_audio_url: {
            type: "string",
            description: "URL of the reference audio (required for minimax-music)",
            default: "https://tand-dev.github.io/audio-hosting/spinning-head-271171.mp3"
          },
          prompt: {
            type: "string",
            description: "The text prompt for audio generation. For minimax-music, wrap lyrics in ##...##"
          },
          api_key: {
            type: "string",
            description: "Your AIML API Key (optional if set in environment variables)"
          },
          generation_id: {
            type: "string",
            description: "Optional: The generation ID from a previous request to check status"
          }
        },
        required: ["prompt"]
      }
    }]
  };
});

async function checkGenerationStatus(generationId: string, apiKey: string): Promise<GenerationResponse> {
  const url = "https://api.aimlapi.com/v2/generate/audio";
  const response = await fetch(`${url}?generation_id=${generationId}`, {
    method: 'GET',
    headers: {
      'Authorization': apiKey.startsWith('Bearer ') ? apiKey : `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new McpError(
      ErrorCode.InvalidRequest,
      `Failed to check generation status: HTTP ${response.status}`
    );
  }

  const data = await response.json();
  if (!data || typeof data !== 'object' || !('status' in data) || !('id' in data)) {
    throw new McpError(ErrorCode.InvalidRequest, 'Invalid response format from server');
  }
  
  return data as GenerationResponse;
}

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  if (request.params.name === "generate_audio") {
    try {
      const args = request.params.arguments;
      if (!args || typeof args !== 'object' || !('prompt' in args)) {
        throw new McpError(ErrorCode.InvalidRequest, "Missing required parameter: prompt");
      }

      const apiKey = args.api_key ? String(args.api_key) : process.env.AIML_API_KEY;
      if (!apiKey) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          "API key not found. Please provide it in claude_desktop_config.json or as a parameter"
        );
      }

      const params: AudioGenerationParams = {
        prompt: String(args.prompt),
        api_key: apiKey,
        model: args.model ? String(args.model) : "minimax-music",
        reference_audio_url: args.reference_audio_url ? String(args.reference_audio_url) : undefined,
        generation_id: args.generation_id ? String(args.generation_id) : undefined
      };

      if (params.generation_id) {
        const status = await checkGenerationStatus(params.generation_id, params.api_key);
        return { toolResult: status };
      }

      const url = "https://api.aimlapi.com/v2/generate/audio";
      
      if (params.model === "minimax-music" && !params.prompt.startsWith("##")) {
        params.prompt = `##${params.prompt}##`;
      }

      const payload: GenerationPayload = {
        model: params.model || "minimax-music",
        prompt: params.prompt
      };

      if (params.model === "minimax-music") {
        payload.reference_audio_url = params.reference_audio_url || 
          "https://tand-dev.github.io/audio-hosting/spinning-head-271171.mp3";
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': params.api_key.startsWith('Bearer ') ? params.api_key : `Bearer ${params.api_key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          `Failed to generate audio: HTTP ${response.status}`
        );
      }

      const data = await response.json();
      if (!data || typeof data !== 'object' || !('status' in data) || !('id' in data)) {
        throw new McpError(ErrorCode.InvalidRequest, 'Invalid response format from server');
      }

      const result = data as GenerationResponse;
      return { 
        toolResult: {
          status: result.status,
          id: result.id,
          message: "Generation started! Use this generation_id to check status in subsequent calls.",
          next_step: "Call this tool again with the same API key and this generation_id to check status."
        }
      };
    } catch (error: unknown) {
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Failed to generate audio: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  throw new McpError(ErrorCode.InvalidRequest, "Tool not found");
});

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport); 