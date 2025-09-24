/**
 * ProductConfigurationForm - Refactored Entry Point
 * Original: 688 lines
 * Refactored: Multiple modules < 300 lines each
 */

// Re-export refactored modules
export * from './ProductConfigurationForm-refactored/misc';
export * from './ProductConfigurationForm-refactored/component';

// Main export (if component file)
import MainComponent from './ProductConfigurationForm-refactored/component';
export default MainComponent;
