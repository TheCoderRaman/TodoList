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
  Spacer,
  Avatar
} from "@nextui-org/react";

import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { isEmpty } from "./../../../Utils/isEmpty";
import { localDB } from "./../../../Modules/localDb";
import { isIterable } from "./../../../Utils/isIterable";
import { AppContext } from "./../../../Contexts/AppContext";
import { AuthContext } from "./../../../Contexts/AuthContext";
import { EditIcon } from "./../../../Components/Icons/EditIcon";
import { UserIcon } from "./../../../Components/Icons/UserIcon";
import { CloseIcon } from "./../../../Components/Icons/CloseIcon";
import { PasswordIcon } from "./../../../Components/Icons/PasswordIcon";
import { encode as base64_encode, decode as base64_decode } from "base-64";

export default function Profile({ 
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
    
    const todoDb = localDB("local", "tasks");
    const userDb = localDB("local", "users");
    const sessionDb = localDB("local", "sessions");
    
    const authContext = useContext(AuthContext);
    const { settings } = useContext(AppContext);

    const avatarInputRef = useRef();
    const [visible, setVisible] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [submitError, setSubmitStatus] = useState(null);
    const [profile, setProfile] = useState({fullName:""});
    const [avatarFile, setAvatarFile] = useState(settings.assets.avatar);

    if(JSON.stringify(
      authContext.authUser.current) != JSON.stringify(profile)
    ){
      setProfile(authContext.authUser.current);
      setAvatarFile(authContext.authUser.current.avatar);
      reset({fullName:authContext.authUser.current.name});
    }

    const processAvatarFile = (e) => {
        setSubmitStatus(null);

        const files = e.target.files;

        if (files.length == 0) {
            setSubmitStatus({
                status: 'warning',
                message: t("Please select your avatar")
            });
            return;
        }
        
        if(!files.item(0)){
            setSubmitStatus({
                status: 'warning',
                message: t("Please select your avatar")
            });
            return;
        }
        
        if (files.item(0).size > 100000){
            setSubmitStatus({
                status: 'warning',
                message: t("Selected avatar size too large")
            });
            return;
        }

        let reader = new FileReader();

        reader.onloadend = function() {
            setAvatarFile(reader.result);
        }

        reader.readAsDataURL(files.item(0));
    };

    const updateTodoList = (oldUser,newUser) => {
      let taskList = todoDb.getRecord();

      if (taskList === null) {
        taskList = {};
      }

      if (
        taskList[oldUser.user_id] === undefined
      ) {
        return;
      } else {
        let userTasks = (
          taskList[oldUser.user_id] ?? {}
        );

        delete taskList[oldUser.user_id];

        taskList[newUser.user_id] = userTasks;
      }

      todoDb.removeRecord(oldUser.user_id);

      Object.entries(taskList).map(([id,task]) => {
        todoDb.setRecord(id, task);
      });
    };

    const onSubmit = async (data, e) => {
      e.preventDefault();
      setSubmitStatus(null);

      const editProfilePromise = new Promise((resolve, reject) => {
        setProcessing(true);
        
        let oldUser = authContext.authUser.current;
        
        if (oldUser === null) {
          return reject([
            "warning", t("User not found")
          ]);
        }

        let newUser = userDb.getRecord(oldUser.user_id);

        if(avatarFile != newUser.avatar){
          newUser.avatar = avatarFile;
        }

        if(!isEmpty(data.fullName)){
          newUser.name = data.fullName;

          let userId = base64_encode(data.fullName);

          if (!userDb.hasRecord(userId)) {
            newUser.user_id = userId;
          }
        }
        
        if(!isEmpty(data.password)){
          newUser.password = bcrypt.hashSync(data.password, 10)
        }

        setTimeout(function () {
          resolve({oldUser: oldUser,newUser: newUser});
        }, 1000);
      }).then(({oldUser,newUser}) => {
          setProcessing(false);

          updateTodoList(oldUser,newUser);

          userDb.removeRecord(oldUser.user_id);
          userDb.setRecord(newUser.user_id, newUser);
          sessionDb.setRecord("session_id", newUser.user_id);

          authContext.authUser.current = newUser;

          setSubmitStatus({
            status: "success",
            message: t("Profile successfully updated"),
          });

          handleClick("editProfile",newUser);
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
          <form
            method="post"
            name="FormEditProfile"
            encType="multipart/form-data"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Modal.Header>
              <Text id="modal-title" size={18}>
                  {t('Edit Profile')}
              </Text>
            </Modal.Header>
            <Modal.Body>

              <Row justify="center">
                <Avatar
                  bordered
                  color="primary"
                  src={avatarFile}
                  css={{ size: "$20" }}
                  onClick={() => avatarInputRef.current.click()}
                />
              </Row>
    
              <Spacer y={.5} />

              <Input
                clearable
                bordered
                fullWidth
                size="lg"
                color="primary"
                disabled={processing}
                placeholder={t("Full Name")}
                contentLeft={<UserIcon fill="currentColor" />}
                helperText={["required", "pattern"].map((validate) => {
                  if (errors.fullName?.type !== validate) {
                    return;
                  }
      
                  switch (errors.fullName?.type) {
                    case "required": 
                      return t("This field is required", {
                        name: t("Full Name")
                      });
                    case "pattern":
                      return t("This field is invalid", {
                        name: t("Full Name")
                      });
                  }
                })}
                {...register("fullName", {
                  required: true,
                  // ^                         Start anchor
                  // [a-zA-Z0-9]                   Ensure string contain only a - z, A - Z and 0 -9 letters.
                  // ([_ -]?[a-zA-Z0-9])           Ensure string contain only _- with a - z, A - Z and 0 -9 letters.
                  // $                         End anchor.
                  pattern: /^[a-zA-Z0-9]+([_ -]?[a-zA-Z0-9])*$/i,
                })}
              />
    
              <Spacer y={.5} />
    
              <Input
                clearable
                bordered
                fullWidth
                size="lg"
                type="password"
                color="primary"
                css={{ mb: "6px" }}
                disabled={processing}
                placeholder={t("Password")}
                contentLeft={<PasswordIcon fill="currentColor" />}
                helperText={['required','pattern'].map((validate) => {
                  if(errors.password === undefined){
                      return;
                  }
      
                  if(errors.password?.type !== validate){
                      return;
                  }
                  
                  switch(errors.password?.type){
                      case 'required': 
                          return t("This field is required", {
                              name: t("Password")
                          });
                      case 'pattern': 
                          return t("This field is invalid", {
                              name: t("Password")
                          });
                  }
                })}
                {...register("password", {
                  required: false, 
                  // ^                         Start anchor
                  // (?=.*[a-z])                   Ensure string has atleast one lowercase letters.
                  // (?=.*[A-Z])                   Ensure string has atleast one uppercase case letter.
                  // (?=.*\d)                      Ensure string has atleast one digits.
                  // (?=.*[@$!%*?&])               Ensure string has atleast one special letters.
                  // [A-Za-z\d@$!%*?&]             Ensure string only contain a-z, A-Z, 0-9 and @$!%*?& letters.
                  // {8,10}                        Ensure string is of length between 8 - 10.
                  // $                         End anchor.
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$/i
                })}
              />

              <Spacer y={.5} />
              
              <Button
                ghost
                color="warning"
                icon={<UserIcon fill="currentColor" filled />}
                onPress={() => avatarInputRef.current.click()}
              >
                <Input 
                  type="file"
                  accept="image/*"
                  ref={avatarInputRef} 
                  disabled={processing}
                  onChange={processAvatarFile}
                  css={{ mb: "6px",display:'none' }}
                />
                {t('Select your avatar')}
              </Button>
              
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
                icon={<CloseIcon fill="currentColor" filled />}
              >
                {t('Close')}
              </Button>
              <Button 
                auto 
                type='submit'
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