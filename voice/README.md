# Mastra Voice Packages

Speech processing and voice interface packages for the Mastra AI framework.

## Overview

This directory contains voice-related packages that provide speech-to-text, text-to-speech, and real-time voice interaction capabilities for Mastra agents and applications.

## Available Packages

### Speech Recognition (STT)
- **[@mastra/voice-deepgram](./deepgram)** - Deepgram speech recognition integration
- **[@mastra/voice-google](./google)** - Google Cloud Speech-to-Text
- **[@mastra/voice-gladia](./gladia)** - Gladia speech processing
- **[@mastra/voice-azure](./azure)** - Azure Speech Services

### Text-to-Speech (TTS)
- **[@mastra/voice-elevenlabs](./elevenlabs)** - ElevenLabs voice synthesis
- **[@mastra/voice-openai](./openai)** - OpenAI text-to-speech
- **[@mastra/voice-murf](./murf)** - Murf AI voice generation
- **[@mastra/voice-speechify](./speechify)** - Speechify voice synthesis
- **[@mastra/voice-playai](./playai)** - PlayAI voice services
- **[@mastra/voice-sarvam](./sarvam)** - Sarvam AI voice synthesis

### Real-time Voice
- **[@mastra/voice-openai-realtime](./openai-realtime)** - OpenAI real-time voice API
- **[@mastra/voice-google-gemini-live](./google-gemini-live)** - Google Gemini Live voice
- **[@mastra/voice-cloudflare](./cloudflare)** - Cloudflare voice processing

## Quick Start

```typescript
import { Agent } from '@mastra/core/agent';
import { OpenAIVoice } from '@mastra/voice-openai';
import { DeepgramSTT } from '@mastra/voice-deepgram';

const agent = new Agent({
  name: 'voice-assistant',
  instructions: 'You are a helpful voice assistant',
  model: openai('gpt-4o'),
  voice: {
    tts: new OpenAIVoice({
      apiKey: process.env.OPENAI_API_KEY,
      voice: 'alloy',
    }),
    stt: new DeepgramSTT({
      apiKey: process.env.DEEPGRAM_API_KEY,
    }),
  },
});
```

## Features

### Speech-to-Text
- Real-time transcription
- Multiple language support
- Custom vocabulary and models
- Streaming and batch processing
- Speaker identification
- Punctuation and formatting

### Text-to-Speech
- High-quality voice synthesis
- Multiple voice options
- Emotion and style control
- SSML support
- Streaming audio generation
- Custom voice cloning

### Real-time Communication
- Bidirectional voice conversations
- Low-latency processing
- WebSocket connections
- Audio streaming
- Interrupt handling
- Context preservation

## Usage Patterns

### Basic Voice Agent

```typescript
import { createVoiceAgent } from '@mastra/core/voice';

const voiceAgent = createVoiceAgent({
  stt: new DeepgramSTT({ apiKey: process.env.DEEPGRAM_API_KEY }),
  tts: new ElevenLabsVoice({ apiKey: process.env.ELEVENLABS_API_KEY }),
  agent: myAgent,
});

// Start voice conversation
await voiceAgent.startConversation({
  inputStream: microphoneStream,
  outputStream: speakerStream,
});
```

### Real-time Voice Streaming

```typescript
import { OpenAIRealtimeVoice } from '@mastra/voice-openai-realtime';

const realtimeVoice = new OpenAIRealtimeVoice({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o-realtime-preview',
});

await realtimeVoice.connect({
  onMessage: (message) => console.log('AI:', message),
  onAudio: (audioData) => playAudio(audioData),
});
```

## Configuration

Each voice package has its own configuration options. Common patterns include:

```typescript
// Environment variables
DEEPGRAM_API_KEY=your_deepgram_key
ELEVENLABS_API_KEY=your_elevenlabs_key
OPENAI_API_KEY=your_openai_key
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json

// Voice settings
const voiceConfig = {
  stt: {
    language: 'en-US',
    model: 'nova-2',
    realtime: true,
  },
  tts: {
    voice: 'rachel',
    model: 'eleven_multilingual_v2',
    stability: 0.5,
    similarityBoost: 0.5,
  },
};
```

## Development

To work with voice packages:

```bash
# Build all voice packages
pnpm build:speech

# Test voice functionality
pnpm test:voice

# Run voice examples
cd examples/voice-assistant
pnpm dev
```

## Requirements

- Node.js 20+
- Valid API keys for chosen voice services
- Audio input/output capabilities (microphone, speakers)
- WebSocket support for real-time features

## Related Documentation

- [Voice Agent Guide](https://mastra.ai/docs/agents/voice)
- [Real-time Voice Tutorial](https://mastra.ai/docs/tutorials/voice-chat)
- [Voice Integration Examples](../examples/)