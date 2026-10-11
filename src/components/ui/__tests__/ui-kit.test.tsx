/// <reference types="jest" />
import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';

import { FilterChip, Pill, TagPill } from '@/components/ui/Chip';
import { Text } from '@/components/ui/Text';

describe('ui-kit', () => {
  it('renders a Text with the requested content', () => {
    const screen = render(<Text variant="titleMd">Hello GDG</Text>);
    expect(screen.getByText('Hello GDG')).toBeTruthy();
  });

  it('renders a muted body paragraph', () => {
    const screen = render(<Text variant="bodySm" muted>Description</Text>);
    expect(screen.getByText('Description')).toBeTruthy();
  });

  it('reflects active state on a FilterChip', () => {
    const onPress = jest.fn();
    const screen = render(<FilterChip label="Flutter" active onPress={onPress} />);
    fireEvent.press(screen.getByText('Flutter'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders Pill and TagPill labels', () => {
    const screen = render(
      <>
        <Pill label="Core Team" color="primary" />
        <TagPill label="Beginner" color="secondary" />
      </>,
    );
    expect(screen.getByText('Core Team')).toBeTruthy();
    expect(screen.getByText('Beginner')).toBeTruthy();
  });
});