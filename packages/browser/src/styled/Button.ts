import styled from 'styled-components';

interface ButtonProps {
  buttonType: 'primary' | 'secondary' | 'transparent';
}
export const Button = styled('button')<ButtonProps>`
  height: 2.7rem;
  min-width: 7rem;
  padding: 0 1rem 0 1rem;
  ${props => props.theme.mixins.button};
  font-size: 1.3rem;
  font-weight: bold;
  text-align: center;
  color: ${props => props.theme.white};
  border-radius: 3rem;
  background: ${props => {
    const color = props.theme[props.buttonType];
    return color;
  }};
  :hover {
    background: ${props => props.theme.white};
    color: ${props => {
      const color = props.theme[props.buttonType];
      return color;
    }};
  }
  a {
    color: inherit;
    font-size: inherit;
    text-decoration: none;
    width: 100%;
    height: 100%;
    text-align: center;
  }
`;

export default Button;
