import React from 'react';
import {
  Level10Icon,
  Level1Icon,
  Level2Icon,
  Level3Icon,
  Level4Icon,
  Level5Icon,
  Level6Icon,
  Level7Icon,
  Level8Icon,
  Level9Icon,
} from '../common/level_icon';

export const levelColors = [
  '#f7bcbc', // 1
  '#f4ce90', // 2
  '#f7e87c', // 3
  '#B8E58C', // 4
  '#A8CFE5', // 5
  '#6F97C6', // 6
  '#B7B5E5', // 7
  '#FFFFFF', // 8
  '#474747', // 9
  '#FFFFFF', // 10
];

export const getLevelIcon = (level: number, size: number | string) => {
  switch (level) {
    case 1:
      return <Level1Icon size={size} />;
    case 2:
      return <Level2Icon size={size} />;
    case 3:
      return <Level3Icon size={size} />;
    case 4:
      return <Level4Icon size={size} />;
    case 5:
      return <Level5Icon size={size} />;
    case 6:
      return <Level6Icon size={size} />;
    case 7:
      return <Level7Icon size={size} />;
    case 8:
      return <Level8Icon size={size} />;
    case 9:
      return <Level9Icon size={size} />;
    case 10:
      return <Level10Icon size={size} />;
  }
};
