import React from 'react';
import { render, screen } from '../test-utils';
import Home from '../../pages/index';

describe('HomePage', () => {
    it('should render the heading', () => {
        const textToFind = 'Hello World!';

        render(<Home />);
        const heading = screen.getByText(textToFind);

        expect(heading).toBeInTheDocument();
    });
});
