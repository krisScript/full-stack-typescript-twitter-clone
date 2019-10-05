import React, { FC, memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { StyledAvatar, IconContainer } from './styled';

interface AvatarProps {
  avatarURL?: string;
  size?: 'small' | 'large';
  altText?: string;
}
export const Avatar: FC<AvatarProps> = ({
  avatarURL,
  size = 'small',
  altText = 'avatar',
}) => {
  return (
    <StyledAvatar size={size}>
      {avatarURL ? (
        <img src={avatarURL} alt={altText} />
      ) : (
        <IconContainer size={size}>
          <FontAwesomeIcon icon="user-circle" />
        </IconContainer>
      )}
    </StyledAvatar>
  );
};

export default memo(Avatar);
