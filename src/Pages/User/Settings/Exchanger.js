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
import { localDB } from "./../../../Modules/localDb";
import { isIterable } from "./../../../Utils/isIterable";
import { AppContext } from "./../../../Contexts/AppContext";
import { exportToJson } from "./../../../Utils/exportToJson";
import { AuthContext } from "./../../../Contexts/AuthContext";
import { EditIcon } from "./../../../Components/Icons/EditIcon";
import { CloseIcon } from "./../../../Components/Icons/CloseIcon";
import { ImportIcon } from "./../../../Components/Icons/ImportIcon";
import { ExportIcon } from "./../../../Components/Icons/ExportIcon";

export default function Exchanger({ 
    children  = null, 
    handleClick = () => {},
    handleOpenRef = useRef(),
    handleCloseRef = useRef()
}) {
    const {
        reset,
        register,
        setValue,
        handleSubmit,
        formState: { errors },
    } = useForm({ mode: 'all' });

    const { t } = useTranslation();
    const bcrypt = require("bcryptjs");

    const fileInputRef = useRef();
    const importFormSubmitRef = useRef();
    const exportFormSubmitRef = useRef();
    
    const todoDb = localDB("local", "tasks");
    const userDb = localDB("local", "users");
    const sessionDb = localDB("local", "sessions");
    
    const authContext = useContext(AuthContext);
    const { settings } = useContext(AppContext);

    const [visible, setVisible] = useState(false);
    const [todoFile, setTodoFile] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [submitError, setSubmitStatus] = useState(null);

    const processTodoFile = (e) => {
        let cloneTodoFile = todoFile;
        cloneTodoFile = null;
        
        const files = e.target.files;
    
        if (files.length == 0) {
          setSubmitStatus({
            status: "warning",
            message: t("Please select your file"),
          });
          return;
        }
    
        if (!files.item(0)) {
          setSubmitStatus({
            status: "warning",
            message: t("Please select your file"),
          });
          return;
        }
    
        if (files.item(0).size > 100000) {
          setSubmitStatus({
            status: "warning",
            message: t("File size too large"),
          });
          return;
        }
    
        const fileExt = files.item(0).name.split(".").pop();
        if (!["todo", "tdx", "json"].includes(fileExt)) {
          setSubmitStatus({
            status: "warning",
            message: t("Only these types are supported!", {
              types: ["todo", "tdx", "json"].join(","),
            }),
          });
          return;
        }
    
        let reader = new FileReader();
    
        reader.onloadend = function () {
          setTodoFile(reader.result);
        };
    
        reader.readAsText(files.item(0));
    };
    
    const generateFileName = (
      fileName, format = "YYYY-MM-DD HH-mm-ss"
    ) => {
        const timeStamp = (
            require("moment")().format(format)
        );

        return `[${timeStamp}] - ${fileName}.todo`;
    };

    const onImportSubmit = async (data, e) => {
      e.preventDefault();
      setSubmitStatus(null);

      const exchangeImportPromise = new Promise((resolve, reject) => {
        setProcessing(true);
        
        if (todoFile === null) {
          return reject([
            "warning", t("Please select your file")
          ]);
        }

        setTimeout(function () {
          resolve(JSON.parse(todoFile));
        }, 1000);
      }).then((data) => {
          setProcessing(false);

          const user = authContext.authUser.current;
        
          if (user === null) {
            return reject([
              "warning", t("User not found")
            ]);
          }

          let todoList = todoDb.getRecord(user.user_id);
          
          if (todoList === null) {
            todoList = {};
          }
          
          for (const [key, value] of Object.entries(data)) 
          {
            value['task_id'] = key;
            todoList[key] = value;
          }

          todoDb.setRecord(user.user_id, todoList);

          setSubmitStatus({
            status: "success",
            message: t("Task successfully imported"),
          });

          handleClick({type:"exchangeImport", data: data});
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

    const onExportSubmit = async (data, e) => {
      e.preventDefault();
      setSubmitStatus(null);

      const exchangeExportPromise = new Promise((resolve, reject) => {
        setProcessing(true);

        const user = authContext.authUser.current;
        
        if (user === null) {
          return reject([
            "warning", t("User not found")
          ]);
        }

        let todoList = todoDb.getRecord(user.user_id);
        
        if (todoList === null) {
          todoList = {};
        }

        Object.keys(todoList).map((key) => {
          delete todoList[key]['task_id'];
        });

        setTimeout(function () {
          resolve(todoList);
        }, 1000);
      }).then((data) => {
          setProcessing(false);
      
          exportToJson(data, 
            generateFileName(t("Todo List"))
          );

          setSubmitStatus({
            status: "success",
            message: t("Task successfully exported"),
          });

          handleClick({type:"exchangeExport", data: data});
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
    }, [submitError]);

    return (
      <div>
        {children !== null ? <div onClick={openHandler}>{children}</div> : (
          <Button 
            auto 
            shadow 
            size="xl"
            color="success"
            onPress={openHandler}
          >
            <EditIcon title={t('Edit Profile')} fill="currentColor" /> {children}
          </Button>
        )}
        <Modal
          blur
          closeButton
          open={visible}
          onClose={closeHandler}
          aria-labelledby="modal-title"
        >
          <Modal.Header>
            <Text id="modal-title" size={18}>
                {t('Exchanger')}
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
                {t('Import may over write your previous todos')} !
              </Text>
            </Row>

            <form
              method="post"
              name="FormExport"
              encType="multipart/form-data"
              onSubmit={handleSubmit(onExportSubmit)}
            > 
              <Button
                type='submit'
                ref={exportFormSubmitRef}
                css={{ mb: "6px",display:'none' }} 
              ></Button>
            </form>

            <Row justify="center">
              <form
                method="post"
                name="FormImport"
                encType="multipart/form-data"
                onSubmit={handleSubmit(onImportSubmit)}
              >
                <Button
                  ghost
                  color="warning"
                  onPress={() => fileInputRef.current.click()}
                >
                  <Input 
                    type="file"
                    ref={fileInputRef} 
                    disabled={processing}
                    accept=".tdx,.todo,.json"
                    onChange={processTodoFile}
                    css={{ mb: "6px",display:'none' }} 
                  />
                  {t('Select File')}
                </Button>
  
                <Button
                  type='submit'
                  ref={importFormSubmitRef}
                  css={{ mb: "6px",display:'none' }} 
                ></Button>
              </form>
            </Row>

            <Spacer y={0.1} />
            
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
              icon={<CloseIcon fill="currentColor" />}
            >
              {t('Close')}
            </Button>
            <Button 
              auto 
              flat 
              color="error" 
              icon={<ImportIcon fill="currentColor" />}
              onPress={(() => {importFormSubmitRef.current.click()})}
            >
              {t('Import')}
            </Button>
            <Button 
              auto 
              flat 
              color="success" 
              icon={<ExportIcon fill="currentColor" />}
              onPress={() => {exportFormSubmitRef.current.click()}}
            >
              {t('Export')}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
}