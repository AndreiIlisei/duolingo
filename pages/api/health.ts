import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Simple health check - no auth required
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "duolingo-clone",
  });
}
