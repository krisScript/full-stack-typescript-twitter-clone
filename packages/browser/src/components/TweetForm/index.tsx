import React, { FC, useEffect, useState, SyntheticEvent } from 'react';
import TweetValidator from 'validators/TweetValidator';
import { Formik, Form, FormikValues, FormikActions } from 'formik';
import axios from 'axios';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Input from 'components/Input';
import Button from 'styled/Button';
import Avatar from 'components/Avatar/index';
import IconButton from 'styled/IconButton';
import Notification from 'types/Notification';
import ImageInput from 'components/ImageInput';

import populateFormData from 'utilities/populateFormData';
import transformValidationErrors from 'utilities/transformValidationErrors';
import {
  TweetFormWrapper,
  TwButtonButtonContainer,
  ContentButtonsContainer,
  AvatarContainer,
  InputContainer,
} from './styled';

interface TweetFormProps {
  token: string;
  setNotification: (notification: Notification) => void;
}

export const TweetForm: FC<TweetFormProps> = ({ token, setNotification }) => {
  const { replyId, retweetId } = useParams();
  const history = useHistory();
  const location = useLocation();
  const { tweet } = location.state;
  const [type, setType] = useState<'text' | 'link' | 'retweet' | 'reply'>(
    tweet && tweet.type ? tweet.type : 'text',
  );
  const [hasImage, setHasImage] = useState<boolean>(false);
  useEffect(() => {
    if (replyId) {
      setType('reply');
    }
    if (retweetId) {
      setType('retweet');
    }
  }, [replyId, retweetId]);
  const submitHandler = async (
    formValues: FormikValues,
    { setErrors }: FormikActions<FormikValues>,
  ): Promise<void> => {
    try {
      console.log(formValues);
      const formData: FormData = populateFormData({
        ...formValues,
        type,
        retweetId,
        replyId,
      });
      const config = {
        headers: { Authorization: `bearer ${token}` },
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
      {({ setFieldValue }) => (
        <Form>
          <TweetFormWrapper>
            <AvatarContainer>
              <Avatar />
            </AvatarContainer>
            <InputContainer>
              <Input
                component="textarea"
                name="text"
                type="text"
                placeholder="Text"
              />
              {hasImage ? (
                <ImageInput name="image" setFieldValue={setFieldValue} />
              ) : (
                ''
              )}

              {type === 'link' ? (
                <Input name="linkUrl" type="text" placeholder="Link" />
              ) : (
                ''
              )}
            </InputContainer>

            <ContentButtonsContainer>
              <IconButton
                type="button"
                onClick={() => {
                  setHasImage(!hasImage);
                  setFieldValue('image', undefined);
                }}
              >
                <FontAwesomeIcon icon="image" />
              </IconButton>
              <IconButton
                data-testid="link-button"
                type="button"
                onClick={(e: SyntheticEvent) => {
                  e.preventDefault();
                  setType(type === 'link' ? 'text' : 'link');
                }}
              >
                <FontAwesomeIcon icon="link" />
              </IconButton>
            </ContentButtonsContainer>

            <TwButtonButtonContainer>
              <Button buttonType="primary" type="submit">
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
