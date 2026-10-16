export const DEFAULT_WHATSAPP_FLOW = {
  settings: {
    botName: "FrsionOS",
    welcomeMessage:
      "Hi — I'm FrsionOS on WhatsApp. Send a prompt for an image, or /voice for a voice note. Reply help anytime.",
    sendWelcomeOnce: true,
    imageEnabled: true,
    voiceEnabled: true,
    helpText: `FrsionOS WhatsApp

• Plain text → image (Pollinations)
• /image your prompt
• /voice your text → ElevenLabs voice note
• help — this message`,
  },
  rules: [
    {
      id: "help",
      label: "Help",
      matchType: "exact",
      match: "help",
      action: "help",
    },
    {
      id: "voice",
      label: "Voice command",
      matchType: "prefix",
      match: "/voice",
      action: "voice",
    },
    {
      id: "image-cmd",
      label: "Image command",
      matchType: "prefix",
      match: "/image",
      action: "image",
    },
    {
      id: "default-image",
      label: "Default",
      matchType: "default",
      match: "*",
      action: "image",
    },
  ],
};
