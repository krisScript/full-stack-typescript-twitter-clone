import axios from 'axios';
import Tweet from 'types/Tweet';
import Notification from 'types/Notification';

const getTweets = async (
  url: string,
  setNotification: (notification: Notification) => void,
  token?: string,
  // @ts-ignore
): Promise<{
  newTweets: Tweet[];
  next: string | null;
  prev: string | null;
}> => {
  try {
    console.log(url, token);
    const config = token
      ? {
          headers: { Authorization: `bearer ${token}` },
        }
      : {};
    const response = await axios.get(url, config);
    console.log(response);
    const { links, tweets } = response.data.data;
    const { next, prev } = links;
    return { newTweets: tweets, next, prev };
  } catch (error) {
    const notification: Notification = {
      type: 'warning',
      content: 'There was an error. Please try again later.',
    };
    setNotification(notification);
  }
};

export default getTweets;
