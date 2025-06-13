import { auth } from "@clerk/nextjs/server";

const allowedIds = ["user_2qlKRBVpAkZjbpjE7a2LIoAJEnP"];

export const isAuthorized = async () => {
  const { userId } = await auth();

  if (!userId) {
    return false;
  }

  return allowedIds.includes(userId);
};
