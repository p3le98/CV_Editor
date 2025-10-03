import "@testing-library/jest-dom";

// Mock window.URL.createObjectURL
window.URL.createObjectURL = jest.fn();

// Mock window.URL.revokeObjectURL
window.URL.revokeObjectURL = jest.fn();
