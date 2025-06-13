"use client";

import {
  Create,
  NumberInput,
  ReferenceInput,
  SimpleForm,
  TextInput,
} from "react-admin";
import { required } from "ra-core";

export const CreateLesson = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="title" validate={[required()]} label="Title" />
        <ReferenceInput source="unitId" reference="units" />
        <NumberInput source="order" validate={[required()]} label="Order" />
      </SimpleForm>
    </Create>
  );
};
