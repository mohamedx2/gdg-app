import { render } from '@testing-library/react-native';
import { TamaguiProvider, View } from 'tamagui';

import { tamaguiConfig } from '../../../../tamagui.config';

test('renders a Tamagui view', () => {
  const { toJSON } = render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <View width={10} height={10} backgroundColor="#000000" />
    </TamaguiProvider>,
  );
  expect(toJSON()).toBeTruthy();
});
