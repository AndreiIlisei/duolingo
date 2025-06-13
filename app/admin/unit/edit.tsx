import { Edit, NumberInput, SimpleForm, TextInput } from "react-admin";
import { required } from "ra-core";

export const UnitEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <NumberInput source="id" validate={[required()]} label="ID" />
        <TextInput source="title" validate={[required()]} label="Title" />
        <TextInput source="description" validate={[required()]} label="Description" />
      </SimpleForm>
    </Edit>
  );
};
