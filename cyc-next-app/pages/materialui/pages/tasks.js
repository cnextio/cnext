// import React, {forwardRef, useImperativeHandle, useRef, useState} from "react";
// import styled, {withTheme} from "styled-components";
// import DashboardLayout from "./dashboard";

// import Helmet from 'react-helmet';
// import {
//     // Card as MuiCard,
//     // CardContent as MuiCardContent,
//     Divider as MuiDivider,
//     CircularProgress,
//     Grid, IconButton, Input as MuiInput, TextField as MuiTextField,
// } from "@material-ui/core";
// import { spacing } from "@material-ui/system";
// import {
//     getTaskByUser,
//     getEmailByUser,
//     getEmailByID,
//     markProposalAsDone,
//     apolloClient,
//     markTaskAsDone, USER_ID, getFolderNameFromID, getFolderPathFromID
// } from "../../../lib/database";
// import {useEffect} from "react";
// import Alert from "@material-ui/lab/Alert";
// import AlertTitle from "@material-ui/lab/AlertTitle";
// import Box from "@material-ui/core/Box";
// import {Check, Close, Email} from "@material-ui/icons";
// import {makeStyles} from "@material-ui/core/styles";
// import FolderTitle from "./folder-title";
// import InputBase from "@material-ui/core/InputBase";
// import EmailContent, {LinksContainer} from "./text-contents";
// import Card from "@material-ui/core/Card";
// import CardContent from "@material-ui/core/CardContent";
// import Grow from "@material-ui/core/Grow";
// import Paper from "@material-ui/core/Paper";
// import {useMutation} from "@apollo/client";

// let dragula;
// if (typeof document !== 'undefined') {
//   dragula = require('react-dragula')
// }

// // const Divider = styled(MuiDivider)(spacing);
// const Divider = MuiDivider;

// const useStyles = makeStyles((theme) => ({
//     dateField: {
//         width: 150,
//     },
//     textField: {
//         width: 380,
//     },
//     connectionWord: {
//         width: 30,
//     },
//     card: {
//         maxWidth: 650,
//         marginBottom: theme.spacing(2),
//         paddingBottom: -theme.spacing(4),
//     },
//     cardContent: {
//         paddingBottom: theme.spacing(0),
//         paddingTop: theme.spacing(0),
//         '&:last-child': {
//             paddingBottom: theme.spacing(0),
//         }
//     },
//     icon: {
//         padding: 5,
//     },
//     button: {
//         fontSize: 20
//     },
//     folder: {
//         marginTop: theme.spacing(1),
//     },
//     divider: {
//         // marginBottom: theme.spacing(4),
//         // paddingLeft: theme.spacing(4),
//         // paddingRight: theme.spacing(4),
//     },
//     linkContainer: {
//         // marginBottom: theme.spacing(1),
//         // paddingLeft: theme.spacing(4),
//         // paddingBottom: theme.spacing(4)
//     },
//     resizable: {
//         position: "relative",
//         "& .react-resizable-handle": {
//           position: "absolute",
//           width: 20,
//           height: 20,
//           bottom: 0,
//           right: 0,
//           background:
//             "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2IDYiIHN0eWxlPSJiYWNrZ3JvdW5kLWNvbG9yOiNmZmZmZmYwMCIgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSI2cHgiIGhlaWdodD0iNnB4Ij48ZyBvcGFjaXR5PSIwLjMwMiI+PHBhdGggZD0iTSA2IDYgTCAwIDYgTCAwIDQuMiBMIDQgNC4yIEwgNC4yIDQuMiBMIDQuMiAwIEwgNiAwIEwgNiA2IEwgNiA2IFoiIGZpbGw9IiMwMDAwMDAiLz48L2c+PC9zdmc+')",
//           "background-position": "bottom right",
//           padding: "0 3px 3px 0",
//           "background-repeat": "no-repeat",
//           "background-origin": "content-box",
//           "box-sizing": "border-box",
//           cursor: "se-resize"
//         }
//     }
// }));

// function EmailButton({ onClickEmailButton, id}) {
//     const classes = useStyles();
//     const [isOn, toggleOn] = useState(false);
//     const [color, setColor] = useState('default');
//     const onClick = () => {
//         toggleOn(isOn ? false : true);
//     }

//     useEffect(() => {
//         onClickEmailButton(isOn, id);
//         setColor(isOn ? 'primary' : 'default');
//         }, [isOn]);

//     return (
//         <IconButton
//             // className={classes.icon}
//             color={color}
//             onClick={onClick}
//         >
//             <Email className={classes.button}/>
//         </IconButton>
//     )
// }

// export function EmailContentContainer({ emailID }) {
//     const classes = useStyles();
//     const {data, loading, error} = getEmailByID(emailID);
//     if (error) {
//         return (
//             <Alert severity="error">
//               <AlertTitle>Error</AlertTitle>
//               Fail to acquire main content
//             </Alert>
//         )
//     }

//     if (loading) {
//         return <CircularProgress/>;
//     }

//     return (
//         <Card mb={4} pl={4} pb={4}>
//           <CardContent >
//             <EmailContent noWrap content={data}/>
//             <Divider className={classes.divider}/>
//             <LinksContainer className={classes.linkContainer} content={data}/>
//           </CardContent>
//         </Card>
//     );
// };

// function TaskContent({ task, onClickEmailButton, onCloseTask }) {
//     const classes = useStyles();
//     return (
//       <React.Fragment>
//           <Box display="flex" flexDirection="row">
//                 <Box display="flex">
//                     <InputBase
//                         className={classes.textField}
//                         inputProps={{style: { fontSize: '15px' }}}
//                         multiline
//                         value={task.title}
//                     />
//                     <MuiInput
//                         className={classes.connectionWord}
//                         inputProps={{style: { textAlign: 'center', fontSize: '15px' }}}
//                         disableUnderline
//                         defaultValue={"on"}
//                         readOnly
//                     />
//                     <InputBase
//                         className={classes.dateField}
//                         inputProps={{style: {textAlign: 'center', fontSize: '15px'}}}
//                         id="date"
//                         type="date"
//                         defaultValue={task.date}
//                         // InputLabelProps={{shrink: true,}}
//                     />
//                 </Box>
//                 <Box display="flex">
//                     <IconButton
//                         className={classes.icon}
//                         id={task.id}
//                         color="secondary"
//                         onClick={onCloseTask}
//                     >
//                         <Check/>
//                     </IconButton>
//                 </Box>
//           </Box>
//           <Divider/>
//           <Box display="flex" flexDirection="row" alignItems='center'>
//               <Box flexGrow={1}  display='flex'>
//                   <FolderTitle classes={classes.folder}
//                                folder={getFolderPathFromID(task.folder.id)}
//                   />
//               </Box>
//               <Box>
//                 <EmailButton onClickEmailButton={onClickEmailButton} id={task.content.id}/>
//               </Box>
//           </Box>
//       </React.Fragment>
// );
// }

// export function TaskList({ containers, data, onClickEmailButton, apolloClient}) {
//     const classes = useStyles();
//     const [closed, setClosed] = useState([]);
//     const [markDone] = useMutation(markTaskAsDone, {client: apolloClient});

//     // const onContainerReady = container => {
//     //     containers.push(container);
//     // };

//     // useEffect(() => {
//     // dragula(containers);
//     // }, [containers]);

//     useEffect(() => {
//         let closed_list=[];
//         data.map(content => {
//             if (content.done==1) {
//                 closed_list.push(content.id);
//             }
//         });
//         setClosed(closed_list);
//     }, [data]);

//     // const handleContainerLoaded = container => {
//     //     if (container) {
//     //       onContainerReady(container);
//     //     }
//     // };

//     const handCloseTask = (id) => {
//         const doneResult = markDone({variables: {task_id: id}});
//         if (doneResult) {
//             setClosed(closed.concat([id]));
//         }
//         else {
//             //TODO: should recover the task
//             console.log("Failed to mark proposal as Done task_id=", id);
//         }
//     }

//     return (
//             data
//             .filter(task => closed.indexOf(task.id) === -1)
//                 .map((task, index) => (
//                     <Card className={classes.card}
//                           // ref={handleContainerLoaded}
//                         key={task.id}
//                     >
//                         <CardContent className={classes.cardContent}>
//                             <TaskContent
//                                 key={task.id}
//                                 noWrap
//                                 task={task}
//                                 onClickEmailButton={onClickEmailButton}
//                                 onCloseTask={handCloseTask.bind(this, task.id)}
//                             />
//                         </CardContent>
//                     </Card>
//             ))
//         )


//     // return (
//     //     <ResponsiveReactGridLayout
//     //         className="layout"
//     //         rowHeight={30}
//     //         cols={{lg: 12, md: 10, sm: 6, xs: 4, xxs: 2}}
//     //         layouts={layouts}
//     //         // onLayoutChange={this.onLayoutChange}
//     //         // WidthProvider option
//     //         measureBeforeMount={false}
//     //         // I like to have it animate on mount. If you don't, delete `useCSSTransforms` (it's default `true`)
//     //         // and set `measureBeforeMount={true}`.
//     //         useCSSTransforms={false}
//     //         compactType={'vertical'}
//     //         preventCollision={!'vertical'}
//     //         isResizable={true}
//     //     >
//     //     <MuiCard className={classes.card} ref={handleContainerLoaded} key='b'>
//     //                 <MuiCardContent className={classes.cardContent} >
//     //                     {/*<TaskContent*/}
//     //                     {/*    key={task.id}*/}
//     //                     {/*    noWrap*/}
//     //                     {/*    task={task}*/}
//     //                     {/*    onClickEmailButton={onClickEmailButton}*/}
//     //                     {/*    onCloseTask = {handCloseTask.bind(this, task.id)}*/}
//     //                     {/*/>*/}
//     //                 </MuiCardContent>
//     //             </MuiCard>
//     //     </ResponsiveReactGridLayout>
//     // )
// }

// function TaskContainer({ userID, folder, apolloClient }) {
//     const classes = useStyles();
//     const [show, setShow] = useState();
//     //this default number is just for placeholder to avoid graphql error
//     const [contentID, setContentID] = useState(null);

//     const {data, loading, error} = getTaskByUser(userID, folder);
//     if (error) {
//         return (
//             <Alert severity="error">
//               <AlertTitle>Error</AlertTitle>
//               Fail to acquire data
//             </Alert>
//         )
//     }
//     if (loading) return (<CircularProgress />);

//     const handleClickEmailButton = (isOn, id) => {
//         setShow(isOn);
//         setContentID(id);
//     }
//     // setContentID(data[0].content.id);
//     // const containers = [];

//     return (
//         // <TaskList
//         //     // containers={containers}
//         //     data={data}
//         //     onClickEmailButton={handleClickEmailButton}
//         //     apolloClient={apolloClient}
//         // />
//         <React.Fragment>
//         {/*<Grid container spacing={3}>*/}
//             {/*<Grid item xs={5} style={{ wordWrap: "break-word" }}>*/}
//                 <TaskList
//                     data={data}
//                     onClickEmailButton={handleClickEmailButton}
//                     apolloClient={apolloClient}/>
//             {/*</Grid>*/}
//             {/*<Grid item xs={7} >*/}
//                 <Grow in={show}
//                       style={{ transformOrigin: '0 0 0' }}
//                       {...(show ? { timeout: 200 } : {})}>
//                     <Paper>
//                         <EmailContentContainer emailID={contentID}/>
//                         {/*{show ? <EmailContentContainer emailID={emailID}/> : <Box/>}*/}
//                     </Paper>
//                 </Grow>
//             {/*</Grid>*/}
//         {/*</Grid>*/}
//       </React.Fragment>
//     );
// }

// // function DashboardTasks({ theme }) {
// //   return (
// //         <DashboardLayout children={ <TaskContainer theme={theme} userID={USER_ID} apolloClient={apolloClient}/> }/>
// //   )
// // }

// export default withTheme(TaskContainer);
// // export default withTheme(DashboardTasks);
// // export default withTheme()(withStyles(styles)(DashboardTasks));
// // export default withStyles(styles, { withTheme: true })(DashboardTasks);
// // export default Tasks;


