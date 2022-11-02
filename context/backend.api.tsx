import { showNotification } from "@mantine/notifications";
import { TRPCClientErrorLike } from "@trpc/client";
import { createContext, useContext } from "react";
import { UseMutationResult, UseQueryResult } from "react-query";
import { AppRouter } from "../src/pages/api/server/routes/app.router";
import { InviteUserInput, InviteUserOutput } from "../src/schema/admin.schema";
import {
  ChangeNoticeStatusInput,
  ChangeNoticeStatusOutput,
  CreateNoticeInput,
  CreateNoticeOutput,
  CreatePresignedUrlInput,
  DeleteNoticeInput,
  DeleteNoticeOutput,
  GetNoticeDetailOutput,
  GetNoticeListOutput,
} from "../src/schema/notice.schema";
import {
  UpdateUserInput,
  UpdateUserOutput,
  UserDeleteInput,
  UserDeleteOutput,
  UserRoleInput,
  UserRoleOutput,
} from "../src/schema/user.schema";
import { trpc } from "../src/utils/trpc";
const BackendApiContext = createContext<IBackendApi | null>(null);

export function BackendApi({ children }: { children: JSX.Element }) {
  const createPresignedUrlMutation = trpc.useMutation(
    "attachment.create-presigned-url"
  );

  const changeNoticeStatusMutation = trpc.useMutation(
    "notice.change-notice-status"
  );
  const createNoticeMutation = trpc.useMutation("notice.create-notice");
  const deleteNoticeMutation = trpc.useMutation("notice.delete-notice");
  const noticeDetailQuery = (noticeId: string) =>
    trpc.useQuery(["notice.notice-detail", { id: noticeId }], {
      onError: (err) => {
        showNotification({
          title: "Error Occured",
          message: err.message,
          color: "red",
        });
      },
    });
  const changeUserRoleMutation = trpc.useMutation("user.change-user-role");
  const deleteUserMutation = trpc.useMutation("user.delete-user");
  const inviteUserMutation = trpc.useMutation("user.invite-user");
  const onboardUserMutation = trpc.useMutation("user.onboard-user");

  // query
  const publishedNoticeQuery = (pageNos: number) =>
    trpc.useQuery(["notice.published-notice-list", { pageNos }], {
      onError: (err) => {
        showNotification({
          title: "Error Occured",
          message: err.message,
          color: "red",
        });
      },
      onSuccess(data) {
        console.debug(`notice loaded for page nos. ${pageNos}`);
        console.debug(data);
      },
    });
  let sharedState: IBackendApi = {
    createPresignedUrlMutation,
    changeNoticeStatusMutation,
    createNoticeMutation,
    deleteNoticeMutation,
    changeUserRoleMutation,
    deleteUserMutation,
    inviteUserMutation,
    onboardUserMutation,
    // query
    publishedNoticeQuery,
    noticeDetailQuery,
  };

  return (
    <BackendApiContext.Provider value={sharedState}>
      {children}
    </BackendApiContext.Provider>
  );
}

export function useBackendApiContext() {
  return useContext(BackendApiContext);
}

interface IBackendApi {
  createPresignedUrlMutation: UseMutationResult<
    unknown,
    TRPCClientErrorLike<AppRouter>,
    CreatePresignedUrlInput
  >;
  changeNoticeStatusMutation: UseMutationResult<
    ChangeNoticeStatusOutput,
    TRPCClientErrorLike<AppRouter>,
    ChangeNoticeStatusInput
  >;
  createNoticeMutation: UseMutationResult<
    CreateNoticeOutput,
    TRPCClientErrorLike<AppRouter>,
    CreateNoticeInput
  >;
  deleteNoticeMutation: UseMutationResult<
    DeleteNoticeOutput,
    TRPCClientErrorLike<AppRouter>,
    DeleteNoticeInput
  >;
  changeUserRoleMutation: UseMutationResult<
    UserRoleOutput,
    TRPCClientErrorLike<AppRouter>,
    UserRoleInput
  >;
  deleteUserMutation: UseMutationResult<
    UserDeleteOutput,
    TRPCClientErrorLike<AppRouter>,
    UserDeleteInput
  >;
  inviteUserMutation: UseMutationResult<
    InviteUserOutput,
    TRPCClientErrorLike<AppRouter>,
    InviteUserInput
  >;
  onboardUserMutation: UseMutationResult<
    UpdateUserOutput,
    TRPCClientErrorLike<AppRouter>,
    UpdateUserInput
  >;
  publishedNoticeQuery: (
    pageNos: number
  ) => UseQueryResult<GetNoticeListOutput, TRPCClientErrorLike<AppRouter>>;
  noticeDetailQuery: (
    noticeId: string
  ) => UseQueryResult<GetNoticeDetailOutput, TRPCClientErrorLike<AppRouter>>;
}
