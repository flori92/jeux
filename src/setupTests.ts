import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Augmenter le timeout pour les tests
jest.setTimeout(30000);

// Configurer le testing library
configure({ testIdAttribute: 'data-testid' });
