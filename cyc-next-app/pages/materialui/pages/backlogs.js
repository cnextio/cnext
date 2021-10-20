// import React, {useState} from "react";
// import styled, {withTheme} from "styled-components";
// import DashboardLayout from "./dashboard";
// import Helmet from 'react-helmet';
// import {
//   Card as MuiCard,
//   CardContent as MuiCardContent,
//   Divider as MuiDivider,
//   Grid,
// } from "@material-ui/core";
// import { spacing } from "@material-ui/system";
// import {
//     COMMON_FOLDER_TITLE,
//     getEmailByUser, getFolderPathFromID,
//     markBacklogContentAsDone,
//     markProposalAsDone
// } from "../../../lib/database";
// import EmailContent from "./text-contents";
// import {TextContentWithInlineProposal} from "./text-contents"
// import TaskProposalContainer from "./task-proposals";
// import {useEffect} from "react";
// import {apolloClient, getFolderPathFromChips} from "../../../lib/database";
// import CircularProgress from "@material-ui/core/CircularProgress";
// import Alert from "@material-ui/lab/Alert";
// import AlertTitle from "@material-ui/lab/AlertTitle";
// import {useMutation, useQuery} from "@apollo/client";
// import {FolderTitleContainer} from "./folder-title";

// let dragula;
// if (typeof document !== 'undefined') {
//   dragula = require('react-dragula')
// }

// const Divider = styled(MuiDivider)(spacing);

// const Card = styled(MuiCard)(spacing)

// const CardContent = styled(MuiCardContent)`
//   &:last-child {
//     padding-bottom: ${props => props.theme.spacing(4)}px;
//   }
// `;

// function BacklogItem({ content, onContentDone, handleContainerLoaded }) {
//     let [folder, setFolder] = useState(getFolderPathFromID(content.folder.id));

//     useEffect(() => {
//         setFolder(getFolderPathFromID(content.folder.id));
//     }, [content]);

//     const handleFolderChange = (folder) => {
//         setFolder(folder);
//     }

//     //TODO: check why this is printed even when all content has been done.
//     console.log(content.folder.id, folder, content);
//     return (
//         <Card mb={4} pl={4} pb={4} ref={handleContainerLoaded} key={content.id}>
//             <CardContent>
//                 <TextContentWithInlineProposal
//                     noWrap
//                     folder={folder}
//                     handleFolderChange={handleFolderChange}
//                     content={content}
//                     onClose={onContentDone.bind(this, content.id, getFolderPathFromChips(folder))}/>
//                 <Divider mb={4}/>
//                 <FolderTitleContainer folder={folder} handleFolderChange={handleFolderChange}/>
//                 {/*<TaskProposalContainer content_id={content.id}/>*/}
//             </CardContent>
//         </Card>
//     )
// }
// function BacklogList({ containers, data, apolloClient }) {
//     const [deleted, setDeleted] = useState([]);
//     const [markDone] = useMutation(markBacklogContentAsDone, {client: apolloClient});

//     const onContainerReady = container => {
//         containers.push(container);
//     };

//     useEffect(() => {
//         dragula(containers);
//     }, [containers]);

//     useEffect(() => {
//         let deleted_list=[];
//         data.map(content => {
//             if (content.done==1) {
//                 deleted_list.push(content.id);
//             }
//         });
//         setDeleted(deleted_list);
//     }, [data]);

//     const handleContainerLoaded = container => {
//         if (container) {
//           onContainerReady(container);
//         }
//     };

//     async function onContentDone(id, folder_id) {
//         //TODO: need a better way to handle return from mutation
//         let doneResult = await markDone({variables: {content_id: id, folder_id: folder_id}});

//         if (!doneResult.error && !doneResult.data) {
//             console.log("Mark content done is loading", id);
//             return;
//         }
//         if(doneResult.error){
//             console.log("Failed to mark content as done", id);
//             return;
//         }
//         if(doneResult.data) {
//             console.log(doneResult);
//             let deleted_list = deleted;
//             deleted_list.push(id);
//             setDeleted(deleted_list);
//         }
//     }

//     return (
//         <React.Fragment>
//             {
//                 data
//                 .filter(content => deleted.indexOf(content.id) === -1)
//                 .map((content, index) => <BacklogItem key={index} content={content} onContentDone={onContentDone}
//                                               handleContainerLoaded={handleContainerLoaded}/>)
//             }
//         </React.Fragment>
//     )
// }

// function BacklogContainer({ apolloClient }) {
//   const {data, loading, error} = getEmailByUser(10, 1);
//   if (error) {
//         return (
//             <Alert severity="error">
//                 <AlertTitle>Error</AlertTitle>
//                 Fail to acquire data
//             </Alert>
//         )
//     }
//   if (loading) return (<CircularProgress />);

//   const containers = [];
//   return (
//       <React.Fragment>
//         <Helmet title="Tasks" />
//         <Grid container spacing={4}>
//           <Grid item xs style={{ wordWrap: "break-word" }}>
//             <BacklogList containers={containers} data={data} apolloClient={apolloClient}/>
//           </Grid>
//         </Grid>
//       </React.Fragment>
//   );
// }

// function DashboardBacklogs({ theme }) {
//   return (
//         <DashboardLayout children={ <BacklogContainer theme={theme} apolloClient={apolloClient} /> }/>
//   )
// }

// export default withTheme(BacklogContainer);
// // export default withTheme(DashboardBacklogs);
// // export default Tasks;


