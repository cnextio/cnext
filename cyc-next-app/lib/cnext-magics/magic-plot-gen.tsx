import { CategoricalTypes, CodeGenResult, MagicPlotData, NumericalTypes, PlotType, IGetCardinalResult, IDimStatsResult } from "../interfaces/IMagic";
import store from '../../redux/store';
import { ifElse } from "../components/libs";
import { CommandName, ContentType, Message, WebAppEndpoint } from "../interfaces/IApp";
import socket from "../components/Socket";

export function socketInit(codeOutputComponent){
    socket.emit("ping", WebAppEndpoint.MagicCommandGen);
    socket.on(WebAppEndpoint.MagicCommandGen, (result: string) => {
        console.log(`${WebAppEndpoint.MagicCommandGen} got results...`);
        try {
            let codeOutput: Message = JSON.parse(result);                
            if (codeOutput.content_type == ContentType.STRING || codeOutput.error==true){
                codeOutputComponent(codeOutput); //TODO: move this to redux
            } else {
                if (codeOutput.content_type==ContentType.COLUMN_CARDINAL){
                    resolve(message);
                        // clearTimeout(timer);
                } else {  
                    console.log("dispatch text output:", codeOutput);                        
                    codeOutputComponent(codeOutput);
                }
            }
        } catch {

        }
    });
}

class PlotCommand {
    type: PlotType;
    df: string;    
    y: string[];
    x: string | undefined;
    color: string | undefined;
    size: string | undefined;
    shape: string | undefined;

    constructor (type: PlotType, df: string, y: string[], xs: string[]|undefined = undefined) {
        this.type = type;
        this.df = df;
        this.y = y;
        if (xs){
            this.x = xs.length > 0 ? xs[0] : undefined;
            this.color = xs.length > 1 ? xs[1] : undefined;
            this.size = xs.length > 2 ? xs[2] : undefined;
            this.shape = xs.length > 3 ? xs[3] : undefined
        }
        
    }

    toString() {
        let xDim;
        let yDim;
        let colorDim;
        let sizeDim;
        let shapeDim;

        if (this.x){
            xDim = `x='${this.x}'`;
        } 
        let yarray = ''
        if(Array.isArray(this.y)){
            if (this.y.length>1) {
                for(let c of this.y){
                    yarray = yarray.concat(`'${c}',`);
                }
                yDim = `y=[${yarray}]`;
            } else if (this.y.length==1) {
                if(this.x === undefined) {
                    // NOTE: we using x here to construct the command instead of y because it is easier for cnext magic
                    // language to generate the first part as y. But plotly accept univariate as x not y. Need to revisit this.
                    yDim = `x='${this.y}'`;  
                } else {
                    yDim = `y='${this.y}'`;  
                }  
            }
        }
        if (this.color){
            colorDim= `color='${this.color}'`;
        }
        if (this.shape){
            shapeDim= `shape='${this.shape}'`;
        }
        if (this.size){
            sizeDim= `size='${this.size}'`;
        }

        let command;

        if (yDim){
            command = `px.${this.type}(${this.df}`;
        }
        else{
            return undefined;
        }

        if (xDim){
            command += `, ${xDim}`;
        }
        if (yDim){
            command += `, ${yDim}`;
        }
        if (colorDim){
            command += `, ${colorDim}`;
        }
        if (sizeDim){
            command += `, ${sizeDim}`;
        }
        if (shapeDim){
            command += `, ${shapeDim}`;   
        }
        command += ')' ;   
        return command;
        // if (xdim && ydim)
        //     return `px.${this.type}(${this.df}, ${xdim}, ${ydim})`;
        // else if (xdim)            
        //     return `px.${this.type}(${this.df}, ${xdim})`;
        // else if (ydim)            
        //     return `px.${this.type}(${this.df}, ${ydim})`;    
        // else
        //     return undefined;
    }
}

const checkExist = true;
function isColExist(col: string|string[], allColMetadata: object){
    if (!checkExist)
        return true;
    if (typeof(col)==='string'){
        return ifElse(allColMetadata, col, null) ? true: false;
    } else if (Array.isArray(col)) {
        for(let c of col){
            if(!ifElse(allColMetadata, c, null))
                return false;
        }
        return true;
    }
}

/**
 * 
 * @param df_id : data frame id
 * @param col_name : name of the column whose elements will be counted
 * @param groupby : names of columns which colName column will be grouped by and counted
 * @returns 
 */
function _create_get_dim_stats_message(df_id: string, col_name: string, groupby: string[]|undefined = undefined) {
    let message: Message = {
        webapp_endpoint: WebAppEndpoint.MagicCommandGen,
        command_name: CommandName.get_cardinal,
        seq_number: 1,
        content: null,
        content_type: ContentType.STRING,
        error: false,
        metadata: groupby ? {df_id: df_id, col_name: col_name, groupby: groupby} : {df_id: df_id, col_name: col_name}
    };    
    return message;
}

function _send_message(message: Message, timeout = 10000) {
    return new Promise((resolve, reject) => {
        console.log(`send ${WebAppEndpoint.MagicCommandGen} message: `, message);
        // let timer;

        socket.emit(message.webapp_endpoint, JSON.stringify(message));

        socket.once(WebAppEndpoint.MagicCommandGen, (result: string) => {
            console.log(`${WebAppEndpoint.MagicCommandGen} got results...`);
            try {
                let codeOutput: Message = JSON.parse(result);                
                if (codeOutput.content_type == ContentType.STRING || codeOutput.error==true){
                    // codeOutputComponent(codeOutput); //TODO: move this to redux
                } else {
                    if (codeOutput.content_type==ContentType.COLUMN_CARDINAL){
                        let result: IGetCardinalResult = codeOutput.content;
                        resolve(result.cardinals);
                        // clearTimeout(timer);
                    } else {  
                        console.log("dispatch text output:", codeOutput);                        
                        // codeOutputComponent(codeOutput);
                    }
                }
            } catch {
                resolve(null);
            }
        });
        // set timeout so if a response is not received within a 
        // reasonable amount of time, the promise will reject
        // timer = setTimeout(() => {
        //     reject(new Error("timeout waiting for msg"));
        //     socket.removeListener('msg', responseHandler);
        // }, timeout);
    });    
}

function _handle_univariate_plot(df_id: string, y: string[]): CodeGenResult {
    let result: CodeGenResult;
    if(y.length == 1){                
        let plot = new PlotCommand(PlotType.HISTOGRAM, df_id, y);
        result = {code: plot.toString(), error: false}; 
    } else if(y.length > 1){                
        result = {error: true}; 
    } else {
        result = {error: true}; 
    }
    return result;
}

const SCATTER_MIN_X_UNIQUE=20
const LINE_MIN_X_UNIQUE=2

function _handle_bivariate_plot(df_id: string, x: string[], y: string[], dimStats: IDimStatsResult): CodeGenResult{
    let result: CodeGenResult;
    let plot;
    console.log('Magic _handle_bivariate_plot: ', df_id, x, y, dimStats);  
    if(dimStats.groupby_x0.std > 0) {
        plot = new PlotCommand(PlotType.SCATTER, df_id, y, x);        
    } else { //yCardinals.std === 0.
        // console.log('magicsGetPlotCommand: ', dimStats.max, dimStats.unique_counts[x[0]]);                
        if (dimStats.groupby_x0.max === 1 && dimStats.unique_counts[x[0]] > LINE_MIN_X_UNIQUE && dimStats.monotonics[x[0]]){
            // TODO: should also check xCardinal according to the design
            plot = new PlotCommand(PlotType.LINE, df_id, y, x);
        } else if(dimStats.unique_counts[x[0]] > SCATTER_MIN_X_UNIQUE) {
            plot = new PlotCommand(PlotType.SCATTER, df_id, y, x);
        } else {
            plot = new PlotCommand(PlotType.BAR, df_id, y, x);
        }       
    }
    result = plot ? {code: plot.toString(), error: false} : {error: true};
    return result;
}

function _handle_x_multivariate_plot(df_id: string, x: string[], y: string[], dimStats: IDimStatsResult): CodeGenResult{
    let result: CodeGenResult;
    let plot;
    console.log('Magic _handle_x_multivariate_plot: ', df_id, x, y, dimStats);                
    if(dimStats.groupby_x0.std > 0) {
        plot = new PlotCommand(PlotType.SCATTER, df_id, y, x);        
    } else { //yCardinals.std === 0.
        // console.log('magicsGetPlotCommand: ', dimStats.max, dimStats.unique_counts[x[0]]);                
        if (dimStats.groupby_x0.max === 1 && dimStats.unique_counts[x[0]] > LINE_MIN_X_UNIQUE && dimStats.monotonics[x[0]]){
            // TODO: should also check xCardinal according to the design
            plot = new PlotCommand(PlotType.LINE, df_id, y, x);
        } else if(dimStats.unique_counts[x[0]] > SCATTER_MIN_X_UNIQUE) {
            plot = new PlotCommand(PlotType.SCATTER, df_id, y, x);
        } else {
            plot = new PlotCommand(PlotType.BAR, df_id, y, x);
        }       
    }
    result = plot ? {code: plot.toString(), error: false} : {error: true};
    return result;
}

function _handle_x_multivariate_plot2(df_id: string, x: string[], y: string[], allColMetadata, dimStats: IDimStatsResult): CodeGenResult{
    let result: CodeGenResult;
    let plot;
    if(NumericalTypes.includes(allColMetadata[y[0]].type) && NumericalTypes.includes(allColMetadata[x[0]].type)){
        /** Possible plots: Scatter or Line */
        if (dimStats.groupby_x0.max === 1 && dimStats.unique_counts[x[0]] > LINE_MIN_X_UNIQUE && dimStats.monotonics[x[0]]){
            // TODO: should also check xCardinal according to the design
            plot = new PlotCommand(PlotType.LINE, df_id, y, x);
        } else if(dimStats.unique_counts[x[0]] > SCATTER_MIN_X_UNIQUE) {
            plot = new PlotCommand(PlotType.SCATTER, df_id, y, x);
        } else {
            // TODO: 1. consider when to use Bar when x cardinality is small for example year, month
            plot = new PlotCommand(PlotType.SCATTER, df_id, y, x);
        }
    } else if(CategoricalTypes.includes(allColMetadata[y[0]].type) && CategoricalTypes.includes(allColMetadata[x[0]].type)){
        plot = new PlotCommand(PlotType.BAR, df_id, y, x);
    } else if(NumericalTypes.includes(allColMetadata[y[0]].type) && CategoricalTypes.includes(allColMetadata[x[0]].type)){
        // TODO: 1. consider Scatter when x cardinality is too large. 
        // 2. consider groupby if y cardinality std > 0
        // 3. consider Line when y cardinality is 1 and x is monotonic
        plot = new PlotCommand(PlotType.BAR, df_id, y, x);
    } else {
        result = {error: true};
    }
    result = plot ? {code: plot.toString(), error: false} : {error: true};
    return result;
}

export function magicsGetPlotCommand(plotData: MagicPlotData): Promise<CodeGenResult>|CodeGenResult {     
    if (plotData.df == null){
        return {error: true};
    }
    let state = store.getState();
    let dfMetadata = ifElse(state.dataFrames.metadata, plotData.df, null);  
    // console.log('magicsGetPlotCommand: ', dfMetadata);   
    // console.info('magicsGetPlotCommand: ', plotData, dfMetadata);  
    if (dfMetadata){
        let allColMetadata = dfMetadata.columns;                
        console.debug(`magicsGetPlotCommand: ${plotData}, metadata: ${allColMetadata}`);        
        if (plotData.x == null && plotData.y && isColExist(plotData.y, allColMetadata)) {                
            return _handle_univariate_plot(plotData.df, plotData.y);
        } else if(plotData.x && plotData.y && isColExist(plotData.x, allColMetadata) && isColExist(plotData.y, allColMetadata)) {
            let message = _create_get_dim_stats_message(plotData.df, plotData.y[0], plotData.x);
            let y = plotData.y;
            let x = plotData.x;
            let df_id = plotData.df;
            return _send_message(message).then((dimStats: IDimStatsResult) => {
                console.log('magicsGetPlotCommand: ', dimStats, allColMetadata, x, y);   
                // if(x.length == 1){
                //     return _handle_bivariate_plot(df_id, x, y, dimStats);
                // } else { 
                //     return _handle_x_multivariate_plot2(df_id, x, y, allColMetadata, dimStats);
                // }
                return _handle_x_multivariate_plot2(df_id, x, y, allColMetadata, dimStats);
            });
        }
    }
    return {error: true};
}

