import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Tweet from '@models/Tweet';
import { getTweetById } from '@services/tweetServices';
import passErrorToNext from '@utilities/passErrorToNext';
import isAuthorized from '@utilities/isAuthorized';
import deleteFile from '@utilities/deleteFile';
import getSortString from '@utilities/getSortString';
import includesObjectId from '@utilities/includesObjectId';
import removeObjectIdFromArr from '@utilities/removeObjectIdFromArr';
import { getUserById } from '@services/userServices';
import ValidationError from '@twtr/common/source/types/ValidationError';
import { CustomError, errors } from '@utilities/CustomError';

export const postTweet = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { text, linkUrl, type, retweetId, replyId } = req.body;
    const { userId } = req;

    const user = await getUserById(userId);

    const tweet = new Tweet({
      text,
      user: userId,
      type,
      link: linkUrl,
    });
    if (req.file) {
      tweet.image = req.file.path;
    }

    if (retweetId) {
      const retweetedTweet = await getTweetById(retweetId);
      tweet.retweet = retweetId;
      if (includesObjectId(user.retweets, retweetId)) {
        user.retweets = removeObjectIdFromArr(user.retweets, retweetId);
        retweetedTweet.retweets -= 1;
        user.retweets = [...user.retweets, mongoose.Types.ObjectId(retweetId)];
        retweetedTweet.retweets += 1;
      } else {
        user.retweets = [...user.retweets, mongoose.Types.ObjectId(retweetId)];
        retweetedTweet.retweets += 1;
      }
      await retweetedTweet.save();
    }
    if (replyId) {
      const replyTweet = await getTweetById(replyId);
      tweet.reply = replyId;
      if (includesObjectId(user.replies, replyId)) {
        user.replies = removeObjectIdFromArr(user.replies, replyId);
        replyTweet.replies -= 1;
        user.replies = [...user.replies, mongoose.Types.ObjectId(replyId)];
        replyTweet.replies += 1;
      } else {
        user.replies = [...user.replies, mongoose.Types.ObjectId(replyId)];
        replyTweet.replies += 1;
      }
      await replyTweet.save();
    }

    await tweet.save();
    await user.save();
    const tweetId = tweet._id;
    res.status(200).json({ data: { tweetId } });
  } catch (err) {
    passErrorToNext(err, next);
  }
};

export const updateTweet = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { tweetId } = req.params;
    const { userId } = req;
    const tweet = await getTweetById(tweetId);
    const { text, linkUrl } = req.body;
    isAuthorized(tweet.user.toString(), userId);

    tweet.text = text;
    tweet.link = linkUrl;
    if (tweet.image) {
      if (!req.file) {
        const errorData: ValidationError[] = [
          {
            name: 'image',
            message: 'Upload an image',
          },
        ];
        const { status, message } = errors.BadRequest;
        const error = new CustomError(status, message, errorData);
        throw error;
      }
      await deleteFile(tweet.image);
      tweet.image = req.file.path;
    }
    await tweet.save();
    res.sendStatus(204);
  } catch (err) {
    passErrorToNext(err, next);
  }
};

export const deleteTweet = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { tweetId } = req.params;
    const { userId } = req;
    const tweet = await getTweetById(tweetId);
    isAuthorized(tweet.user.toString(), userId);
    if (tweet.image) {
      await deleteFile(tweet.image);
    }
    await tweet.remove();
    res.sendStatus(204);
  } catch (err) {
    passErrorToNext(err, next);
  }
};

export const getTweet = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { tweetId } = req.params;
    const tweet = await getTweetById(tweetId);
    const populatedTweet = await tweet
      .populate([
        { path: 'user', select: 'username handle' },
        { path: 'reply', select: 'user' },
        { path: 'retweet' },
      ])
      .execPopulate();
    res.status(200).json({ data: { tweet: populatedTweet } });
  } catch (err) {
    passErrorToNext(err, next);
  }
};

export const getAllTweets = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const sort = req.query.sort || 'top';
    const limit = parseInt(req.query.limit, 10) || 25;
    const page = parseInt(req.query.page, 10) || 1;
    const { SERVER_URL } = process.env;
    const sortString = getSortString(sort);
    const tweets = await Tweet.countDocuments()
      .find()
      .sort(sortString)
      .skip((page - 1) * limit)
      .limit(limit);
    const tweetsCount = (await Tweet.countDocuments()) - page * limit;
    const links: { next: null | string; prev: null | string } = {
      next: null,
      prev: null,
    };
    if (tweetsCount > 0) {
      links.next = `${SERVER_URL}/tweets?page=${page +
        1}&limit=${limit}&sort=${sort}`;
    }
    if (page > 1) {
      links.prev = `${SERVER_URL}/tweets?page=${page -
        1}&limit=${limit}&sort=${sort}`;
    }
    res.status(200).json({ data: { tweets, links } });
  } catch (err) {
    passErrorToNext(err, next);
  }
};

export const getUserTweets = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { userId } = req.params;
    const sort = req.query.sort || 'top';
    const limit = parseInt(req.query.limit, 10) || 25;
    const page = parseInt(req.query.page, 10) || 1;
    const { SERVER_URL } = process.env;
    const sortString = getSortString(sort);
    const tweets = await Tweet.countDocuments()
      .find({ user: userId })
      .sort(sortString)
      .skip((page - 1) * limit)
      .limit(limit);
    const tweetsCount = (await Tweet.countDocuments()) - page * limit;
    const links: { next: null | string; prev: null | string } = {
      next: null,
      prev: null,
    };
    if (tweetsCount > 0) {
      links.next = `${SERVER_URL}/users/${userId}/tweets?page=${page +
        1}&limit=${limit}&sort=${sort}`;
    }
    if (page > 1) {
      links.prev = `${SERVER_URL}/users/${userId}/tweets?page=${page -
        1}&limit=${limit}&sort=${sort}`;
    }
    res.status(200).json({ data: { tweets, links } });
  } catch (err) {
    passErrorToNext(err, next);
  }
};

export const getReplies = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { tweetId } = req.params;
    const sort = req.query.sort || 'top';
    const limit = parseInt(req.query.limit, 10) || 25;
    const page = parseInt(req.query.page, 10) || 1;
    const { SERVER_URL } = process.env;
    const sortString = getSortString(sort);
    const tweets = await Tweet.countDocuments()
      .find({ reply: tweetId })
      .sort(sortString)
      .skip((page - 1) * limit)
      .limit(limit);
    const repliesCount = (await Tweet.countDocuments()) - page * limit;
    const links: { next: null | string; prev: null | string } = {
      next: null,
      prev: null,
    };
    if (repliesCount > 0) {
      links.next = `${SERVER_URL}/tweets/${tweetId}/replies?page=${page +
        1}&limit=${limit}&sort=${sort}`;
    }
    if (page > 1) {
      links.prev = `${SERVER_URL}/tweets/${tweetId}/replies?page=${page -
        1}&limit=${limit}&sort=${sort}`;
    }
    res.status(200).json({ data: { tweets, links } });
  } catch (err) {
    passErrorToNext(err, next);
  }
};

export const getUserReplies = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { userId } = req.params;
    const sort = req.query.sort || 'top';
    const limit = parseInt(req.query.limit, 10) || 25;
    const page = parseInt(req.query.page, 10) || 1;
    const { SERVER_URL } = process.env;
    const sortString = getSortString(sort);
    const tweets = await Tweet.countDocuments()
      .find({ user: userId, type: 'reply' })
      .sort(sortString)
      .skip((page - 1) * limit)
      .limit(limit);
    const tweetsCount = (await Tweet.countDocuments()) - page * limit;
    const links: { next: null | string; prev: null | string } = {
      next: null,
      prev: null,
    };
    if (tweetsCount > 0) {
      links.next = `${SERVER_URL}/users/${userId}/replies?page=${page +
        1}&limit=${limit}&sort=${sort}`;
    }
    if (page > 1) {
      links.prev = `${SERVER_URL}/users/${userId}/replies?page=${page -
        1}&limit=${limit}&sort=${sort}`;
    }
    res.status(200).json({ data: { tweets, links } });
  } catch (err) {
    passErrorToNext(err, next);
  }
};
