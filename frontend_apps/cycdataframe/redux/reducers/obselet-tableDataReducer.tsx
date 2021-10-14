import {DataTableContent} from "../../lib/components/Interfaces"

// for testing
import {tableData as testTableData} from "../../lib/components/tests/TestTableData"  

const initialState = [
    {
        // for testing
        data: testTableData,
    }
]
  
  const UPDATE_DATA = 'UPDATE_DATA'
  const addData = (data: DataTableContent) => ({ type: UPDATE_DATA, data })

  export default function tableData(state = initialState, action: any) {
    switch (action.type) {
      case UPDATE_DATA:
        return [
          ...state,
          {            
            data: action.data
          }
        ]
      default:
        return state
    }
  }