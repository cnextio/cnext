import React from "react";

// import async from "../materialui/layouts/Async";

import {
  CheckSquare,
    Inbox,
    Folder
} from "react-feather";
import Backlogs from "../materialui/pages/backlogs";
import Tasks from "../materialui/pages/tasks";
// import TreeView from "@material-ui/lab/TreeView";
// import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
// import ChevronRightIcon from '@material-ui/icons/ChevronRight';
// import TreeItem from "@material-ui/lab/TreeItem";
// import makeStyles from "@material-ui/core/styles/makeStyles";
// import styled from "styled-components";
// import {Collapse, ListItem} from "@material-ui/core";
// import {darken, rgba} from "polished";
// import {getFolderByUser, getTaskProposalByContent, USER_ID, getFolderNameFromID} from "../../lib/database";
// import {Alert, AlertTitle} from "@material-ui/lab";
// import CircularProgress from "@material-ui/core/CircularProgress";
// import { useRouter } from 'next/router'
// import {FolderTree} from "../../lib/materialui/layouts/Sidebar";
// import {Edit} from "@material-ui/icons";

export const DRAWING='Drawing'
export const INBOX='Inbox'
export const TASKS='Tasks'
export const FOLDERS='Folders'

// const DrawingButton = {
//   id: DRAWING,
//   path: "drawing",
//   icon: <Edit />,
//   badge: "17",
//   component: Backlogs,
//   children: null
// };

const BacklogsButton = {
  id: INBOX,
  path: "inbox",
  icon: <Inbox />,
  badge: "17",
  component: Backlogs,
  children: null
};

const TaskButton = {
  id: TASKS,
  path: "tasks",
  icon: <CheckSquare />,
  badge: "1",
  component: Tasks,
  children: null
};

const FolderButton = {
  id: FOLDERS,
  path: "folder",
  icon: <Folder />,
  // badge: "1",
  // component: Tasks,
  children: null
};

export const Toolbar = [
  BacklogsButton,
  TaskButton,
];

export default [
  BacklogsButton,
  TaskButton,
];
