// Global test setup
// Mock the transformers library to avoid ES module issues in Jest

// Note: In ESM mode, we need to use globalThis for jest mock
const mockPipeline = jest.fn().mockResolvedValue(
  jest.fn().mockResolvedValue({
    data: new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5]) // Mock embedding vector
  })
);

jest.mock('@xenova/transformers', () => ({
  pipeline: mockPipeline,
}));