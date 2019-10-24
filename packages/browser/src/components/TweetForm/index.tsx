import React, { FC, useEffect, useState, SyntheticEvent } from 'react';
import TweetValidator from 'validators/TweetValidator';
import {
  Formik,
  Form,
  FastField,
  ErrorMessage,
  FormikValues,
  FormikActions,
} from 'formik';
import axios from 'axios';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Input from 'styled/Input';
import Button from 'styled/Button';
import Avatar from 'components/Avatar/index';
import IconButton from 'styled/IconButton';
import Notification from 'types/Notification';
import useFilePicker from 'hooks/useFilePicker/useFilePicker';
import {
  TweetFormWrapper,
  TwButtonButtonContainer,
  ContentButtonsContainer,
  AvatarContainer,
  InputContainer,
} from './styled';
import populateFormData from 'utilities/populateFormData';
import transformValidationErrors from 'utilities/transformValidationErrors';

interface TweetFormProps {
  token: string;
  setNotification: (notification: Notification) => void;
}

export const TweetForm: FC<TweetFormProps> = ({ token, setNotification }) => {
  const { replyId, retweetId } = useParams();
  const params = useParams();
  const history = useHistory();
  const location = useLocation();
  const { tweet } = location.state;
  const [type, setType] = useState<'text' | 'link' | 'retweet' | 'reply'>(
    tweet && tweet.type ? tweet.type : 'text',
  );
  const [hasImage, setHasImage] = useState<boolean>(false);
  const { fileData, fileHandler, resetFileData } = useFilePicker();
  useEffect(() => {
    if (replyId) {
      setType('reply');
    }
    if (retweetId) {
      setType('retweet');
    }
  }, []);
  const submitHandler = async (
    e: FormikValues,
    { setErrors }: FormikActions<FormikValues>,
  ): Promise<void> => {
    try {
      const formData: FormData = populateFormData({
        ...e,
        type,
        retweetId,
        replyId,
      });
      if (fileData && fileData.file) {
        formData.append('image', fileData.file);
      }
      const config = {
        headers: { Authorization: 'bearer ' + token },
      };
      if (tweet) {
        await axios.patch(
          `http://localhost:8090/tweets/${tweet._id}`,
          formData,
          config,
        );
      } else {
        await axios.post('http://localhost:8090/tweets', formData, config);
      }
      history.goBack();
    } catch (error) {
      if (
        error &&
        error.response &&
        error.response.data &&
        Array.isArray(error.response.data)
      ) {
        const { data } = error.response.data;
        const errors = transformValidationErrors(data);
        setErrors(errors);
      } else {
        const notification: Notification = {
          type: 'warning',
          content: 'Something went wrong',
        };
        setNotification(notification);
      }
    }
  };
  return (
    <Formik
      validationSchema={TweetValidator}
      initialValues={{
        text: tweet ? tweet.text : '',
        linkUrl: tweet ? tweet.link : '',
      }}
      onSubmit={submitHandler}
    >
      {() => (
        <Form>
          <TweetFormWrapper>
            <AvatarContainer>
              <Avatar />
            </AvatarContainer>
            <InputContainer>
              <Input>
                <FastField
                  component={'textarea'}
                  name="text"
                  type="text"
                  placeholder="Text"
                />
                <ErrorMessage component="span" name="text" />
              </Input>
              {hasImage ? (
                <Input>
                  {fileData && fileData.fileUrl ? (
                    <img src={fileData.fileUrl} />
                  ) : (
                    ''
                  )}
                  <FastField
                    name="file"
                    type="file"
                    placeholder="Select an image"
                    onChange={(e: SyntheticEvent<HTMLInputElement>) =>
                      fileHandler(e)
                    }
                  />
                  <ErrorMessage component="span" name="file" />
                </Input>
              ) : (
                ''
              )}

              {type === 'link' ? (
                <Input>
                  <FastField name="linkUrl" type="text" placeholder="Link" />
                  <ErrorMessage component="span" name="linkUrl" />
                </Input>
              ) : (
                ''
              )}
            </InputContainer>

            <ContentButtonsContainer>
              <IconButton
                type="button"
                onClick={(e: SyntheticEvent) => {
                  setHasImage(!hasImage);
                  resetFileData();
                }}
              >
                <FontAwesomeIcon icon={'image'} />
              </IconButton>
              <IconButton
                data-testid="link-button"
                type="button"
                onClick={(e: SyntheticEvent) => {
                  e.preventDefault();
                  type === 'link' ? setType('text') : setType('link');
                }}
              >
                <FontAwesomeIcon icon={'link'} />
              </IconButton>
            </ContentButtonsContainer>

            <TwButtonButtonContainer>
              <Button buttonType={'primary'} type="submit">
                Tweet
              </Button>
            </TwButtonButtonContainer>
          </TweetFormWrapper>
        </Form>
      )}
    </Formik>
  );
};

export default TweetForm;
