import { IncomingForm } from "formidable";
import { v2 as cloudinary } from "cloudinary";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = new IncomingForm({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) {
      return res.status(400).json({ error: "Upload failed", details: err });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    try {
      const result = await cloudinary.uploader.upload(file.filepath, {
        folder: "duolingo-clone",
        resource_type: "auto",
      });

      return res.status(200).json({ url: result.secure_url });
    } catch (e) {
      console.log(e);
      return res
        .status(500)
        .json({ error: "Cloudinary upload failed", details: e });
    }
  });
}
