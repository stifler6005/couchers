import * as React from "react";
import PageTitle from "../../components/PageTitle";
import GroupChatsTab from "./groupchats/GroupChatsTab";
import SurfingTab from "./surfing/SurfingTab";
import TabBar from "../../components/TabBar";
import { Route, Switch, useHistory, useParams } from "react-router-dom";
import { messagesRoute } from "../../AppRoutes";
import GroupChatView from "./groupchats/GroupChatView";
import HostRequestView from "./surfing/HostRequestView";
import NewHostRequest from "./surfing/NewHostRequest";

import NotificationBadge from "../../components/NotificationBadge";
import useNotifications from "../useNotifications";

export function MessagesNotification() {
  const { data } = useNotifications();

  return (
    <NotificationBadge count={data?.unseenMessageCount}>
      Group Chats
    </NotificationBadge>
  );
}

export function HostRequestsNotification() {
  const { data } = useNotifications();

  return (
    <NotificationBadge count={data?.unseenSentHostRequestCount}>
      Hosting
    </NotificationBadge>
  );
}

const labels = {
  all: "All",
  groupchats: <MessagesNotification />,
  hosting: <HostRequestsNotification />,
  surfing: "Surfing",
  meet: "Meet",
  archived: "Archived",
};

type MessageType = keyof typeof labels;

export default function Messages() {
  const history = useHistory();
  const { type = "all" } = useParams<{ type: keyof typeof labels }>();
  const messageType = type in labels ? (type as MessageType) : "all";

  const header = (
    <>
      <PageTitle>Messages</PageTitle>
      <TabBar
        value={messageType}
        setValue={(newType) =>
          history.push(`${messagesRoute}/${newType !== "all" ? newType : ""}`)
        }
        labels={labels}
      />
    </>
  );

  return (
    <>
      <Switch>
        <Route path={`${messagesRoute}/groupchats/:groupChatId`}>
          <GroupChatView />
        </Route>
        <Route path={`${messagesRoute}/groupchats`}>
          {header}
          <GroupChatsTab />
        </Route>
        <Route path={`${messagesRoute}/request/new/:userId`}>
          <NewHostRequest />
        </Route>
        <Route path={`${messagesRoute}/request/:hostRequestId`}>
          <HostRequestView />
        </Route>
        <Route path={`${messagesRoute}/hosting`}>
          {header}
          <SurfingTab type="hosting" />
        </Route>
        <Route path={`${messagesRoute}/surfing`}>
          {header}
          <SurfingTab type="surfing" />
        </Route>
        <Route path={`${messagesRoute}/meet`}>
          {header}
          MEET
        </Route>
        <Route path={`${messagesRoute}/archived`}>
          {header}
          ARCHIVED
        </Route>
        <Route path={`${messagesRoute}/:messageId?`}>
          {header}
          All
        </Route>
      </Switch>
    </>
  );
}
