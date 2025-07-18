import { auth } from "@clerk/nextjs/server";

export const isAuthorized = async () => {
  const { userId } = await auth();

  if (!userId) {
    return false;
  }

  return true;
};
