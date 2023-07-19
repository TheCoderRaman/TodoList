import React, { 
  useRef, 
  useEffect, 
  useContext
} from "react";

import { 
  Row,
  Text, 
  Modal, 
  Badge,
  Spacer,
  Button
} from "@nextui-org/react";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { localDB } from "./../../../../../Modules/localDb";
import { isIterable } from "./../../../../../Utils/isIterable";
import { AppContext } from "./../../../../../Contexts/AppContext";
import { TodoListContext } from "./../../Contexts/TodoListContext";
import { AuthContext } from "./../../../../../Contexts/AuthContext";
import { MinusIcon } from "./../../../../../Components/Icons/MinusIcon";
import { CloseIcon } from "./../../../../../Components/Icons/CloseIcon";

export default function EditTodo({ 
  children = null,
  handleClick = () => {},
  handleOpenRef = useRef(),
  handleCloseRef = useRef(),
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
    const todoListContext = useContext(TodoListContext);
    
    const [visible, setVisible] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [submitError, setSubmitStatus] = useState(null);

    const onSubmit = async (data, e) => {
      e.preventDefault();
      setSubmitStatus(null);

      const massDeleteTodoPromise = new Promise((resolve, reject) => {
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
  
          Object.keys(
            todoListContext.todoState.selected
          ).map((key) => {
              if (
                taskList[key] === undefined
              ) {
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
  
          handleClick({type: "massDeleteTodo", data: taskList});
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
    
        reset({});
    }, [submitError]);

    return (
      <div>
        {children !== null ? <div onClick={openHandler}>{children}</div> : (
          <Button 
              auto 
              shadow 
              size="xl"
              color="error"
              onPress={openHandler}
          >
            <MinusIcon title={t('Delete')} fill="currentColor" />
          </Button>
        )}
        <Modal
          blur
          closeButton
          open={visible}
          onClose={closeHandler}
          aria-labelledby="modal-title"
        >
          <form
            method="post"
            name="FormMassDeleteTodo"
            encType="multipart/form-data"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Modal.Header>
              <Text id="modal-title" size={18}>
                  {t('Mass Delete Todo')}
              </Text>
            </Modal.Header>
            <Modal.Body>
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
                  icon={<MinusIcon fill="currentColor" filled />}
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