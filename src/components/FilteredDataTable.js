import React, { useState } from "react";
import _ from "lodash";
import DataTable from "react-data-table-component";

import { Search } from "@/app/admin/adminComponents/Search";
import useDebounce from "@/hooks/useDebounce";
import { master_csv } from "@/api/user";

function FilteredDataTable({
    inputProps = {},
    tableColumns = [],
    type = null,
}){
    const [filterText, setFilterText] = useState('');
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
    const [filteredData, setFilteredData] = useState([]);
    const [data, setData] = useState([]);

    const debouncedSearch = useDebounce(filterText, 1000);

    React.useEffect(() => {
        if(debouncedSearch){
            if(type === "masterCSV"){
                fetchData();
            }else{
                const result = searchDetails();
                setFilteredData(result)
            }
        }else{
            setData([]);
        }
    }, [debouncedSearch]);

    const fetchData = React.useCallback(async() => {
        if(debouncedSearch){
            try {
                const response = await master_csv(debouncedSearch);
                const data = response.data;
                setData(data);
            } catch (error) {
                console.log('Error fetching data:', error);
                setData([]);
            } finally {

            }
        }
    }, [debouncedSearch])

    function searchDetails(){
        const data = inputProps?.data;
        return (Array.isArray(data)) && data.filter((item) => {
            let name = "";
            const itemNames = Object.keys(item).filter((subItem) => {
                return tableColumns.some((nestedItem) => {
                    if(nestedItem?.includes(".")){
                        const splitNestedItem = nestedItem.split(".");
                        return subItem.toLowerCase() === splitNestedItem[0].toLowerCase();
                    }
                    return subItem.toLowerCase() === nestedItem.toLowerCase()
                })
            });
            const filterIndex = itemNames.findIndex((subItem) => {
                let subItemValue = "";
                if((typeof item[subItem] === "object") && !!item[subItem] && item[subItem] !== "null"){
                    const searchTableColumn = tableColumns.find((column) => {
                        let columnValue = `${_.get(item, column)}`?.toLowerCase();
                        // console.log("### COLUMN SEARCH: ", columnValue);
                        columnValue = columnValue?.substring(0, filterText.length);
                        return columnValue === filterText.toLowerCase()
                    })
                    subItemValue = (searchTableColumn)? `${_.get(item, searchTableColumn)}` : "";
                }else{
                    subItemValue = `${item[subItem]}`;
                }
                if(subItemValue?.includes("£")){
                    const splitValue = subItemValue?.split("£");
                    subItemValue = splitValue[splitValue.length - 1];
                    subItemValue = String(subItemValue)?.toLowerCase()?.trim();
                }
                const searchSubItem = subItemValue?.substring(0, filterText.length)?.toLowerCase();
                console.log("$$$ subItemValue: ", searchSubItem, " === ", filterText, searchSubItem === filterText.toLowerCase())
                return (searchSubItem === filterText.toLowerCase());
            })
            if(filterIndex > -1){
                const keyName = itemNames[filterIndex];
                if((typeof item[keyName] === "object") && !!item[keyName] && item[keyName] !== "null"){
                    // console.log("^^^ FILTER INDEX: ", filterIndex, item[keyName])
                    const searchTableColumn = tableColumns.find((column) => {
                        let columnValue = `${_.get(item, column)}`?.toLowerCase();
                        // console.log("### COLUMN SEARCH: ", columnValue);
                        if(columnValue?.includes("£")){
                            const splitValue = columnValue?.split("£");
                            columnValue = splitValue[splitValue.length - 1];
                            columnValue = columnValue?.toLowerCase()?.trim()
                        }
                        columnValue = columnValue?.substring(0, filterText.length)?.toLowerCase();
                        const result = columnValue === filterText.toLowerCase();
                        if(result){
                            name = columnValue;
                        }
                        return result;
                    })                    
                }else if((item[keyName] !== null) && (item[keyName] !== "null")){
                    const itemKeyName = String(item[keyName]);
                    if(itemKeyName?.includes("£")){
                        const splitValue = itemKeyName?.split("£");
                        name = splitValue[splitValue.length - 1];
                        name = name?.trim();
                    }else{
                        name = `${itemKeyName}`;
                    }
                }
            }
            if(!name){
                return false;
            }
            const searchTitle = name?.substring(0, filterText.length);
            if(searchTitle.toLowerCase() === filterText.toLowerCase()){
                return true;
            }
            return false;
        })
    }

    const subHeaderComponentMemo = React.useMemo(() => {
        const handleClear = () => {
          if (filterText) {
            setResetPaginationToggle(!resetPaginationToggle);
            setFilterText('');
          }
        };
        return (
            <Search 
                search={filterText}
                setSearch={setFilterText}
                onClear={handleClear} 
            />
        );
    }, [filterText, resetPaginationToggle]);

    let dataTableProps = {
        ...inputProps,
        data: (filterText)? (type === "masterCSV")? data : filteredData : inputProps?.data,
        paginationTotalRows: (filterText)? filteredData.length : (inputProps?.data?.length || "0")
    }
      
    return (
        <DataTable
            {...dataTableProps}
            // paginationResetDefaultPage={resetPaginationToggle} // optionally, a hook to reset pagination to page 1
            subHeader 
            subHeaderComponent={subHeaderComponentMemo} 
            subHeaderAlign={"left"}
            // persistTableHead
        />
    )
}

export {FilteredDataTable};