export function handlePollApi(apiKey) {
  return {
    async checkCredits() {
      try {
        const response = await fetch('/api/pollinations/balance')
        const data = await response.json()
        return data
      } catch (error) {
        return { error: 'Failed to check balance' }
      }
    },

    async generateImage({ prompt, model = 'flux', width = 1024, height = 1024 }) {
      try {
        const encodedPrompt = encodeURIComponent(prompt)
        const url = `https://gen.pollinations.ai/image?prompt=${encodedPrompt}&model=${model}&width=${width}&height=${height}`
        
        const response = await fetch(url)
        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('Rate limited. Please try again later.')
          }
          throw new Error(`Generation failed: ${response.statusText}`)
        }
        
        const blob = await response.blob()
        return {
          success: true,
          imageUrl: URL.createObjectURL(blob),
          blob,
        }
      } catch (error) {
        return {
          success: false,
          error: error.message || 'Failed to generate image',
        }
      }
    },

    async generateVideo({ imageUrl, prompt, model = 'LTX-2' }) {
      try {
        const response = await fetch('/api/videos/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl, prompt, model }),
        })

        if (!response.ok) {
          const data = await response.json()
          if (response.status === 402) {
            throw new Error('Insufficient credits. Please add more credits.')
          }
          throw new Error(data.error || `Generation failed: ${response.statusText}`)
        }

        return await response.json()
      } catch (error) {
        return {
          success: false,
          error: error.message || 'Failed to generate video',
        }
      }
    },

    async generateMusic({ prompt, duration = 30 }) {
      try {
        const encodedPrompt = encodeURIComponent(prompt)
        const url = `https://gen.pollinations.ai/music?prompt=${encodedPrompt}&duration=${duration}&model=elevenmusic`
        
        const response = await fetch(url)
        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('Rate limited. Please try again later.')
          }
          throw new Error(`Generation failed: ${response.statusText}`)
        }

        const blob = await response.blob()
        return {
          success: true,
          audioUrl: URL.createObjectURL(blob),
          blob,
        }
      } catch (error) {
        return {
          success: false,
          error: error.message || 'Failed to generate music',
        }
      }
    },

    async transcribeAudio(file) {
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/audio/transcribe', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          if (response.status === 402) {
            throw new Error('Insufficient credits for transcription.')
          }
          throw new Error(`Transcription failed: ${response.statusText}`)
        }

        return await response.json()
      } catch (error) {
        return {
          success: false,
          error: error.message || 'Failed to transcribe audio',
        }
      }
    },

    async synthesizeSpeech({ text, voice = 'alloy', speed = 1.0 }) {
      try {
        const response = await fetch('/api/audio/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, voice, speed }),
        })

        if (!response.ok) {
          if (response.status === 402) {
            throw new Error('Insufficient credits for text-to-speech.')
          }
          throw new Error(`Synthesis failed: ${response.statusText}`)
        }

        const blob = await response.blob()
        return {
          success: true,
          audioUrl: URL.createObjectURL(blob),
          blob,
        }
      } catch (error) {
        return {
          success: false,
          error: error.message || 'Failed to synthesize speech',
        }
      }
    },
  }
}

export function getErrorMessage(error) {
  if (typeof error === 'string') {
    return error
  }
  if (error?.message) {
    return error.message
  }
  if (error?.error) {
    return error.error
  }
  return 'An unexpected error occurred'
}
