import { 
  Row, 
  Text, 
  Table, 
  Spacer, 
  Loading 
} from "@nextui-org/react";

import Pagination from "./Helpers/Pagination";
import { useTranslation } from "react-i18next";
import { paginateConfig } from "./../../Data/Table/paginateConfig";

export default function ListTable({
  rows = [[]],
  columns = [], 
  isLoading = false,
  onChange = () => {},
  paginator = () => {},
  onSelection = () => {},
  paginate = paginateConfig
}) { 
  const { t } = useTranslation();

  const handleSelection = (select) => {
    let selection = {};

    if(select == 'all'){
      rows.map((row) => {
        const [key] = row;
        selection[key] = true;
      });
    } else if(select.size > 0){
      for (const [, value] of select.entries()) {
        selection[value.split("#").at(1)] = true;
      }
    }

    onSelection(selection); onChange("selector");
  };

  return (
    <div style={{height: '100vh'}}>
      <div style={{
        height: '55vh',
        maxHeight: '55vh',
        overflowY: 'scroll'
      }}>
        <Table
          css={{
            height: "auto",
            minWidth: "100vh",
            minHeight: "50vh",
          }}
          lined
          shadow
          compact
          striped
          bordered
          animated
          headerLined
          color="secondary"
          selectionMode="multiple"
          onSelectionChange={handleSelection}
        >
          <Table.Header>
            {columns.length > 0 && columns.map((value,index) => {
              return (
                <Table.Column key={`table-column-${index}`}>
                  {t(value.replace(
                    value.slice(0,1),
                    value.at(0).toUpperCase()
                  ))}
                </Table.Column>
              );
            })}
          </Table.Header>

          <Table.Body>
            {rows.length > 0 && rows.map((row,index) => {
              const [key,cells] = row; 

              return (
                <Table.Row key={`table-row-${index}#${key}`}>
                  {cells.length > 0 && cells.map((cell,id) => {
                    return (
                      <Table.Cell key={`table-cell-${index}#${id}`}>
                        {cell}
                      </Table.Cell>
                    );
                  })}
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>

        {isLoading && (
          <Loading 
            size="xl"
            css={{
              left: '50%', 
              top: '50%',
              zIndex: 1000,
              position: "absolute", 
              background:'$blur',
              transform: 'translate(-50%, -50%)'
            }}
          >{t('Loading')}</Loading>
        )}

        {rows.length <= 0 && (
          <Text 
            size={30}
            css={{
              zIndex: 1,
              left: '50%', 
              top: '50%',
              position: "absolute", 
              transform: 'translate(-50%, -50%)'
            }}
          >{t('No Result Found')}</Text>
        )}
      </div>
      
      <Spacer y={2} />

      <Row justify="center"> 
        <Pagination 
          paginate={paginate}
          onPaginate={paginator} 
          onChange={() => onChange("paginator")}
        /> 
      </Row>
    </div>
  );
}
