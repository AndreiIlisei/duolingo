"use client";

import {
  BooleanInput,
  Edit,
  ReferenceInput,
  SimpleForm,
  TextInput,
} from "react-admin";
import { required } from "ra-core";

export const EditChallengeOption = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="text" validate={[required()]} label="Text" />
        <BooleanInput source="correct" label="Correct Option" />
        <ReferenceInput source="challengeId" reference="challenges" />
        <TextInput source="imageSrc" label="Image URL" />
        <TextInput source="audioSrc" label="Audio URL" />
      </SimpleForm>
    </Edit>
  );
};
