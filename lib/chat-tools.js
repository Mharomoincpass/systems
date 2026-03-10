/**
 * Chat tool definitions, agentic system prompt, and tool-call parser.
 * The LLM uses <tool_call> markers to invoke generation tools.
 */

export const CHAT_TOOLS = {
  generate_image: {
    name: 'generate_image',
    description: 'Generate an AI image from a text description. Use when the user asks you to create, draw, generate, or make an image, picture, photo, illustration, artwork, etc.',
    parameters: {
      prompt: { type: 'string', required: true, description: 'Detailed visual description of the image to generate' },
      width: { type: 'number', required: false, description: 'Image width in pixels (default: 1024)' },
      height: { type: 'number', required: false, description: 'Image height in pixels (default: 1024)' },
      model: { type: 'string', required: false, description: 'Model to use: flux (default), gptimage, imagen-4' },
    },
  },
  generate_video: {
    name: 'generate_video',
    description: 'Generate an AI video from a text description. Use when the user asks you to create or make a video, animation, clip, or animate an image.',
    parameters: {
      prompt: { type: 'string', required: true, description: 'Description of the video scene, motion, and action' },
      imageUrl: { type: 'string', required: false, description: 'Optional. URL of an image to animate into a video. If the user attached an image or asks you to animate a previously generated image, extract its URL here.' },
      duration: { type: 'number', required: false, description: 'Video duration in seconds, 2-10 (default: 5)' },
      aspectRatio: { type: 'string', required: false, description: 'Aspect ratio: "16:9" (landscape) or "9:16" (portrait). Default: "16:9"' },
    },
  },
  generate_music: {
    name: 'generate_music',
    description: 'Generate AI music from a description. Use when the user asks you to create, compose, or make music, a beat, a song, a track, or background audio.',
    parameters: {
      prompt: { type: 'string', required: true, description: 'Description of music style, mood, instruments, tempo, genre' },
      duration: { type: 'number', required: false, description: 'Duration in seconds, 5-60 (default: 30)' },
    },
  },
  generate_tts: {
    name: 'generate_tts',
    description: 'Convert text to speech audio. Use when the user asks you to read text aloud, speak, narrate, convert text to audio/voice, or do text-to-speech.',
    parameters: {
      text: { type: 'string', required: true, description: 'The text to convert to speech (max 5000 chars)' },
      voice: { type: 'string', required: false, description: 'Voice to use (default: "rachel")' },
    },
  },
  transcribe_audio: {
    name: 'transcribe_audio',
    description: 'Transcribe audio to text using AI. Use when the user asks you to transcribe, convert audio/speech to text, or recognize speech from a URL.',
    parameters: {
      audioUrl: { type: 'string', required: true, description: 'Publicly accessible URL of the audio file' },
    },
  },
}

function buildToolDescriptions() {
  return Object.values(CHAT_TOOLS)
    .map((tool) => {
      const params = Object.entries(tool.parameters)
        .map(([name, spec]) => `  - ${name} (${spec.type}${spec.required ? ', required' : ', optional'}): ${spec.description}`)
        .join('\n')
      return `### ${tool.name}\n${tool.description}\nParameters:\n${params}`
    })
    .join('\n\n')
}

export function getAgenticSystemPrompt() {
  return `You are Mharomo AI, a helpful and creative assistant with the ability to generate media.
You can generate images, videos, music, text-to-speech audio, and transcribe audio.

When the user asks you to create or generate media, you MUST use the appropriate tool by outputting a tool call block.
When the user is just asking questions, chatting, or not requesting media generation, respond normally with text only — do NOT call any tool.

## Available Tools

${buildToolDescriptions()}

## How to call a tool

When you decide to use a tool, output EXACTLY this format (no extra whitespace before/after the tags):

<tool_call>{"tool":"tool_name","params":{"param1":"value1","param2":"value2"}}</tool_call>

Rules:
1. You may include a brief text message BEFORE the tool call to tell the user what you're doing.
2. Do NOT include text AFTER the tool call — the system will show the result automatically.
3. Only call ONE tool per response.
4. The JSON inside <tool_call> must be valid JSON with double-quoted keys. Do not use markdown code blocks around it.
5. For image generation, write a detailed, descriptive prompt that captures exactly what the user wants. Expand brief requests into rich visual descriptions.
6. For music, describe the genre, mood, instruments, and tempo clearly.
7. For TTS, use the user's exact text or craft appropriate spoken text.
8. If the user is vague about what they want, ask a clarifying question instead of guessing. But if their intent is clear (e.g., "make me a sunset image"), proceed with the tool call.
9. Do NOT call tools when the user is asking about your capabilities, how generation works, or just chatting.

## Context about previously generated media
If a message contains [Generated image: ...], [Generated video: ...], [Generated music: ...], or [Generated audio: ...], those are media you previously created in this conversation. You can reference them naturally.`
}

/**
 * Parse the accumulated LLM response text for <tool_call>...</tool_call> markers.
 * Returns { textBefore, toolCall, textAfter } or null if no tool call found.
 */
export function parseToolCall(text) {
  const regex = /<tool_call>\s*(\{[\s\S]*?\})\s*<\/tool_call>/
  const match = text.match(regex)
  if (!match) return null

  const textBefore = text.substring(0, match.index).trim()
  const textAfter = text.substring(match.index + match[0].length).trim()

  try {
    const parsed = JSON.parse(match[1])
    const toolName = parsed.tool
    const params = parsed.params || {}

    if (!CHAT_TOOLS[toolName]) {
      return null // Unknown tool — treat as regular text
    }

    return { textBefore, toolCall: { tool: toolName, params }, textAfter }
  } catch {
    return null // Invalid JSON — treat as regular text
  }
}
