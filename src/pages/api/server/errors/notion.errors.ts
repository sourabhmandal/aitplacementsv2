import {
  APIErrorCode,
  ClientErrorCode,
  NotionClientError,
} from "@notionhq/client";

export function handleNotionErrors(error: NotionClientError) {
  // error is now strongly typed to NotionClientError
  switch (error.code) {
    case ClientErrorCode.RequestTimeout:
      // ...
      break;
    case APIErrorCode.ObjectNotFound:
      // ...
      break;
    case APIErrorCode.Unauthorized:
      // ...
      break;
    // ...
  }
}
