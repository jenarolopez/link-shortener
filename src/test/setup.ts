import { urlMap } from '../db';

beforeEach(() => {
  // Clear all analytics and URL data before each test
  urlMap.clear();
});

afterAll(() => {
  // Cleanup after all tests
  urlMap.clear();
});