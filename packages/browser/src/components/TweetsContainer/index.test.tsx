import React from 'react';
import { render, wait } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import UserEvent from '@testing-library/user-event';
import getTweets from './getTweets';
import TweetsContainer from './index';
import TestWrapper from 'testUtilities/TestWrapper';
import useIntersection from 'hooks/useIntersection';
import tweet from 'testUtilities/tweet';

jest.mock('hooks/useIntersection');
jest.mock('./getTweets');

const useIntersectionMock = useIntersection as jest.Mock<any>;
const setElement = jest.fn();
useIntersectionMock.mockReturnValue({ setElement });

const getTweetsMock = getTweets as jest.Mock<any>;
getTweetsMock.mockResolvedValue({ newTweets: [tweet], next: null, prev: null });

describe('TweetsContainer', () => {
  const setNotification = jest.fn();
  const setUrl = jest.fn();
  const url = 'url';
  const token = 'token';

  it('render TweetsContainer', async () => {
    expect.assertions(14);

    const { container, getByRole, getByTestId } = render(
      <TweetsContainer
        token={token}
        feeds={[]}
        url={url}
        setNotification={setNotification}
        setUrl={setUrl}
      />,

      {
        wrapper: ({ children }) => <TestWrapper children={children} />,
      },
    );
    await wait(() => {
      expect(getTweets).toHaveBeenCalledTimes(1);
      expect(getTweets).toHaveBeenCalledWith(
        `${url}?sort=new`,
        setNotification,
        token,
      );
    });

    const tweetsFeed = getByRole('feed');
    const tweetElement = getByTestId(tweet._id);
    const sortSelect = getByTestId('sort');

    const options = ['trending', 'new', 'top', 'replies'];

    options.forEach(option => {
      const sortOption = getByTestId(option) as HTMLOptionElement;

      UserEvent.selectOptions(sortSelect, option);
      expect(sortOption.selected).toBe(true);
      expect(getTweets).toHaveBeenCalledWith(
        `${url}?sort=${option}`,
        setNotification,
        token,
      );
    });
    expect(getTweets).toHaveBeenCalledTimes(5);
    expect(tweetsFeed.childElementCount).toBe(1);
    expect(tweetElement).toBeTruthy();
    expect(container).toBeTruthy();
  });
});
