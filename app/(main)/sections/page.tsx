import React, { useState } from "react";
import { ArrowLeft, Lock, Play, Eye } from "lucide-react";
import { SectionsView } from "./sectionPage";
import { getSections } from "@/queries/core/getSections";

const SectionPage = async () => {
  const getSectionsData = getSections();

  const [sectionsData] = await Promise.all([getSectionsData]);

  console.log(sectionsData);

  return (
    <div className="min-h-screen bg-gradient-to-b ">
      <SectionsView sections={sectionsData} />
    </div>
  );
};

export default SectionPage;
