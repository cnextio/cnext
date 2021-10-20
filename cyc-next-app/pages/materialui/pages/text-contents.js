// import {createMuiTheme, makeStyles, ThemeProvider} from "@material-ui/core/styles";
// import {Box, Divider as MuiDivider, IconButton, Link, Typography as MuiTypography} from "@material-ui/core";
// import React from "react";
// import styled from "styled-components";
// import {spacing} from "@material-ui/system";
// import FolderTitle from "./folder-title";
// import {Check, Close, ExpandLess, ExpandMore} from "@material-ui/icons";
// import { TaskProposalPopperContainer } from "./task-proposals";
// import {apolloClient, getTaskProposalByContent} from "../../../lib/database";
// import Tooltip from "@material-ui/core/Tooltip";
// import Popper from "@material-ui/core/Popper";
// import Paper from "@material-ui/core/Paper";
// import Fade from "@material-ui/core/Fade";
// import ClickAwayListener from "@material-ui/core/ClickAwayListener";
// import Backdrop from "@material-ui/core/Backdrop";
// import {Alert, AlertTitle} from "@material-ui/core";
// import CircularProgress from "@material-ui/core/CircularProgress";
// import Collapse from "@material-ui/core/Collapse";

// const Divider = styled(MuiDivider)(spacing);

// const Typography = styled(MuiTypography)(spacing);

// const TextLineTypography = styled(Typography)`
//   line-height: 20.0px;
//   font-size: 15px;
// `;

// const specialTextTheme = createMuiTheme({
//   palette: {
//     text: {
//       secondary: "#FFFFFF"
//     }
//   }
// });

// const useStyles = makeStyles((theme) => ({
//     button: {
//         fontSize: 25,
//     },
//     mainContent: {
//         whiteSpace: 'pre-line',
//         maxHeight: 600,
//         overflow: 'auto'
//     },
//     popover: {
//       pointerEvents: 'none',
//     },
//     paper: {
//         padding: theme.spacing(1),
//     },
//     divider: {
//         marginBottom: 1,
//     },
//     linkContainer: {
//         marginBottom: 1,
//     }
// }));

// const TextTopography = props => {
//     if (props.tooltip){
//         return (
//             <Tooltip title={props.tooltip} {...props}>
//                 <Box component={props.component?props.component:"span"} {...props}>
//                   <TextLineTypography component="span" {...props}/>
//                 </Box>
//             </Tooltip>
//         )
//     }
//     else {
//         return (
//             <Box component={props.component?props.component:"span"} {...props}>
//                 <TextLineTypography component="span" {...props}/>
//             </Box>
//         )
//     }
// }

// const EntityTextTypography = props => {
//   return (
//       <Link {...props}>
//           <TextTopography {...props}/>
//       </Link>
//   )
// }

// const TextLocation = props => {
//   return (<EntityTextTypography tooltip="Addess" color="error" {...props}/>)
// }

// const TextPerson = props => {
//   return (<EntityTextTypography tooltip="Name" color="error" {...props}/>)
// }

// const TextDate = props => {
//     return (<EntityTextTypography  {...props}/>)
// }

// function EntityWithPopperTask({ folder, handleFolderChange, taskProposal, children }) {
//     const classes = useStyles();
//     const [anchorEl, setAnchorEl] = React.useState(null);

//     const handlePopoverOpen = (event) => {
//         setAnchorEl(event.currentTarget);
//     };

//     const handlePopoverClose = () => {
//         setAnchorEl(null);
//     };
//     // console.log(taskProposal);
//     return (
//       <React.Fragment>
//           <EntityTextTypography
//               aria-describedby="add-task"
//               onClick={handlePopoverOpen}
//               tooltip={taskProposal.done==0 ? 'Click to add task' : 'Task added or removed'}
//               children={children}
//               />
//           {taskProposal.done == 0 ?
//               <TaskProposalPopperContainer
//                   folder={folder}
//                   handleFolderChange={handleFolderChange}
//                   taskProposal={taskProposal}
//                   handleContainerClose={handlePopoverClose}
//                   anchorEl={anchorEl}/> : null
//           }
//       </React.Fragment>
//     )

// }

// const TextOther = props => {
//   return (<EntityTextTypography text_color="text.secondary" bgcolor="info.main" {...props}/>)
// }

// const specialEntities = ["ORGANIZATION", "COMMERCIAL ITEM", "TITLE", "QUANTITY", "LOCATION"]

// function FormatedEntity({ folder, handleFolderChange, entity, index, taskProposals }) {
//   const classes = useStyles();
//   if (entity.Type==="PERSON") return (<TextPerson>{entity.Text}</TextPerson>);
//   if (entity.Type==="DATE_TIME") return (<TextDate>{entity.Text}</TextDate>);
//   //TODO need a better way to handle this. For now we assume TASK only show up when there is taskProposals
//   if (entity.Type==="TASK") {
//       if (taskProposals) {
//           return (
//               <EntityWithPopperTask
//                   folder={folder}
//                   handleFolderChange={handleFolderChange}
//                   taskProposal={taskProposals[entity.TaskOrder]}>
//                   {entity.Text}
//               </EntityWithPopperTask>
//           );
//       }
//       else {
//           return (<TextDate>{entity.Text}</TextDate>);
//       }
//   }
//   if (entity.Type==="LOCATION") return (<TextLocation>{entity.Text}</TextLocation>);
//   if (entity.Type==="LINK") return (<EntityTextTypography href={entity.Url}>{entity.Text}</EntityTextTypography>);
//   //just hide the thread info for now
//   if (entity.Type==="THREAD") return (<TextTopography></TextTopography>);
//   // if (specialEntities.includes(entity.Type)) return (<TextOther>{entity.Text}</TextOther>);

//   return (<TextTopography>{entity.Text}</TextTopography>);
// }

// function getEntitiesObject(entities_text){
//     let entities = [];
//     // TODO: find better handling of this corner case, print out proper log
//     if (entities_text !== null && entities_text !== "[]"){
//         const parsed_json = JSON.parse(entities_text)
//         if (parsed_json.length > 0){
//           const entities_obj = JSON.parse(entities_text)[0]
//           if ('Entities' in entities_obj){
//             entities = JSON.parse(entities_text)[0]['Entities'];
//           }
//         }
//     }
//     return entities;
// }

// function AnnotatedText({ folder, handleFolderChange, content, taskProposals }) {
//   const raw_content = content.raw_content;
//   const raw_text = JSON.parse(raw_content)['text_content'];

//   const entities_text = content.entities;
//   let entities = getEntitiesObject(entities_text);

//   entities = filterOutDateEntities(entities);
//   // entities = addLinkEntities(raw_text, entities);
//   entities = addThreadedContentEntity(raw_text, entities);

//   // TODO: The following implementation is assuming that entities array is ordered by `BeginOffset`
//   //  without `LINK` entities, the order is satisfied because the return for AWS already sorted
//   //  but with `LINK`, we need to do the sorting here, which may slow thing down
//   entities = entities.sort(function(e1, e2){
//     if (e1.BeginOffset != e2.BeginOffset){
//         return e1.BeginOffset - e2.BeginOffset;
//     } else {
//       if (e1.Type === 'LINK') return -1;
//       if (e2.Type === 'LINK') return 1;
//       return 0;
//     }
//   })

//   let cur_offset = 0;
//   let new_entities = [];

//   for (const entity of entities) {
//     if (entity.BeginOffset > cur_offset) {
//       // create a pseudo entity to store the text from cur_offset to entity.BeginOffset
//       new_entities.push({
//         "Type": "NONE",
//         "Text": raw_text.substr(cur_offset, entity.BeginOffset-cur_offset),
//         "BeginOffset": cur_offset,
//         "EndOffset": entity.BeginOffset
//       });
//       cur_offset = entity.BeginOffset;
//     }

//     // implement Solution 3 in the Design.md
//     // `if(entity.BeginOffset < cur_offset)` i.e. there are entities within a link => the entity will be ignored
//     // instead of implement an if that do nothing, we will do the following `if`. This will guarantee that if the
//     // first `if` is executed, this `if` will be executed too. If the first `if` is not executed then this `if` might
//     // be executed or an entity will be ignore.
//     if (cur_offset==entity.BeginOffset) {
//       new_entities.push(entity);
//       // move the cur_offset to the end of the next entity
//       cur_offset = entity.EndOffset;
//       // console.log(cur_offset, entity.BeginOffset, raw_text.substr(cur_offset, entity.BeginOffset));
//     }
//   }
//   if (cur_offset < raw_text.length-1) {
//     new_entities.push({
//       "Type": "NONE",
//       "Text": raw_text.substr(cur_offset, raw_text.length-cur_offset),
//       "BeginOffset": cur_offset,
//       "EndOffset": raw_text.length
//     });
//   }
//   // console.log(new_entities)
//   let formatted_entities = new_entities.map((entity, index) => {
//       return (<FormatedEntity
//           key={index}
//           folder={folder}
//           handleFolderChange={handleFolderChange}
//           entity={entity}
//           index={index}
//           taskProposals={taskProposals}/>)
//   });
//   return formatted_entities;
// }

// function LinksList({ content }) {
//     const entities_text = content.entities;
//     let entities = getEntitiesObject(entities_text);

//     let formatted_links = entities
//         .filter(entity => entity.Type === 'LINK')
//         .map((entity, index) => (
//             <Box key={index}>
//                 <EntityTextTypography
//                     href={entity.Url}
//                     children={entity.Text}
//                 />

//             </Box>
//         ))
//     return formatted_links;
// }

// export function LinksContainer({ content, ...rest }){
//     const classes = useStyles();
//     const [isOpen, setIsOpen] = React.useState(false);

//     const handleChange = () => {
//         setIsOpen((prev) => !prev);
//     }

//     return (
//         <Box {...rest}>
//             <EntityTextTypography onClick={handleChange}>Links</EntityTextTypography>
//             {/*{isOpen ? (<ExpandMore/>) : (<ExpandLess/>)}*/}
//             <div>
//                 <Collapse in={isOpen}>
//                   <Paper>
//                     <LinksList content={content}/>
//                   </Paper>
//                 </Collapse>
//             </div>
//         </Box>
//     )
// }
// function addLinkEntities(text, entities){
//   const FullMarkdownRegexLinks = /\[([^\[]+)\]\(<([^\(]+)>\s*("\S+")*\)/gm;
//   const RegexSimpleLinks = /(^|[^\[<])http(s)*:\/\/\S+/gm;
//   let matches = text.matchAll(FullMarkdownRegexLinks);
//   if (matches !== null){
//       for (const match of matches) {
//           entities.push({
//             "Type": "LINK",
//             "Text": match[1],
//             "Url": match[2],
//             "BeginOffset": match.index,
//             "EndOffset": match.index+match[0].length
//           });
//       }
//   }

//   matches = text.matchAll(RegexSimpleLinks);
//   if (matches !== null){
//       for (const match of matches) {
//           entities.push({
//             "Type": "LINK",
//             "Text": match[0],
//             "Url": match[0],
//             "BeginOffset": match.index,
//             "EndOffset": match.index+match[0].length
//           });
//       }
//   }
//   return entities;
// }

// function addThreadedContentEntity(text, entities){
//   // Match this string
//   // "**From:** "Bui, Bach" <bachbui@amazon.com>
//   // **Date:** Monday, August 17, 2020 at 6:02 PM"
//   const threadContentStarterRegex = /^\*\*From:\*\* (\"[^"\n]+\" \<[^<>\n]+@[^>\n]+>|[^@\n]+@.+)\n\*\*(Date|When):\*\*.+\n/gm;
//   let matches = text.matchAll(threadContentStarterRegex);
//   if (matches !== null) {
//     for (const match of matches) {
//       entities.push({
//         "Type": "THREAD",
//         "Text": text.substring(match.index, text.length),
//         "BeginOffset": match.index,
//         "EndOffset": match.index + text.length
//       });
//       //only handle the first match
//       break;
//     }
//   }
//   return entities;
// }

// function filterOutDateEntities(entities){
//   // We use the newer version of AWS to get the DATE_TIME.
//   // Will filter out DATE now, should do this in server side
//   // entities =
//   return entities.filter(entity => (entity.Type!='DATE') && (entity.Type!='DATE_TIME'));
// }

// function TextContent({ folder, content, onClose }) {
//   const classes = useStyles();
//   //TODO: fix the issue with move item around
//   const raw_content = content.raw_content;
//   //TODO: dedup the json parse here, there is another one in `AnnotatedText`
//   const subject = JSON.parse(raw_content)['subject'];
//   const from_address = JSON.parse(raw_content)['from'];
//   //TODO: find better place for style

//   return (
//       <React.Fragment>
//         <Box display="flex" flexDirection="row">
//           <Box flexGrow={1}>
//             <Typography variant="h6" gutterBottom>
//               {subject}
//             </Typography>
//             <Typography variant="body2" mb={2}>
//               From: {from_address}
//             </Typography>
//           </Box>
//           <Box>
//             <IconButton>
//               <Check
//                   color='primary'
//                   className={classes.button}
//                   onClick={onClose}/>
//             </IconButton>
//           </Box>
//         </Box>
//         <Divider mb={4}/>
//         <TextLineTypography
//             gutterBottom
//             style={{whiteSpace: 'pre-line', maxHeight: 600, overflow: 'auto'}}>
//             <AnnotatedText key="" folder={folder} content={content}/>
//         </TextLineTypography>
//       </React.Fragment>
//   );
// }

// export function TextContentWithInlineProposal({ folder, handleFolderChange, content, onClose }) {
//     const classes = useStyles();
//     //TODO: fix the issue with move item around
//     const raw_content = content.raw_content;
//     //TODO: dedup the json parse here, there is another one in `AnnotatedText`
//     const subject = JSON.parse(raw_content)['subject'];
//     const from_address = JSON.parse(raw_content)['from'];
//     //TODO: find better place for style

//     let {data, loading, error} = getTaskProposalByContent(content.id);
//     if (error) {
//         return (
//             <Alert severity="error">
//                 <AlertTitle>Error</AlertTitle>
//                 Fail to acquire task proposals
//             </Alert>
//         )
//     }
//     if (loading) {
//         return (<CircularProgress/>);
//     }

//     // console.log(data);
//     return (
//       <React.Fragment>
//         <Box display="flex" flexDirection="row">
//           <Box flexGrow={1}>
//             <Typography variant="h6" gutterBottom>
//               {subject}
//             </Typography>
//             <Typography variant="body2" mb={2}>
//               From: {from_address}
//             </Typography>
//           </Box>
//           <Box>
//             <IconButton onClick={onClose}>
//               <Check
//                   color='primary'
//                   className={classes.button}
//               />
//             </IconButton>
//           </Box>
//         </Box>
//         <Divider className={classes.divider}/>
//         <TextLineTypography
//             gutterBottom
//             style={{whiteSpace: 'pre-line', maxHeight: 600, overflow: 'auto'}}>
//             <AnnotatedText
//                 folder={folder}
//                 handleFolderChange={handleFolderChange}
//                 content={content}
//                 taskProposals={data}/>
//         </TextLineTypography>
//         <Divider className={classes.divider}/>
//         <LinksContainer className={classes.linkContainer} content={content}/>
//       </React.Fragment>
//     );
// }

// export default TextContent

