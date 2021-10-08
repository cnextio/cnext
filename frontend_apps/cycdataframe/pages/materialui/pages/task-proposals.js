import React, { useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
// import {ApolloProvider, useMutation, useQuery} from '@apollo/client';
import Box from '@material-ui/core/Box';
import {
    Check,
    Close
} from '@material-ui/icons';

import {
    TextField as MuiTextField,
    Input as MuiInput,
    IconButton
} from "@material-ui/core";
// import {
//     getTaskProposalByContent,
//     markProposalAsDone,
//     addTask, apolloClient,
//     COMMON_FOLDER_TITLE
// } from "../../../lib/database";
import CircularProgress from "@material-ui/core/CircularProgress";
import { Alert, AlertTitle } from '@material-ui/lab';
import FolderTitle from "./folder-title";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Fade from "@material-ui/core/Fade";
import Paper from "@material-ui/core/Paper";
import Popper from "@material-ui/core/Popper";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles((theme) => ({
    dateField: {
        width: 150,
    },
    textField: {
        width: 400,
    },
    connectionWord: {
        width: 30,
    },
    taskProposalText: {
        lineHeight: 20.0,
        fontSize: 15
    },
    icon: {
        padding: 5,
        fontSize: 15
    },
    container: {
        padding: 10
    }
}));

function TaskProposal({task, handleAdd, handleDel}) {
    const classes = useStyles();
    const [date, setDate] = useState(task.date);
    const [title, setTitle] = useState(task.title);

    return (
        <Box display="flex" flexDirection="row" alignItems="flex-end">
            <Box display="flex" alignItems="flex-end">
                <MuiTextField
                    className={classes.textField}
                    inputProps={{style: { fontSize: '15px'}}}
                    multiline
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                />
                <MuiInput
                    className={classes.connectionWord}
                    inputProps={{style: { textAlign: 'center', fontSize: '15px' }}}
                    disableUnderline
                    defaultValue={"on"}
                    readOnly
                />
                <MuiTextField
                    className={classes.dateField}
                    inputProps={{style: {textAlign: 'center', fontSize: '15px'}}}
                    id="date"
                    type="date"
                    defaultValue={date}
                    InputLabelProps={{shrink: true,}}
                    onChange={(event) => setDate(event.target.value)}
                />
            </Box>
            <Box display="flex" alignItems="flex-end">
                <IconButton
                    className={classes.icon}
                    id={task.id}
                    color="secondary"
                    onClick={handleAdd.bind(this, task, title, date)}>
                  <Check />
                </IconButton>
                <IconButton
                    className={classes.icon}
                    id={task.id}
                    color="default"
                    onClick={handleDel.bind(this, task)}>
                  <Close />
                </IconButton>
            </Box>
        </Box>
    );
}

export function TaskProposalList({data, client}) {
    // console.log("TaskProposalList", React, process.browser);
    const classes = useStyles();
    const [deleted, setDeleted] = useState([]);
    const [folders, setProjects] = useState([COMMON_FOLDER_TITLE]);
    //TODO: handle error and loading
    const [markDone] = useMutation(markProposalAsDone, {client: client});
    const [doAddTask] = useMutation(addTask, {client: client});

    const onDelete = (task) => {
        const doneResult = markDone({variables: {task_id: task.id}});
        if (doneResult) {
            setDeleted(deleted.concat([task.id]));
        }
        else {
            //TODO: should recover the task
            console.log("Failed to mark proposal as Done task_id=",task.id);
        }
    }

    const onAdd = (task, newTitle, newDate) => {
        // const doneResult = markDone({variables: {task_id: task.id}});
        //TODO: handle addResult
        // const folder_id = generateProjectID(folders);
        const addResult = doAddTask({variables: {task_proposal_id: task.id,
                                            content_id: task.content_id, title: newTitle,
                                            date: newDate, folders: folders, user_id: task.user_id}});
        if (addResult) {
            setDeleted(deleted.concat([task.id]));
            if(handleOnClose){
                handleOnClose();
            }
        }
        else {
            console.log("Failed to mark proposal as Done task_id=",task.id);
        }
    }

    const onProjectChange = (folders) => {
        setProjects(folders);
    }

    let Tasks = data
        .filter(task => deleted.indexOf(task.id) === -1)
        .map(task => {
            return (
                <TaskProposal key={task.id}
                    task={task}
                    handleDel={onDelete}
                    handleAdd={onAdd}
                />
            );
        });

    return (
        <ApolloProvider client={client}>
            <Box className={classes.container}>
                <FolderTitle defaultValue={[COMMON_FOLDER_TITLE]} onChange={onProjectChange} withLabel/>
                {Tasks}
            </Box>
        </ApolloProvider>
    );
}

function TaskProposalContainer({ content_id }) {
    const classes = useStyles()
    //TODO: if there is task_order then load only 1 task
    let {data, loading, error} = getTaskProposalByContent(content_id);
    if (error) {
        return (
            <Alert severity="error">
              <AlertTitle>Error</AlertTitle>
              Fail to acquire data
            </Alert>
        )
    }
    if (loading) {
        return (<CircularProgress />);
    }

    return (
        <TaskProposalList data={data} client={apolloClient}/>
    );
}

function TaskProposalPopper({task, handleAdd, handleDel}) {
    const classes = useStyles();
    const [date, setDate] = useState(task.date);
    const [title, setTitle] = useState(task.title);

    return (
        <Box display="flex" flexDirection="column" alignItems="flex-end">
            <Box display="flex" alignItems="flex-end">
                <MuiTextField
                    className={classes.textField}
                    inputProps={{style: { fontSize: '15px'}}}
                    multiline
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                />
                <MuiInput
                    className={classes.connectionWord}
                    inputProps={{style: { textAlign: 'center', fontSize: '15px' }}}
                    disableUnderline
                    defaultValue={"on"}
                    readOnly
                />
                <MuiTextField
                    className={classes.dateField}
                    inputProps={{style: {textAlign: 'center', fontSize: '15px'}}}
                    id="date"
                    type="date"
                    defaultValue={date}
                    InputLabelProps={{shrink: true,}}
                    onChange={(event) => setDate(event.target.value)}
                />
            </Box>
            <Box display="flex" alignItems="flex-end">
                <Button
                    className={classes.icon}
                    id={task.id}
                    color="secondary"
                    onClick={handleAdd.bind(this, task, title, date)}>
                  Add
                </Button>
                <Button
                    className={classes.icon}
                    id={task.id}
                    color="default"
                    onClick={handleDel.bind(this, task)}>
                  Remove
                </Button>
            </Box>
        </Box>
    );
}

function TaskProposalWithPopper({folder, handleFolderChange, taskProposal, handleContainerClose, client}) {
    // console.log("TaskProposalList", React, process.browser);
    const classes = useStyles();
    // const [folders, setFolders] = useState([COMMON_FOLDER_TITLE]);
    //TODO: handle error and loading
    const [markDone] = useMutation(markProposalAsDone, {client: client});
    const [doAddTask] = useMutation(addTask, {client: client});

    async function handleDel(taskProposal) {
        const doneResult = await markDone({variables: {task_id: taskProposal.id}});
        if (doneResult) {
            handleContainerClose();
        }
        else {
            //TODO: should recover the task
            console.log("Failed to mark proposal as Done task_id=",taskProposal.id);
        }
    }

    const handleAdd = (taskProposal, newTitle, newDate) => {
        //TODO: handle addResult
        // const folder_id = generateProjectID(folders);
        const addResult = doAddTask({variables: {task_proposal_id: taskProposal.id,
                                            content_id: taskProposal.content_id, title: newTitle,
                                            date: newDate, folders: folder, user_id: taskProposal.user_id}});
        if (addResult) {
            handleContainerClose();
        }
        else {
            console.log("Failed to mark proposal as Done task_id=",taskProposal.id);
        }
    }

    // const onProjectChange = (folders) => {
    //     setFolders(folders);
    // }
    // console.log(taskProposal.id, taskProposal.done);
    return (
        <Box className={classes.container}>
            <FolderTitle folder={folder} onChange={handleFolderChange} withLabel/>
            <TaskProposalPopper key={taskProposal.id}
                task={taskProposal}
                handleDel={handleDel}
                handleAdd={handleAdd}
            />
        </Box>
    );
}

// task_order is the order of the given task in this list of tasks
// which is used when we only want to display a specific task in the list such as in popper case
export function TaskProposalPopperContainer({ folder, handleFolderChange, taskProposal, handleContainerClose, anchorEl }) {
    const classes = useStyles()
    const open = Boolean(anchorEl);

    return (
        <Popper id="add-task" open={open} anchorEl={anchorEl}
                placement={'top-start'} transition>
            {({TransitionProps}) => (
                <ClickAwayListener onClickAway={handleContainerClose}>
                    <Fade {...TransitionProps}>
                        <Paper elevation={5}>
                            <TaskProposalWithPopper
                                folder={folder}
                                handleFolderChange={handleFolderChange}
                                taskProposal={taskProposal}
                                handleContainerClose={handleContainerClose}
                                client={apolloClient}/>
                        </Paper>
                    </Fade>
                </ClickAwayListener>
            )}
        </Popper>
    );
}

export default TaskProposalContainer;


