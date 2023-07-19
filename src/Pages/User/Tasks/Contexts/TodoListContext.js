import { 
  useRef,
  useEffect,
  useReducer,
  useContext,
  createContext
} from "react";

import { status as statusData } from "./../../../../Data/Todos/status";
import { paginateConfig } from "./../../../../Data/Table/paginateConfig";
import { priority as priorityData } from "./../../../../Data/Todos/priority";

export const TodoListContext = createContext({
  todoState: {
    list: {},
    search: "",
    selected:{},
    paginate:paginateConfig
  },dispatch: () => {}
});

export const useThemeContext = () => {
  return useContext(TodoListContext);
};

export function TodoListContextProvider({
  children, 
  props = {}
}) {
  const [todoState,dispatch] = useReducer(
    (state,action) => 
    {
      return Object.assign(state,action.data);
    },{
      list: [],
      search: "",
      selected:[],
      paginate:paginateConfig
  });

  const status = useRef();
  const resetStatus = () => {
    status.current = Object.keys(statusData).reduce(
      (total,value) => {total[value] = 0;return total},{}
    )
  };

  const priority = useRef();
  const resetPriority = () => {
    priority.current = Object.keys(priorityData).reduce(
      (total,value) => {total[value] = 0;return total},{}
    )
  };

  useEffect(() => {
    resetStatus(); resetPriority();
  });

  return (
    <TodoListContext.Provider
      {...props}
      value={{
        todoState,dispatch,
        status,resetStatus,
        priority, resetPriority
      }}
    >
      {children}
    </TodoListContext.Provider>
  );
}

export default TodoListContextProvider;
