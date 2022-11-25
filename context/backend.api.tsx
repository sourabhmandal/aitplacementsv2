import { showNotification } from "@mantine/notifications";
import { Role } from "@prisma/client";
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
  NoticeSearchInput,
  UserNoticeOutput,
} from "../src/schema/notice.schema";
import {
  UpdateUserInput,
  UpdateUserOutput,
  UserDeleteInput,
  UserDeleteOutput,
  UserListOutput,
  UserRoleInput,
  UserRoleOutput,
  UserSearchInput,
} from "../src/schema/user.schema";
import { trpc } from "../src/utils/trpc";
const BackendApiContext = createContext<IBackendApi | null>(null);

export function BackendApi({ children }: { children: JSX.Element }) {
  const createPresignedUrlMutation = trpc.useMutation(
    "attachment.create-presigned-url",
    {
      onError: (err) => {
        showNotification({
          title: "Error Occured",
          message: err.message,
          color: "red",
        });
      },
    }
  );

  const changeNoticeStatusMutation = trpc.useMutation(
    "notice.change-notice-status",
    {
      onError: (err) => {
        showNotification({
          title: "Error Occured",
          message: err.message,
          color: "red",
        });
      },
    }
  );
  const createNoticeMutation = trpc.useMutation("notice.create-notice", {
    onError: (err) => {
      showNotification({
        title: "Error Occured",
        message: err.message,
        color: "red",
      });
    },
  });
  const deleteNoticeMutation = trpc.useMutation("notice.delete-notice", {
    onError: (err) => {
      showNotification({
        title: "Error Occured",
        message: err.message,
        color: "red",
      });
    },
  });
  const changeUserRoleMutation = trpc.useMutation("user.change-user-role", {
    onError: (err) => {
      showNotification({
        title: "Error Occured",
        message: err.message,
        color: "red",
      });
    },
  });
  const deleteUserMutation = trpc.useMutation("user.delete-user", {
    onError: (err) => {
      showNotification({
        title: "Error Occured",
        message: err.message,
        color: "red",
      });
    },
  });
  const inviteUserMutation = trpc.useMutation("user.invite-user", {
    onError: (err) => {
      showNotification({
        title: "Error Occured",
        message: err.message,
        color: "red",
      });
    },
  });
  const onboardUserMutation = trpc.useMutation("user.onboard-user", {
    onError: (err) => {
      showNotification({
        title: "Error Occured",
        message: err.message,
        color: "red",
      });
    },
  });
  const searchNoticeByTitle = trpc.useMutation(
    "notice.search-notice-by-title",
    {
      onError: (err) => {
        showNotification({
          title: "Error Occured",
          message: err.message,
          color: "red",
        });
      },
    }
  );
  const searchUserByEmail = trpc.useMutation("user.search-user-by-email", {
    onError: (err) => {
      showNotification({
        title: "Error Occured",
        message: err.message,
        color: "red",
      });
    },
  });

  // query
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

  const userListQuery = (userRole: Role) =>
    trpc.useQuery(["user.get-user-list", { role: userRole }], {
      onError: (err) => {
        showNotification({
          title: "Error Occured",
          message: err.message,
          color: "red",
        });
      },
    });

  const myNoticeQuery = (useremail: string, pageNos: number) =>
    trpc.useQuery(
      ["notice.my-notices", { email: useremail, pageNos: pageNos }],
      {
        onError: (err) => {
          showNotification({
            title: "Error Occured",
            message: err.message,
            color: "red",
          });
        },
      }
    );

  let sharedState: IBackendApi = {
    createPresignedUrlMutation,
    changeNoticeStatusMutation,
    createNoticeMutation,
    deleteNoticeMutation,
    changeUserRoleMutation,
    deleteUserMutation,
    inviteUserMutation,
    onboardUserMutation,
    searchNoticeByTitle,
    searchUserByEmail,
    // query
    publishedNoticeQuery,
    noticeDetailQuery,
    userListQuery,
    myNoticeQuery,
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
  searchNoticeByTitle: UseMutationResult<
    GetNoticeListOutput,
    TRPCClientErrorLike<AppRouter>,
    NoticeSearchInput
  >;
  searchUserByEmail: UseMutationResult<
    UserListOutput,
    TRPCClientErrorLike<AppRouter>,
    UserSearchInput
  >;
  publishedNoticeQuery: (
    pageNos: number
  ) => UseQueryResult<GetNoticeListOutput, TRPCClientErrorLike<AppRouter>>;
  noticeDetailQuery: (
    noticeId: string
  ) => UseQueryResult<GetNoticeDetailOutput, TRPCClientErrorLike<AppRouter>>;
  userListQuery: (
    userTole: Role
  ) => UseQueryResult<UserListOutput, TRPCClientErrorLike<AppRouter>>;

  myNoticeQuery: (
    useremail: string,
    pageNos: number
  ) => UseQueryResult<UserNoticeOutput, TRPCClientErrorLike<AppRouter>>;
}
