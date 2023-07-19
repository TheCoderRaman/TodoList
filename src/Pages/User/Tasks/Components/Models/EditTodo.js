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
  Textarea, 
  Dropdown,
} from "@nextui-org/react";

import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { localDB } from "./../../../../../Modules/localDb";
import { status } from "./../../../../../Data/Todos/status";
import { isIterable } from "./../../../../../Utils/isIterable";
import { priority } from "./../../../../../Data/Todos/priority";
import { AppContext } from "./../../../../../Contexts/AppContext";
import { AuthContext } from './../../../../../Contexts/AuthContext';
import { EditIcon } from "./../../../../../Components/Icons/EditIcon";
import { CloseIcon } from "./../../../../../Components/Icons/CloseIcon";

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
        setValue,
        handleSubmit,
        formState: { errors },
    } = useForm({ mode: 'all' });

    const { t } = useTranslation();

    const todoDb = localDB("local", "tasks");

    const authContext = useContext(AuthContext);
    const { settings } = useContext(AppContext);

    const [todoEdit,setTodoEdit] = useState({});
    const [visible, setVisible] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [submitError, setSubmitStatus] = useState(null);

    const [selectedStatus,setSelectedStatus] = useState(
      Object.keys(status).at(todo.status)
    );
    const [selectedPriority,setSelectedPriority] = useState(
      Object.keys(priority).at(todo.priority)
    );

    if(JSON.stringify(todoEdit) != JSON.stringify(todo)){
      setTodoEdit(todo)

      setSelectedStatus(
        Object.keys(status).at(todo.status)
      );
      setSelectedPriority(
        Object.keys(priority).at(todo.priority)
      );
     
      reset({
        task: todo.task,
        status: todo.status,
        task_id: todo.task_id,
        priority: todo.priority
      });
    }

    const onSubmit = async (data, e) => {
      e.preventDefault();
      setSubmitStatus(null);

      const editTodoPromise = new Promise((resolve, reject) => {
        setProcessing(true);
  
        data['task_id'] = todoEdit.task_id;
  
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
  
          taskList[data.task_id] = data;
          todoDb.setRecord(user.user_id, taskList);
  
          setSubmitStatus({
            status: "success",
            message: t("Task successfuly update"),
          });
  
          handleClick({type: "EditTodo",data: taskList});
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
          <EditIcon title={t('Edit')} fill="currentColor" />
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
            name="FormEditTodo"
            encType="multipart/form-data"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Modal.Header>
              <Text id="modal-title" size={18}>
                  {t('Edit Todo')}
              </Text>
            </Modal.Header>
            <Modal.Body>

            <Input 
              type="hidden" 
              value={todo.priority}
              disabled={processing}
              css={{ display: "none" }}
              {...register('priority')}
            />

            <Dropdown disabled={processing}>
              <Dropdown.Button 
                flat 
                color="success" 
                css={{ tt: "capitalize" }}
              >
                {t(selectedPriority.charAt(0).toUpperCase() + selectedPriority.slice(1))}
              </Dropdown.Button>
              <Dropdown.Menu
                color="success"
                disallowEmptySelection
                selectionMode="single"
                aria-label={t('Priority')}
                onSelectionChange={(value) => {
                    let selected = null;
                    setSelectedPriority(selected = (Array.from(value)
                      .join(", ").replaceAll("_", " ").split("#").at(1)
                    ));
                    setValue('priority',Object.keys(priority).indexOf(selected));
                }}
              >
                 {Object.entries(priority).map(([key],index) => {
                   return (
                       <Dropdown.Item 
                         key={`drop-down-priority-${index}#${key}`}
                       >
                       {t(key.replace(
                         key.slice(0,1),
                         key.at(0).toUpperCase()
                       ))}
                       </Dropdown.Item>
                   );
                 })}
              </Dropdown.Menu>
            </Dropdown>

            <Input 
              type="hidden" 
              value={todo.status}
              disabled={processing}
              css={{ display: "none" }}
              {...register('status')}
            />

            <Dropdown disabled={processing}>
              <Dropdown.Button 
                flat 
                color="warning" 
                css={{ tt: "capitalize" }}
              >
                {t(selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1))}
              </Dropdown.Button>
              <Dropdown.Menu
                color="warning"
                disallowEmptySelection
                selectionMode="single"
                aria-label={t('Status')}
                onSelectionChange={(value) => {
                    let selected = null;
                    setSelectedStatus(selected = (Array.from(value)
                      .join(", ").replaceAll("_", " ").split("#").at(1)
                    ));
                    setValue('status',Object.keys(status).indexOf(selected));
                }}
              >
                 {Object.entries(status).map(([key],index) => {
                   return (
                       <Dropdown.Item 
                         key={`drop-down-status-${index}#${key}`}
                       >
                       {t(key.replace(
                         key.slice(0,1),
                         key.at(0).toUpperCase()
                       ))}
                       </Dropdown.Item>
                   );
                 })}
              </Dropdown.Menu>
            </Dropdown>

            <Textarea
                clearable
                bordered
                fullWidth
                size="lg"
                minRows={3}
                maxRows={5}
                color="primary"
                disabled={processing}
                placeholder={t('Task Work')}
                {...register("task", {
                    required: true
                })}
                helperText={['required'].map((validate) => {
                    if(errors.task === undefined){
                        return;
                    }
        
                    if(errors.task?.type !== validate){
                        return;
                    }
                    
                    switch(errors.task?.type){
                        case 'required': 
                            return t("This field is required", {
                                name: t("Task")
                            });
                    }
                })}
              />
              
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
              <Button 
                auto 
                flat 
                color="warning" 
                onPress={closeHandler}
                icon={<CloseIcon fill="currentColor" filled />}
              >
                {t('Close')}
              </Button>
              <Button 
                auto 
                type='submit'
                //onPress={closeHandler}
                icon={<EditIcon fill="currentColor" filled />}
              >
                {t('Edit')}
              </Button>
            </Modal.Footer>
          </form>
        </Modal>
      </div>
    );
}