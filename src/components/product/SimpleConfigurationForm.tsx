/**
 * SimpleConfigurationForm - Refactored Entry Point
 * Original: 1052 lines
 * Refactored: Multiple modules < 300 lines each
 */

// Re-export refactored modules
export * from './SimpleConfigurationForm-refactored/misc';
export * from './SimpleConfigurationForm-refactored/component';

// Main export (if component file)
import MainComponent from './SimpleConfigurationForm-refactored/component';
export default MainComponent;
