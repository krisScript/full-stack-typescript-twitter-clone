import React, { FC } from 'react';
import { Formik, Form, FormikValues, FormikActions } from 'formik';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import UserProfileValidator from '@twtr/common/source/schemaValidators/UserProfileValidator';
import ImageInput from 'components/ImageUploadButton';
import Input from 'components/Input';
import StyledForm from 'styled/Form';
import Button from 'styled/Button';
import Logo from 'components/Logo';
import Notification from 'types/Notification';
import transformValidationErrors from 'utilities/transformValidationErrors';
import populateFormData from 'utilities/populateFormData';
import getUrl from 'utilities/getUrl';
import useStores from 'hooks/useStores';
import defaultWarning from 'utilities/defaultWarning';

export const UserForm: FC = () => {
  const history = useHistory();
  const { authStore, notificationStore } = useStores();
  const { user, token } = authStore.authState;
  const submitHandler = async (
    formValues: FormikValues,
    { setErrors }: FormikActions<FormikValues>,
  ): Promise<void> => {
    try {
      const formData = populateFormData(formValues);

      const request = await axios.patch(
        getUrl('/users/user/profile'),
        formData,
        {
          headers: { Authorization: `bearer ${token}` },
        },
      );
      const { user } = request.data.data;
      authStore.updateUser(user);
      const notification: Notification = {
        type: 'message',
        content: 'Changes saved.',
      };
      notificationStore.setNotification(notification);
      history.goBack();
    } catch (error) {
      if (error?.response?.data?.data && Array.isArray(error.response.data)) {
        setErrors(transformValidationErrors(error.response.data.data));
      } else {
        notificationStore.setNotification(defaultWarning);
      }
    }
  };
  return (
    <Formik
      validationSchema={UserProfileValidator}
      initialValues={{
        username: user?.username ? user.username : '',
        handle: user?.handle ? user.handle : '',
        website: user?.website ? user.website : '',
      }}
      onSubmit={submitHandler}
    >
      {({ setFieldValue }) => (
        <Form>
          <StyledForm>
            <Logo type="vertical" />

            <Input name="username" type="text" placeholder="Username" />

            <Input name="handle" type="text" placeholder="Handle" />

            <Input name="website" type="url" placeholder="Website" />
            <ImageInput
              name="avatar"
              setFieldValue={setFieldValue}
              buttonText="Upload avatar photo"
            />

            <ImageInput
              name="cover"
              setFieldValue={setFieldValue}
              buttonText="Upload cover photo"
            />
            <Button buttonType="primary" type="submit">
              Save Changes
            </Button>
          </StyledForm>
        </Form>
      )}
    </Formik>
  );
};

export default UserForm;
