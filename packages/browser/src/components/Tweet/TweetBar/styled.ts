import styled from 'styled-components';

import { setLightness } from 'polished';

export const TweetBarWrapper = styled('div')`
  grid-area: tweet-bar;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  justify-content: space-evenly;
`;

interface TweetBarButtonProps {
  active?: 'primary' | 'like' | undefined;
}
export const TweetBarButton = styled('button')<TweetBarButtonProps>`
  ${props => props.theme.mixins.button};
  background: none;
  font-size: 1.5rem;
  height: 100%;
  color: ${props => {
    const color = props.active
      ? props.theme[props.active]
      : setLightness(0.5, props.theme.secondary);
    return color;
  }};
  padding: 0.5rem 0 0.5rem 0;
`;
