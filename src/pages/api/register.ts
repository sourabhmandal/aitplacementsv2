// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Prisma } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse>
) {
  console.log("WRONG REGISTER API");
  const { name, regno, year, branch, email, password }: RegisterRequestType =
    JSON.parse(req.body);

  try {
    const dbResp = await prisma?.user.create({
      data: {
        name: name,
        email: email,
        branch: branch,
        registrationNumber: regno,
        year: parseInt(year),
        password: password,
        emailVerified: false,
      },
    });
    if (dbResp) {
      res.status(200).json({
        ok: true,
        status: 200,
        message: `user with email ${dbResp.email} created successfully`,
      });
      return;
    }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      res.status(400).json({
        ok: false,
        status: 400,
        error: `User with same email(${email}) or registration number (${regno}) already present`,
      });
      return;
    }
    if (e instanceof Prisma.PrismaClientValidationError) {
      res.status(500).json({
        ok: false,
        status: 500,
        error: `Data is invalid`,
      });
      return;
    }
    console.log(e);
    res.status(500).json({
      ok: false,
      status: 500,
      error: `Internal server error`,
    });
  }
}
