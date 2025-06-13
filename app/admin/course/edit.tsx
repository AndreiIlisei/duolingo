import { Edit, SimpleForm, TextInput } from "react-admin";
import { required } from "ra-core";

export const CourseEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="id" validate={[required()]} label="ID" />
        <TextInput source="title" validate={[required()]} label="Title" />
        <TextInput source="imageSrc" validate={[required()]} label="Image" />
      </SimpleForm>
    </Edit>
  );
};
