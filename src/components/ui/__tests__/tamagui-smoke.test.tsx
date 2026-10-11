import { render } from '@testing-library/react-native';
import { TamaguiProvider, Text, XStack, YStack } from 'tamagui';

import { tamaguiConfig } from '../../../../tamagui.config';
import { light } from '../../../../src/theme/colors';

test('resolves app theme and spacing tokens into styles', () => {
  const { toJSON } = render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <YStack backgroundColor="surfaceContainerLow" width={10} height={10}>
        <XStack gap="sm">
          <Text color="primary">hi</Text>
        </XStack>
      </YStack>
    </TamaguiProvider>,
  );

  const json = JSON.stringify(toJSON());
  expect(json).toContain(light.surfaceContainerLow);
  expect(json).toContain(light.primary);
});
