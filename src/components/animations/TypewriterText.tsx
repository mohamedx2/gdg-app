import React, { memo, useEffect, useRef, useState } from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { Text, type TextProps } from '@/components/ui/Text';

interface TypewriterTextProps {
  text: string;
  /** Milliseconds per character. */
  speed?: number;
  startDelay?: number;
  cursor?: boolean;
  variant?: TextProps['variant'];
  color?: TextProps['color'];
  weight?: TextProps['weight'];
  muted?: boolean;
  primary?: boolean;
  style?: StyleProp<TextStyle>;
  onDone?: () => void;
}

/** Reveals text one character at a time; instant under reduced motion. */
export const TypewriterText = memo(function TypewriterText({
  text,
  speed = 40,
  startDelay = 0,
  cursor,
  variant = 'bodyMd',
  color,
  weight,
  muted,
  primary,
  style,
  onDone,
}: TypewriterTextProps) {
  const reduceMotion = useReducedMotion();
  const [count, setCount] = useState(text.length);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (reduceMotion) {
      setCount(text.length);
      onDoneRef.current?.();
      return;
    }
    setCount(0);
    let index = 0;
    let interval: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      interval = setInterval(() => {
        index += 1;
        setCount(index);
        if (index >= text.length) {
          if (interval) clearInterval(interval);
          onDoneRef.current?.();
        }
      }, speed);
    }, startDelay);
    return () => {
      clearTimeout(start);
      if (interval) clearInterval(interval);
    };
  }, [text, speed, startDelay, reduceMotion]);

  return (
    <Text
      variant={variant}
      color={color}
      weight={weight}
      muted={muted}
      primary={primary}
      style={style}
    >
      {text.slice(0, count)}
      {cursor && count < text.length ? '▋' : ''}
    </Text>
  );
});
