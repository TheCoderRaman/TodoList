import React, { 
  useEffect 
} from "react";

import {
  Row,
  Text,
  Card,
  Input,
  Badge,
  Spacer,
  Button,
  Avatar,
  Checkbox,
  Container
} from "@nextui-org/react";

import { useState } from "react";
import { route } from "./../Utils/route";
import { useForm } from "react-hook-form";
import { useRef, useContext } from "react";
import { localDB } from "./../Modules/localDb";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isIterable } from "./../Utils/isIterable";
import { AppContext } from "./../Contexts/AppContext";
import SwitchTheme from "./../Components/SwitchTheme";
import SwitchLocale from "./../Components/SwitchLocale";
import { AuthContext } from "./../Contexts/AuthContext";
import { UserIcon } from "./../Components/Icons/UserIcon";
import LinkButton from "./../Components/Buttons/LinkButton";
import { PasswordIcon } from "./../Components/Icons/PasswordIcon";
import { encode as base64_encode, decode as base64_decode } from "base-64";

export default function SignUp() {
  const {
      setValue,
      register,
      handleSubmit,
      formState: { errors },
    } = useForm();

    const { t } = useTranslation();
    const navigate = useNavigate();
    const avatarInputRef = useRef();
    const authContext = useContext(AuthContext);
    
    const bcrypt = require("bcryptjs");
    
    const userDb = localDB("local", "users");
    const sessionDb = localDB("local", "sessions");
  
    const { settings } = useContext(AppContext);
  
    const [processing, setProcessing] = useState(false);
    const [submitError, setSubmitStatus] = useState(null);
    const [avatarFile, setAvatarFile] = useState(settings.assets.avatar);

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
  
    const onSubmit = async (data, e) => {
      e.preventDefault();
      setSubmitStatus(null);

      const signUpPromise = new Promise((resolve, reject) => {
        setProcessing(true);

        const user = {
          avatar: avatarFile,
          name: data.fullName,
          rememberMe: data.remember,
          user_id: base64_encode(data.fullName),
          password: bcrypt.hashSync(data.password, 10)
        };

        if (userDb.hasRecord(user.user_id)) {
          setProcessing(false);
          return reject([
            "warning", t("User already exists")
          ]);
        }

        setSubmitStatus({
          status: "success",
          message: t("User Successfully Registered"),
        });

        setTimeout(function () {
          resolve(user);
        }, 3000);
      }).then((data) => {
          setProcessing(false);

          const rememberMe = data['rememberMe'];

          delete data['rememberMe'];

          userDb.setRecord(
            data.user_id, data
          );

          if (rememberMe) {
            sessionDb.setRecord(
              "session_id", data.user_id
            );
          }

          authContext.authUser.current = data;

          navigate(route('todoList'));
        }).catch((args) => {
          setProcessing(false);

          if (settings.app.debug) {
            console.log("Error Caught: ", args);
          }

          if (isIterable(args)) {
            const [type, message] = args;

            setSubmitStatus({
              status: type, message: message,
            });
          } else {
            setSubmitStatus({
              status: "danger", message: t("Something went wrong"),
            });
          }
        });
    };

    useEffect(() => {
      if(authContext.authUser.current !== null){
        navigate(route('todoList'));
      }
    });

  return (
    <Container
      display="flex"
      alignItems="center"
      justify="center"
      css={{ minHeight: "100vh", width: "100%" }}
    >
      <form name='FormSignUp' method='post' encType='multipart/form-data' onSubmit={handleSubmit(onSubmit)}>
        <Card css={{ mw: "420px", p: "20px" }} variant="bordered">

          <Text
            size={24}
            weight="bold"
            css={{
              as: "center",
              mb: "20px",
            }}
          >
            {t(settings.app.name)}
          </Text>

          <Row justify="center">
            <Avatar
              bordered
              color="primary"
              src={avatarFile}
              css={{ size: "$20" }}
              onClick={() => avatarInputRef.current.click()}
            />
          </Row>

          <Spacer y={1} />

          <Row justify="space-between">
            <LinkButton type='button' to={route('signIn')} color="error" size="xs" shadow>
              {t("Sign In")}
            </LinkButton>
            <SwitchTheme squared size="sm" />
          </Row>

          <Spacer y={1} />

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

          <Spacer y={2} />

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
              required: true, 
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
          
          <Spacer y={2} />
          
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
          
          <Spacer y={0.5} />
          
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

          <Spacer y={1} />

          <Row justify="space-between">
            <Input 
              value={0}
              type="hidden" 
              {...register('remember')}
            />
            <Checkbox onChange={(value) => {
              setValue('remember',value ? 1:0)
            }}>
              <Text size={14}>{t("Remember me")}</Text>
            </Checkbox>

            <div style={{marginTop:'-5px'}} >
              <SwitchLocale squared size="sm" />
            </div>
          </Row>

          <Spacer y={1} />

          <Button type='submit' disabled={processing}>
              {t("Sign Up")}
          </Button>
        </Card>
      </form>
    </Container>
  );
}
