/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  BooleanInput,
  Create,
  ReferenceInput,
  SimpleForm,
  TextInput,
  ImageInput,
  ImageField,
  FileInput,
  FileField,
} from "react-admin";
import { required } from "ra-core";

export const CreateChallengeOption = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="text" validate={[required()]} label="Text" />
        <BooleanInput source="correct" label="Correct Option" />
        <ReferenceInput source="challengeId" reference="challenges" />

        <ImageInput
          source="imageSrc"
          label="Upload Image"
          accept={"image/*" as any}
        >
          <ImageField source="src" title="title" />
        </ImageInput>

        <FileInput
          source="audioSrc"
          label="Upload Audio"
          accept={"audio/*" as any}
        >
          <FileField source="src" title="title" />
        </FileInput>
      </SimpleForm>
    </Create>
  );
};
