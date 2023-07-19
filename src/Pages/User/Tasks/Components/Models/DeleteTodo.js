import React, { 
  useRef, 
  useState, 
  useEffect, 
  useContext 
} from "react";

import { 
  Row,
  Text, 
  Input,
  Badge,
  Modal, 
  Button,
  Spacer
} from "@nextui-org/react";
  
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { localDB } from "./../../../../../Modules/localDb";
import { AppContext } from "./../../../../../Contexts/AppContext";
import { AuthContext } from "./../../../../../Contexts/AuthContext";
import { CloseIcon } from "./../../../../../Components/Icons/CloseIcon";
import { DeleteIcon } from "./../../../../../Components/Icons/DeleteIcon";

export default function EditTodo({ 
    children = null, 
    handleClick = () => {},
    handleOpenRef = useRef(),
    handleCloseRef = useRef(),
    todo = {
      task_id: null, task:null, priority:0, status:0
    }
}) {
    const {
        reset,
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ mode: 'all' });

    const { t } = useTranslation();

    const todoDb = localDB("local", "tasks");
   
    const authContext = useContext(AuthContext);
    const { settings } = useContext(AppContext);

    const [visible, setVisible] = useState(false);
    const [todoDelete,setTodoDelete] = useState({});
    const [processing, setProcessing] = useState(false);
    const [submitError, setSubmitStatus] = useState(null);

    if(JSON.stringify(todoDelete) != JSON.stringify(todo)){
      setTodoDelete(todo);
     
      reset({
        task: todo.task,
        status: todo.status,
        task_id: todo.task_id,
        priority: todo.priority,
      })
    }

    const onSubmit = async (data, e) => {
      e.preventDefault();
      setSubmitStatus(null);

      const deleteTodoPromise = new Promise((resolve, reject) => {
        setProcessing(true);

        setTimeout(function () {
          resolve(data);
        }, 1000);
      }).then((data) => {
          setProcessing(false);
  
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
  
          Object.keys(taskList).map((key) => {
            if (data.task_id != key) {
              return;
            }
      
            if (taskList[key] === undefined) {
              return;
            }
      
            delete taskList[key];
          });
      
          todoDb.setRecord(
            user.user_id, taskList
          );
  
          setSubmitStatus({
            status: "success",
            message: t("Task successfuly deleted"),
          });
  
          handleClick({type: "deleteTodo",data: taskList});
        }).catch((args) => {
          setProcessing(false);
  
          if (settings.app.debug) {
            console.log("Error Caught: ", args);
          }
  
          if (isIterable(args)) {
            const [type, message] = args;
  
            setSubmitStatus({
              status: type,
              message: message,
            });
          } else {
            setSubmitStatus({
              status: "danger",
              message: t("Something went wrong"),
            });
          }
        });
    };

    const openHandler = () => {
      setVisible(true);
      setSubmitStatus(null);
    };

    const closeHandler = () => {
        setVisible(false);
        setSubmitStatus(null);
    };
    
    useEffect(() => {
        handleOpenRef.current = openHandler;
        handleCloseRef.current = closeHandler;

        if(submitError === null){
          return;
        }
    
        if(submitError.status !== 'success'){
          return;
        }
    
        reset(todo);
    }, [submitError]);

    return (
      <div>
        {children !== null ? <div onClick={openHandler}>{children}</div> : (<Button 
            auto 
            shadow 
            size="xl"
            color="error"
            onPress={openHandler}
        >
          <EditIcon title={t('Delete')} fill="currentColor" />
        </Button>)}
        <Modal
          blur
          closeButton
          open={visible}
          onClose={closeHandler}
          aria-labelledby="modal-title"
        >
          <form
            method="post"
            name="FormDeleteTodo"
            encType="multipart/form-data"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Modal.Header>
              <Text id="modal-title" size={18}>
                  {t('Delete Todo')}
              </Text>
            </Modal.Header>
            <Modal.Body>

              <Input 
                type="hidden" 
                value={todo.task_id}
                disabled={processing}
                css={{ display: "none" }}
                {...register('task_id')}
              />

              <Row justify="center">
                <Text color="warning" size={30}>
                  {t('Are You Sure')} ?
                </Text>
              </Row>
              
              <Row justify="center">
                <Text color="white">
                  {t('It can not be undone')} !
                </Text>
              </Row>
              
              <Row justify="center">
                {submitError !== null && (
                    <Badge isSquared color={
                     {
                       danger: 'error',
                       warning: 'warning',
                       success: 'success'
                     }[
                      submitError.status
                    ]}> {submitError.message} </Badge>
                )}
              </Row>

            </Modal.Body>
            <Modal.Footer>
              <Row justify="center">
                <Button 
                  auto 
                  flat 
                  color="warning" 
                  onPress={closeHandler}
                  icon={<CloseIcon fill="currentColor" filled />}
                >
                  {t('Close')}
                </Button>
                
                <Spacer x={1} />

                <Button 
                  auto 
                  type='submit'
                  color='error'
                  //onPress={closeHandler}
                  icon={<DeleteIcon fill="currentColor" filled />}
                >
                  {t('Delete')}
                </Button>
              </Row>
            </Modal.Footer>
          </form>
        </Modal>
      </div>
    );
}