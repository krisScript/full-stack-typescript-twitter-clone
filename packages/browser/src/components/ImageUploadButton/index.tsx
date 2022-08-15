/* eslint-disable jsx-a11y/label-has-for */
import React, { FC, SyntheticEvent, useState, useRef } from 'react';
import { ErrorMessage } from 'formik';
import { InputWrapper } from 'components/Input/styled';
import getFile from 'utilities/getFile';
import { UploadButton } from './styled';
import clickHandler from './clickHandler';

interface InputProps {
  name: string;
  setFieldValue: (name: string, value: File) => any;
  buttonText?: string;
}
export const ImageUploadButton: FC<InputProps> = ({
  name,
  setFieldValue,
  buttonText = 'Upload a photo',
}) => {
  const [fileUrl, setFileUrl] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadHandler = (e: SyntheticEvent<HTMLInputElement>) => {
    const { file, fileUrl } = getFile(e);
    setFileUrl(fileUrl);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      console.log(reader.result);
      // @ts-ignore
      setFieldValue(name, reader.result);
    };
  };
  return (
    <InputWrapper>
      {fileUrl ? <img src={fileUrl} alt="" /> : ''}
      <input
        data-testid="input"
        ref={inputRef}
        name={name}
        type="file"
        onChange={uploadHandler}
        hidden
      />
      <UploadButton type="button" onClick={() => clickHandler(inputRef)}>
        {buttonText}
      </UploadButton>
      <ErrorMessage component="label" name={name} />
    </InputWrapper>
  );
};

export default ImageUploadButton;
