"use client";

import {
  Create,
  NumberInput,
  ReferenceInput,
  SimpleForm,
  TextInput,
} from "react-admin";
import { required } from "ra-core";

export const CreateUnit = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="title" validate={[required()]} label="Title" />
        <TextInput
          source="description"
          validate={[required()]}
          label="Description"
        />
        <ReferenceInput source="courseId" reference="courses" />
        <NumberInput source="order" validate={[required()]} label="Order" />
      </SimpleForm>
    </Create>
  );
};
