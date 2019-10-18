import styled from 'styled-components';
import { setLightness } from 'polished';
export const TweetsWrapper = styled('section')`
  width: 100vw;
  display: grid;
  grid:
    '. select . ' auto
    'tweets tweets tweets' minmax(100vh, auto)
    'loader loader loader' auto/
    0.1rem 5rem 1fr;
  grid-gap: 1rem;
  padding-top: 1rem;
  background: ${props => props.theme.background};
  @media ${props => props.theme.mediaQueries.tablet} {
    width: 80vw;
    margin-top: 1rem;
    ${props => props.theme.mixins.border}
    border-radius:1rem;
  }
  @media ${props => props.theme.mediaQueries.desktop} {
    width: 60rem;
  }
`;
export const Tweets = styled('div')`
  grid-area: tweets;
  width: 100%;
`;

export const TextLoader = styled('div')`
  grid-area: loader;
  ${props => props.theme.mixins.center};
  p {
    font-weight: bold;
    text-align: center;
    font-size: 1.7rem;
    color: ${props => props.theme.secondary};
  }
`;
export const Select = styled('select')`
  grid-area: select;
  ${props => props.theme.mixins.button};
  ${props => props.theme.mixins.center};
  display: block;
  text-align: center;
  text-align-last: center;
  background: ${props =>
    props.theme.theme === 'light'
      ? props.theme.secondary
      : setLightness(0.3, props.theme.secondary)};
  color: ${props =>
    props.theme.theme === 'light'
      ? setLightness(0.8, props.theme.secondary)
      : props.theme.secondary};
  border-radius: 3rem;
  font-size: 1.2rem;
  font-weight: bold;
  padding: 0.3rem 0.5rem 0.3rem 0.5rem;
  appearance: none;
`;
