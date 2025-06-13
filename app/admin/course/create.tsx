import { Create, SimpleForm, TextInput } from "react-admin";
import { required } from "ra-core";

export const CreateCourse = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="title" validate={[required()]} label="Title" />
        <TextInput source="imageSrc" validate={[required()]} label="Image" />
      </SimpleForm>
    </Create>
  );
};
