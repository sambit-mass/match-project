export const environment = {
  production: true,
  host: 'https://dev-api.matchbyai.com/v1',
  host_ai: 'https://dev-api-ai.matchbyai.com/v1',
  socketConnect: 'https://dev-chat.matchbyai.com',
  encryption: {
    encryptedRequest: false,
    CRYPTO_JS_KEY: 'TXRZ3jThBP2dWnUN',
    CRYPTO_JS_IV: '256e51ec9e69k729',
    CRYPTO_ALGORITHM: 'AES-CBC',
    CRYPTO_KEY_HEX: 'D3F2DE95CF76D2F4E3EFF80CC8DA72DBA1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6', // 32 bytes (64 hex chars)
    CRYPTO_IV_HEX: '6520AABD51D807F3AABBCCDD11223344', // 16 bytes (32 hex chars)
  },
};
