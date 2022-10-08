import { Admin } from "@prisma/client";
import { randomUUID } from "crypto";
import {
  AdminListInput,
  adminListOutput,
  inviteAdminInput,
  inviteAdminOutput,
} from "../../../../schema/admin.schema";
import { createRouter } from "../createRouter";
import { NodemailerInstance } from "../nodemailer_instance";

export const adminRouter = createRouter()
  .mutation("invite-admin", {
    input: inviteAdminInput,
    output: inviteAdminOutput,
    async resolve({ ctx, input }) {
      const now = new Date();
      try {
        // create verify entry for admin
        await ctx.prisma.verificationToken.create({
          data: {
            email: input.email,
            expires: new Date(now.getTime() + 30 * 60000),
            identifier: randomUUID(),
            role: "ADMIN",
          },
        });
        // nodemailer
        await NodemailerInstance.GetNodemailer();
        await NodemailerInstance.SendAdminInviteEmail(input.email);
        return {
          email: input.email,
        };
      } catch (e) {
        console.log(e);
      }

      // return fail response
      return {
        email: "",
      };
    },
  })
  .query("get-admins", {
    output: adminListOutput,
    async resolve({ ctx, input }) {
      const dbAdmins: Admin[] = await ctx.prisma.admin.findMany();

      const data: AdminListInput = dbAdmins.map((item) => ({
        designation: item.designation!,
        email: item.email,
        emailVerified: item.emailVerified,
        name: item.name!,
        phoneNo: item.phoneNo!,
        role: item.role,
      }));
      return data;
    },
  });
