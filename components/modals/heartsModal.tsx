/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useHeartsModal } from "@/store/useHeartsModal";

export const HeartsModal = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { isOpen, close } = useHeartsModal();

  useEffect(() => setIsClient(true), []);

  const onclick = () => {
    close();
    router.push("/store");
  };

  if (!isClient) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center w-full justify-center mb-5">
            <Image src="/mascotBad.svg" alt="Mascot" height={80} width={80} />
          </div>

          <DialogTitle className="text-center font-bold text-2xl">
            You ran out of hearts!
          </DialogTitle>

          <DialogDescription className="text-center text-base">
            Get Pro for unlimited hearts! OR Purchase them in the store!
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mb-4">
          <div className="flex flex-col gap-y-4 w-full">
            <Button
              variant="primary"
              className="w-full"
              size="lg"
              onClick={onclick}
            >
              Get Unlimited Hearts
            </Button>
            <Button
              variant="primaryOutline"
              className="w-full"
              size="lg"
              onClick={close}
            >
              No Thanks
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
