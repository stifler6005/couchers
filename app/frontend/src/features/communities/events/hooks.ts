import { useMediaQuery, useTheme } from "@material-ui/core";
import useUsers from "features/userQueries/useUsers";
import { Error as GrpcError } from "grpc-web";
import { ListEventAttendeesRes, ListEventOrganizersRes } from "proto/events_pb";
import { eventAttendeesKey, eventOrganisersKey, QueryType } from "queryKeys";
import { useMemo } from "react";
import { useInfiniteQuery } from "react-query";
import { service } from "service";

import getContentSummary from "../getContentSummary";

export interface UseEventUsersInput {
  eventId: number;
  type: QueryType;
  enabled?: boolean;
}

export const SUMMARY_QUERY_PAGE_SIZE = 5;

export function useEventOrganisers({
  enabled = true,
  eventId,
  type,
}: UseEventUsersInput) {
  const query = useInfiniteQuery<ListEventOrganizersRes.AsObject, GrpcError>({
    queryKey: eventOrganisersKey({ eventId, type }),
    queryFn: ({ pageParam }) =>
      service.events.listEventOrganisers({
        eventId,
        pageSize: type === "summary" ? SUMMARY_QUERY_PAGE_SIZE : undefined,
        pageToken: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.nextPageToken || undefined,
    enabled,
  });
  const organiserIds =
    query.data?.pages.flatMap((res) => res.organizerUserIdsList) ?? [];
  const {
    data: organisers,
    isLoading: isOrganisersLoading,
    isRefetching: isOrganisersRefetching,
  } = useUsers(organiserIds);

  return {
    ...query,
    organiserIds,
    organisers,
    isOrganisersLoading,
    isOrganisersRefetching,
  };
}

export function useEventAttendees({
  enabled = true,
  eventId,
  type,
}: UseEventUsersInput) {
  const query = useInfiniteQuery<ListEventAttendeesRes.AsObject, GrpcError>({
    queryKey: eventAttendeesKey({ eventId, type }),
    queryFn: ({ pageParam }) =>
      service.events.listEventAttendees({
        eventId,
        pageSize: type === "summary" ? SUMMARY_QUERY_PAGE_SIZE : undefined,
        pageToken: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.nextPageToken || undefined,
    enabled,
  });
  const attendeesIds =
    query.data?.pages.flatMap((data) => data.attendeeUserIdsList) ?? [];
  const {
    data: attendees,
    isLoading: isAttendeesLoading,
    isRefetching: isAttendeesRefetching,
  } = useUsers(attendeesIds);

  return {
    ...query,
    attendeesIds,
    attendees,
    isAttendeesLoading,
    isAttendeesRefetching,
  };
}

interface UseTruncatedContentInput {
  content: string;
  mobileCharCount: number;
  desktopCharCount: number;
}
export function useTruncatedContent({
  content,
  mobileCharCount,
  desktopCharCount,
}: UseTruncatedContentInput) {
  const theme = useTheme();
  const isBelowLg = useMediaQuery(theme.breakpoints.down("md"));
  const truncatedContent = useMemo(
    () =>
      getContentSummary({
        originalContent: content,
        maxLength: isBelowLg ? mobileCharCount : desktopCharCount,
      }),
    [content, desktopCharCount, isBelowLg, mobileCharCount]
  );

  return truncatedContent;
}
