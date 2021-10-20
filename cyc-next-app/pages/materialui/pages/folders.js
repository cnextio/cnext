// import React, {forwardRef, useImperativeHandle, useRef, useState} from "react";
// import styled, {withTheme} from "styled-components";
// // import Card from "@material-ui/core/Card";
// // import CardContent from "@material-ui/core/CardContent";
// import TaskContainer, {EmailContentContainer, TaskList} from "./tasks";
// // import GridItem, {bottom, Responsive, WidthProvider} from "react-grid-layout";
// import {makeStyles} from "@material-ui/core/styles";
// import Box from "@material-ui/core/Box";
// // import Paper from "@material-ui/core/Paper";
// // import Grid from "@material-ui/core/Grid";
// import Typography from "@material-ui/core/Typography";
// import FormGroup from "@material-ui/core/FormGroup";
// import FormControlLabel from "@material-ui/core/FormControlLabel";
// import Checkbox from "@material-ui/core/Checkbox";
// const ResponsiveReactGridLayout = WidthProvider(Responsive);

// const useStyles = makeStyles((theme) => ({
//     taskContainer: {
//         padding: theme.spacing(2),
//         border: 1,
//         borderColor: theme.palette.grey[100],
//         borderStyle: "solid",
//         cursor: "grab"
//     },
//     textField: {
//         width: 380,
//     },
// }))

// function CategoryTitle({ title }) {
//     return (
//         <Typography variant="body1" mb={4} gutterBottom>
//             {title}
//         </Typography>
//     )
// }

// function CategoryCheck({ title, state, setState }) {
//     // const [state, setState] = useState(true);

//     const handleToggle = (event) => {
//         // setState(event.target.checked);
//         setState({ ...state, [title]: event.target.checked });
//     };

//     return (
//         <FormControlLabel
//             control={<Checkbox size='small' checked={state[title]} name={title} onChange={handleToggle}/>}
//             label={title}
//         />
//     )
// }

// function FolderContainer({ userID, folder, apolloClient }) {
//     const classes = useStyles();
//     const [state, setState] = React.useState({
//         Tasks: true,
//         Emails: true,
//     });
//     // let layouts = { lg: [{x: 0, y: 0, h: 1000, w: 10000}] };
//     // const tasksChildren = <TaskContainer apolloClient={apolloClient} userID={userID} folder={folder}/>;
//     return (
//         <React.Fragment>
//             <FormGroup row>
//                 <CategoryCheck title="Tasks" state={state} setState={setState}/>
//                 <CategoryCheck title="Emails" state={state} setState={setState}/>
//             </FormGroup>
//             <ResponsiveReactGridLayout
//                 className="layout"
//                 cols={{lg: 12, md: 10, sm: 6, xs: 4, xxs: 2}}
//                 // layouts={layouts}
//                 // onLayoutChange={this.onLayoutChange}
//                 // WidthProvider option
//                 measureBeforeMount={false}
//                 // style={{width: "fit-content"}}
//                 // width={7}
//                 // I like to have it animate on mount. If you don't, delete `useCSSTransforms` (it's default `true`)
//                 // and set `measureBeforeMount={true}`.
//                 useCSSTransforms={false}
//                 compactType={'horizontal'}
//                 preventCollision={!'vertical'}
//                 isResizable={true}
//             >
//                 {state["Tasks"] ?
//                     <Box data-grid={{w: 6, h: 1, x: 0, y: 0}} key='tasks' className={classes.taskContainer}>
//                         <CategoryTitle title='Tasks'/>
//                         <TaskContainer apolloClient={apolloClient} userID={userID} folder={folder}/>
//                     </Box> : <React.Fragment key='zzzzzz'/>}
//                 {state["Emails"] ?
//                     <Box data-grid={{w:3, h:1, x:0, y: 0}} key='emails' className={classes.taskContainer}>
//                         <CategoryTitle title='Emails' />
//                     </Box> : <React.Fragment key='zzzzzz'/>}
//                 <Box data-grid={{w:3, h:1, x:0, y: 0}} key='links' className={classes.taskContainer}>
//                     <CategoryTitle title='Links' />
//                 </Box>
//                 <Box data-grid={{w:3, h:1, x:0, y: 0}} key='files' className={classes.taskContainer}>
//                     <CategoryTitle title='Files' />
//                 </Box>
//             </ResponsiveReactGridLayout>
//         </React.Fragment>
//     )
// }

// export default withTheme(FolderContainer);
// // export default withTheme(DashboardTasks);
// // export default withTheme()(withStyles(styles)(DashboardTasks));
// // export default withStyles(styles, { withTheme: true })(DashboardTasks);
// // export default Tasks;


