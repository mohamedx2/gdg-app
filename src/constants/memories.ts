import type { ImageSourcePropType } from 'react-native';

export interface Memory {
  id: string;
  source: ImageSourcePropType;
  caption: string;
  /** Portrait shots span a taller tile in the gallery. */
  portrait: boolean;
}

/** Photos from past chapter moments, bundled with the app. */
export const MEMORIES: Memory[] = [
  { id: 'm01', source: require('../../assets/images/memories/memory-01.jpg'), caption: 'Core team on campus', portrait: false },
  { id: 'm12', source: require('../../assets/images/memories/memory-12.jpg'), caption: 'Our stand — and the award', portrait: false },
  { id: 'm06', source: require('../../assets/images/memories/memory-06.jpg'), caption: 'The “Thank You” fingerprint board', portrait: true },
  { id: 'm03', source: require('../../assets/images/memories/memory-03.jpg'), caption: 'Team day at EPI', portrait: false },
  { id: 'm05', source: require('../../assets/images/memories/memory-05.jpg'), caption: 'GDG crew at the club fair', portrait: true },
  { id: 'm08', source: require('../../assets/images/memories/memory-08.jpg'), caption: 'All together', portrait: true },
  { id: 'm04', source: require('../../assets/images/memories/memory-04.jpg'), caption: 'Holding the trophy', portrait: false },
  { id: 'm02', source: require('../../assets/images/memories/memory-02.jpg'), caption: 'One more selfie', portrait: false },
  { id: 'm07', source: require('../../assets/images/memories/memory-07.jpg'), caption: 'Every fingerprint, a member', portrait: true },
  { id: 'm10', source: require('../../assets/images/memories/memory-10.jpg'), caption: 'Club fair vibes', portrait: false },
  { id: 'm13', source: require('../../assets/images/memories/memory-13.jpg'), caption: 'Badges on', portrait: false },
  { id: 'm11', source: require('../../assets/images/memories/memory-11.jpg'), caption: 'The full stand team', portrait: true },
  { id: 'm09', source: require('../../assets/images/memories/memory-09.jpg'), caption: 'Group photo', portrait: true },
];
