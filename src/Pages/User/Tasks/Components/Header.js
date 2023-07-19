import { 
  useContext 
} from "react";

import { 
  Row, 
  Spacer 
} from "@nextui-org/react";

import CreateTodo from "./Models/CreateTodo";
import MassDeleteTodo from "./Models/MassDeleteTodo";
import { TodoListContext } from "./../Contexts/TodoListContext";
import { SearchBar } from "./../../../../Components/List/Helpers/SearchBar";

export function Header({ onChange = () => {} }) {
  const todoListContext = useContext(TodoListContext);

  const searchInEntries = (e) => {
    todoListContext.dispatch(
      {
        data: {
          search: e.target.value,
        },
      },
      todoListContext.todoState
    );

    onChange({type:"searchEntries",data: e.target.value});
  };

  const showPaginatedEntries = (id) => {
    const paginate = todoListContext.todoState.paginate;
    paginate.pageSize = paginate.pageSizes[id];
    
    todoListContext.dispatch(
      {
        data: {
          paginate: paginate,
        },
      },
      todoListContext.todoState
    );

    onChange({type:"paginateEntries",data: paginate});
  };

  return (
    <Row justify="space-between">
      <Row justify="left">
        <SearchBar
          searchHandler={searchInEntries}
          optionHandler={showPaginatedEntries}
        />
      </Row>
      <Row justify="right">
        <CreateTodo handleClick={onChange} />
        {todoListContext.todoState.list !== null &&
          Object.values(todoListContext.todoState.selected).filter(
            (value) => value
          ).length > 0 && (
            <>
              <Spacer y={1} />
              <MassDeleteTodo handleClick={onChange} />
            </>
          )}
      </Row>
    </Row>
  );
}
