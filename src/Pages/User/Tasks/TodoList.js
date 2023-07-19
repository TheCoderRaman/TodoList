import { 
  useRef, 
  useState,
  useEffect, 
  useContext
} from "react";

import { 
  Col, 
  Row, 
  Text, 
  User,
  Badge,
  Image,
  Spacer,
  Tooltip
} from "@nextui-org/react";

import { Header } from "./Components/Header";
import { useTranslation } from "react-i18next";
import { search } from "./../../../Utils/search";
import EditTodo from "./Components/Models/EditTodo";
import { localDB } from "./../../../Modules/localDb";
import Table from "./../../../Components/List/Table";
import { status } from "./../../../Data/Todos/status";
import { header } from "./../../../Data/Todos/header";
import { paginator } from "./../../../Utils/paginator";
import DeleteTodo from "./Components/Models/DeleteTodo";
import { Box } from "./../../../Components/Helpers/Box";
import { isIterable } from "./../../../Utils/isIterable";
import { priority } from "./../../../Data/Todos/priority";
import { AppContext } from "./../../../Contexts/AppContext";
import { TodoListContext } from "./Contexts/TodoListContext";
import { AuthContext } from "./../../../Contexts/AuthContext";
import { Layout } from "./../../../Components/Layouts/Layout";
import { EditIcon } from "./../../../Components/Icons/EditIcon";
import Progress from "./../../../Components/List/Helpers/Progress";
import { DeleteIcon } from "./../../../Components/Icons/DeleteIcon";
import InfoCards from "./../../../Components/List/Helpers/InfoCards";
import { IconButton } from "./../../../Components/Buttons/IconButton";

export default function TodoList() {
  const { t } = useTranslation();

  const todoDb = localDB("local", "tasks");

  const authContext = useContext(AuthContext);
  const { settings } = useContext(AppContext);
  const todoListContext = useContext(TodoListContext);
  const {updatedAt,setUpdatedAt} = useContext(AppContext);

  const updateTable = useRef(true);
  const [updated, setUpdated] = useState(updateTable.current);

  const prepareTodoList = () => {
    const todoListPromise = new Promise((resolve, reject) => {
      const user = authContext.authUser.current;

      if (user === null) {
        return reject([
          "warning", t("User not found")
        ]);
      }

      let taskList = todoDb.getRecord(
        user.user_id
      );

      if (taskList === null) {
        taskList = {};
      }

      return resolve(taskList);
    }).then((data) => {
        let items = {};
        const todoState = todoListContext.todoState;

        let paginate = todoState.paginate;
        paginate.items = Object.keys(data).length;

        if (paginate.pageNumber < 1) {
          paginate.pageNumber = 1;
        }

        paginate.pages = Math.ceil(
          paginate.items / paginate.pageSize
        );

        if (paginate.pageNumber > paginate.pages) {
          paginate.pageNumber = paginate.pages;
        }
        
        if(
          todoState.search !== null && todoState.search !== ""
        ){
          items = search(todoState.search, Object.entries(data));
        } else {
          items = paginator(Object.entries(data),paginate);
        }

        todoListContext.resetStatus();
        todoListContext.resetPriority();

        for (const [, value] of Object.entries(data)) 
        {
          (todoListContext.status.current[
            Object.keys(status)[value.status]]++
          );
          
          if(Object.keys(status)[value.status] == 'closed'){
            continue;
          }

          (todoListContext.priority.current[
            Object.keys(priority)[value.priority]]++
          );
        }

        todoListContext.dispatch(
          {data:{
            ...paginate, list: items,
          }},todoListContext.todoState,
        );

        setUpdated(!updated);
      }).catch((args) => {
        if (settings.app.debug) {
          console.log("Error Caught: ", args);
        }

        if (isIterable(args)) {
          const [type, message] = args;
        }
      });
  };

  const updateHandler = () => {
    updateTable.current = !updateTable.current;
    prepareTodoList();
  };

  const selectionHandler = (selected) => {
    let todoSelectionList = todoListContext.todoState.selected;

    if(Object.keys(selected) <= 0){
      todoSelectionList = {};
    } else {
      Object.keys(selected).map((key) => {
        todoSelectionList[key] = (
          !todoSelectionList[key] ?? true
        );
      }).filter((value) => {return value});
    }

    todoListContext.dispatch(
      {data:{
        selected: todoSelectionList
      }},todoListContext.todoState,
    );
  };

  const paginationHandler = (paginate) => {
    todoListContext.dispatch(
      {data:{
        paginate:paginate
      }},todoListContext.todoState,
    );
  };

  useEffect(() => {
    updateHandler();
  },[updatedAt])

  useEffect(() => {
    if (!updateTable.current) {
      return;
    }

    updateHandler();
  });

  return (
    <Layout>
      <Box css={{ px: "$12", mt: "$8", "@xsMax": { px: "$10" } }}>
        <Spacer y={1} />

        <Row justify="center">
          <Text
            h1
            size={60}
            weight="bold"
            css={{
              textGradient: "45deg, $purple600 -20%, $pink600 100%",
            }}
          >
            {t(settings.app.name)}
          </Text>
        </Row>

        <InfoCards 
          colors={priority} 
          data={todoListContext.priority.current} 
          total={todoListContext.todoState.paginate.items} 
        />
      
        <Spacer y={3} />
        <Header onChange={updateHandler}/>
        <Spacer y={2} />

        <Progress 
          colors={status} 
          data={todoListContext.status.current} 
          total={todoListContext.todoState.paginate.items} 
        />

        <Table
          columns={header} 
          onChange={updateHandler}
          onSelection={selectionHandler}
          onPaginate={paginationHandler}
          isLoading={updateTable.current}
          paginate={todoListContext.todoState.paginate}
          rows={todoListContext.todoState.list === null 
            ? {} : todoListContext.todoState.list.map(
            ([key,value]) => {
              let row = [];
              [].concat(header).map((type,index) => {
                switch(type){
                  case 'user':
                    let _user = authContext.authUser.current;

                    row[index] = (
                      <User 
                        zoomed
                        squared 
                        size="xl"
                        css={{ p: 0 }}
                        src={_user === null 
                          ? settings.assets.avatar :_user.avatar
                        } 
                      />
                    );
                    break;
                  case 'task':
                    row[index] = (
                      <Text 
                        blockquote
                        color="white" 
                        css={{
                          minWidth: '50vh',
                          maxWidth: '50vh',
                          whiteSpace: 'normal',
                          wordBreak: 'break-all',
                          background: "$gradient"
                        }} 
                      >
                        {value['task']}
                      </Text>
                    );
                    break;
                  case 'status':
                    let _status = Object.keys(status)[value['status']];

                    row[index] = (
                      <IconButton>
                        <Image 
                          showSkeleton
                          objectFit="fill"
                          alt={t(_status.charAt(0).toUpperCase() + _status.slice(1))}
                          src={process.env.PUBLIC_URL+`/assets/img/status/${_status}.png`}
                        />
                      </IconButton>
                    );
                    break;
                  case 'actions':
                    row[index] = (
                      <Row justify="center" align="center">
                        <Col css={{ d: "flex" }}>
                          <Tooltip
                            content={t('Edit Todo')}
                          >
                            <EditTodo
                              todo={value}
                              handleClick={() => {
                                updateTable.current = !updateTable.current;
                                prepareTodoList();
                              }}
                            >
                              <IconButton>
                                <EditIcon size={20} fill="#979797" />
                              </IconButton>
                            </EditTodo>
                          </Tooltip>
                        </Col>
                        <Col css={{ d: "flex" }}>
                          <Tooltip
                            color="error"
                            content={t('Delete Todo')}
                          >
                            <DeleteTodo
                              todo={value}
                              handleClick={() => {
                                updateTable.current = !updateTable.current;
                                prepareTodoList();
                              }}
                            >
                              <IconButton>
                                <DeleteIcon size={20} fill="#FF0080" />
                              </IconButton>
                            </DeleteTodo>
                          </Tooltip>
                        </Col>
                      </Row>
                    );
                    break;
                  case 'priority':
                    let _priority = Object.keys(priority)[value['priority']];

                    row[index] = (
                      <Badge color={Object.values(priority)[value['priority']]}>
                        {t(_priority.charAt(0).toUpperCase() + _priority.slice(1))}
                      </Badge>
                    );
                    break;
                }
              });

              return [key, row];
            }
          )}
        />

        <Spacer y={1} />
      </Box>
    </Layout>
  );
}
