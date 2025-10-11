/**
 * Image Generation Module
 *
 * Exports Google AI Studio image generation capabilities
 * for product photography automation.
 */

export {
  GoogleAIImageGenerator,
  generateProductImage,
  generateCityPostcardImage,
  type ImageGenerationConfig,
  type GenerateImageOptions,
  type ImageGenerationResult,
  type ImageType,
  type CityImageOptions,
} from './google-ai-client'

// Default export for convenience
export { default } from './google-ai-client'
