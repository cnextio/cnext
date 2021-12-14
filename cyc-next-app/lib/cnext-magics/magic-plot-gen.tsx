import { CategoricalTypes, CodeGenResult, MagicPlotData, NumericalTypes, PlotType, IGetCardinalResult } from "../interfaces/IMagic";
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
    x: string | undefined;
    y: string[];

    constructor (type: PlotType, df: string, y: string[], x: string|undefined = undefined) {
        this.type = type;
        this.df = df;
        this.x = x;
        this.y = y;
    }

    toString() {
        let xdim;
        let ydim;
        if (this.x){
            xdim = `x='${this.x}'`;
        } 
        let yarray = ''
        if(Array.isArray(this.y)){
            if (this.y.length>1) {
                for(let c of this.y){
                    yarray = yarray.concat(`'${c}',`);
                }
                ydim = `y=[${yarray}]`;
            } else if (this.y.length==1) {
                if(this.x === undefined) {
                    // NOTE: we using x here to construct the command instead of y because it is easier for cnext magic
                    // language to generate the first part as y. But plotly accept univariate as x not y. Need to revisit this.
                    ydim = `x='${this.y}'`;  
                } else {
                    ydim = `y='${this.y}'`;  
                }  
            }
        }
        if (xdim && ydim)
            return `px.${this.type}(${this.df}, ${xdim}, ${ydim})`;
        else if (xdim)            
            return `px.${this.type}(${this.df}, ${xdim})`;
        else if (ydim)            
            return `px.${this.type}(${this.df}, ${ydim})`;    
        else
            return undefined;
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
function _create_get_cardinal_message(df_id: string, col_name: string, groupby: []|undefined = undefined) {
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

function _handle_bivariate_plot_data(df_id: string, x: string[], y: string[], allColMetadata): CodeGenResult{
    let result: CodeGenResult;
    if(NumericalTypes.includes(allColMetadata[y[0]].type) && NumericalTypes.includes(allColMetadata[x[0]].type)){
        let plot = new PlotCommand(PlotType.SCATTER, df_id, y, x[0]);
        result = {code: plot.toString(), error: false};
    } else if(CategoricalTypes.includes(allColMetadata[y[0]].type) && CategoricalTypes.includes(allColMetadata[x[0]].type)){
        let plot = new PlotCommand(PlotType.BAR, df_id, y, x[0]);
        result = {code: plot.toString(), error: false};
    } else if(NumericalTypes.includes(allColMetadata[y[0]].type) && CategoricalTypes.includes(allColMetadata[x[0]].type)){
        let plot = new PlotCommand(PlotType.BAR, df_id, y, x[0]);
        result = {code: plot.toString(), error: false};
    } else {
        result = {error: true};
    }
    return result;
}

function _handle_univariate_plot_data(df_id: string, y: string[]): CodeGenResult {
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
            return _handle_univariate_plot_data(plotData.df, plotData.y);
        } else if(plotData.x && plotData.y && isColExist(plotData.x, allColMetadata) && isColExist(plotData.y, allColMetadata)) {
            let message = _create_get_cardinal_message(plotData.df, plotData.y[0]);
            let y = plotData.y;
            let x = plotData.x;
            let df_id = plotData.df;
            return _send_message(message).then(result => {
                console.log('magicsGetPlotCommand: ', result, allColMetadata, y);                
                return _handle_bivariate_plot_data(df_id, x, y, allColMetadata)
            });
        }
    }
    return {error: true};
}

