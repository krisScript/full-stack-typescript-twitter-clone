import React, { FC, Dispatch, SetStateAction, useEffect, memo } from 'react';
import { FeedBarWrapper, FeedBarButton } from './styled';

interface Feed {
  url: string;
  name: string;
}
interface FeedBarProps {
  feeds: Feed[];
  setUrl: Dispatch<SetStateAction<string>>;
  currentUrl: string;
}
export const FeedBar: FC<FeedBarProps> = ({ feeds, setUrl, currentUrl }) => {
  return (
    <FeedBarWrapper>
      {feeds.map(({ name, url }) => (
        <FeedBarButton
          isActive={currentUrl === url}
          key={url}
          onClick={() => setUrl(url)}
        >
          <span> {name}</span>
        </FeedBarButton>
      ))}
    </FeedBarWrapper>
  );
};

export default memo(FeedBar);
