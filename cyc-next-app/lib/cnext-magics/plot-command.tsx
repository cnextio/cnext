import { CategoricalTypes, CodeGenResult, MagicPlotData, NumericalTypes, PlotType } from "../interfaces/IMagic";
import store from '../../redux/store';
import { ifElse } from "../components/libs";

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

export function magicsGetPlotCommand(plotData: MagicPlotData): CodeGenResult {     
    if (plotData.df == null){
        return {error: true};
    }
    let state = store.getState();
    let dfMetadata = ifElse(state.dataFrames.metadata, plotData.df, null);  
    // console.log('magicsGetPlotCommand: ', dfMetadata);   
    console.info('magicsGetPlotCommand: ', plotData, dfMetadata);  
    if (dfMetadata){
        let allColMetadata = dfMetadata.columns;                
        // console.debug(`magicsGetPlotCommand: ${plotData}, metadata: ${allColMetadata}`);        
        if (plotData.x == null && plotData.y && isColExist(plotData.y, allColMetadata)) {  
            // handle univariate data                
            if(plotData.y.length == 1){                
                let plot = new PlotCommand(PlotType.HISTOGRAM, plotData.df, plotData.y);
                return {code: plot.toString(), error: false}; 
            } else if(plotData.y.length > 1){                
            } 
        } else if(plotData.x && plotData.y && isColExist(plotData.x, allColMetadata) && isColExist(plotData.y, allColMetadata)) {
            // handle bivariate data        
            if(plotData.y.length == 1){ 
                if(NumericalTypes.includes(allColMetadata[plotData.y[0]].type) && NumericalTypes.includes(allColMetadata[plotData.x].type)){
                    let plot = new PlotCommand(PlotType.SCATTER, plotData.df, plotData.y, plotData.x);
                    return {code: plot.toString(), error: false};
                } else if(CategoricalTypes.includes(allColMetadata[plotData.y[0]].type) && CategoricalTypes.includes(allColMetadata[plotData.x].type)){
                    let plot = new PlotCommand(PlotType.BAR, plotData.df, plotData.y, plotData.x);
                    return {code: plot.toString(), error: false};
                } else if(NumericalTypes.includes(allColMetadata[plotData.y[0]].type) && CategoricalTypes.includes(allColMetadata[plotData.x].type)){
                    let plot = new PlotCommand(PlotType.BAR, plotData.df, plotData.y, plotData.x);
                    return {code: plot.toString(), error: false};
                } 
            }
        }
    }
    return {error: true};
}

