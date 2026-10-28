import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import First from '../first';

// @ts-ignore
describe('Page', () => {
  // @ts-ignore
  it('renders a heading', () => {
    render(<First />);

    const heading = screen.queryByRole('heading', { level: 1 });

    // Use Jest assertion to fail the test with a message if the heading is not found
    // @ts-ignore
    expect(heading).toBeInTheDocument();

    // Optional: Log a message to the console for additional context
    if (!heading) {
      console.error('Heading with level 1 was not found in the document.');
    }
  });
});
