/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Admin, Resource } from "react-admin";
import simpleRestProvider from "ra-data-simple-rest";

import { CourseList } from "./course/list";
import { CreateCourse } from "./course/create";
import { CourseEdit } from "./course/edit";

import { UnitList } from "./unit/list";
import { CreateUnit } from "./unit/create";
import { UnitEdit } from "./unit/edit";

import { LessonList } from "./lessons/list";
import { CreateLesson } from "./lessons/create";
import { LessonEdit } from "./lessons/edit";

import { ChallengeList } from "./challenge/list";
import { CreateChallenge } from "./challenge/create";
import { ChallengeEdit } from "./challenge/edit";
import { ChallengeOptionList } from "./challengeOption/list";
import { CreateChallengeOption } from "./challengeOption/create";
import { EditChallengeOption } from "./challengeOption/edit";

const baseProvider = simpleRestProvider("/api");

const uploadToCloudinary = async (rawFile: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", rawFile);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  console.log("RES", res);

  const { url } = await res.json();

  console.log("URL", url);
  return url;
};

const dataProvider = {
  ...baseProvider,

  create: async (resource: string, params: any) => {
    const data = { ...params.data };

    console.log("DOES THIS RUN", data);

    // Only process if raw files are present
    if (data.imageSrc?.rawFile) {
      const uploadedUrl = await uploadToCloudinary(data.imageSrc.rawFile);
      data.imageSrc = uploadedUrl;
    }

    if (data.audioSrc?.rawFile) {
      const uploadedUrl = await uploadToCloudinary(data.audioSrc.rawFile);
      data.audioSrc = uploadedUrl;
    }

    // ✅ Remove react-admin file upload objects before sending to backend
    // These are no longer used
    delete data.imageSrc?.rawFile;
    delete data.imageSrc?.src;
    delete data.imageSrc?.title;
    delete data.audioSrc?.rawFile;
    delete data.audioSrc?.src;
    delete data.audioSrc?.title;

    return baseProvider.create(resource, { ...params, data });
  },
};

const AdminApp = () => {
  return (
    <Admin dataProvider={dataProvider}>
      <Resource
        name="courses"
        recordRepresentation="title"
        list={CourseList}
        create={CreateCourse}
        edit={CourseEdit}
      />
      <Resource
        name="units"
        recordRepresentation="title"
        list={UnitList}
        create={CreateUnit}
        edit={UnitEdit}
      />
      <Resource
        name="lessons"
        recordRepresentation="title"
        list={LessonList}
        create={CreateLesson}
        edit={LessonEdit}
      />
      <Resource
        name="challenges"
        recordRepresentation="question"
        list={ChallengeList}
        create={CreateChallenge}
        edit={ChallengeEdit}
      />
      <Resource
        name="challengeOptions"
        recordRepresentation="text"
        list={ChallengeOptionList}
        create={CreateChallengeOption}
        edit={EditChallengeOption}
        options={{
          label: "Challenge Options",
        }}
      />
    </Admin>
  );
};

export default AdminApp;
