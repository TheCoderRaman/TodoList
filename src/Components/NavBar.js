import { 
  Text, 
  Image,
  Navbar, 
  Avatar, 
  Dropdown 
} from "@nextui-org/react";

import { 
  useRef, useEffect 
} from "react";

import { useContext } from "react";
import SwitchTheme from "./SwitchTheme";
import { route } from "./../Utils/route";
import SwitchLocale from "./SwitchLocale";
import LinkButton from "./Buttons/LinkButton";
import { useTranslation } from "react-i18next";
import { AppContext } from "./../Contexts/AppContext";
import Profile from "./../Pages/User/Settings/Profile";
import { AuthContext } from "./../Contexts/AuthContext";
import Exchanger from "./../Pages/User/Settings/Exchanger";

export default function NavBar({
  onChange = () => {}
}) {

  const { t } = useTranslation();

  const profileRef = useRef(() => {});
  const exchangerRef = useRef(() => {});

  const authContext = useContext(AuthContext);
  const { settings } = useContext(AppContext);

  const navItems = {
    profile: {
      name: 'Profile',
      handleAction: profileRef.current,
      element: (
        <Profile handleClick={onChange} handleOpenRef={profileRef}>
          <Text color="inherit" css={{minWidth: "100%"}}></Text>
        </Profile>
      )
    },
    exchanger: {
      name: 'Exchanger',
      handleAction: exchangerRef.current,
      element: (
        <Exchanger handleClick={onChange} handleOpenRef={exchangerRef}>
          <Text color="inherit" css={{minWidth: "100%"}}></Text>
        </Exchanger>
      )
    },
    signOut: {
      name: 'Sign Out',
      route: 'signOut'
    }
  };

  const actionHandler = (actionKey) => {
    const navItem = (
      actionKey.split("#").at(1)
    );

    if(navItems[navItem] === undefined){
      return;
    }

    if((typeof navItems[navItem]?.handleAction) !== 'function'){
      return;
    }

    navItems[navItem]?.handleAction();
  };

  useEffect(() => {
    authContext.authenticate(true);
  });

  return (
    <Navbar isBordered variant="sticky" containerCss={{maxWidth:'100%'}}>
      <Navbar.Toggle showIn="xs" />
      <Navbar.Brand
        css={{
          "@xs": {
            w: "12%",
          },
        }}
      >
        <Text hideIn="xs">
          <Image
            width={50}
            alt={t('Todo List')}
            css={{
              w: "100%",
              "@xsMax": {
                mw: "100px",
              },
              "& .nextui-input-content--left": {
                h: "100%",
                ml: "$4",
                dflex: "center",
              },
            }}
            src={process.env.PUBLIC_URL+'/assets/img/logo.png'}
          />
        </Text>

        <Text b color="inherit" hideIn="xs" size={30}>
          {t(settings.app.shorName).toUpperCase()}
        </Text>
      </Navbar.Brand>

      <Navbar.Content
        css={{
          "@xs": {
            w: "12%",
            jc: "flex-end",
          },
        }}
      >
        <SwitchLocale />
        <SwitchTheme/>

        <Dropdown placement="bottom-right">
          <Navbar.Item>
            <Dropdown.Trigger>
              <Avatar
                bordered
                as="button"
                color="secondary"
                size="md"
                src={authContext.authUser.current != null
                  ? t(authContext.authUser.current.avatar) : settings.assets.avatar
                }
              />
            </Dropdown.Trigger>
          </Navbar.Item>
          <Dropdown.Menu
            color="secondary"
            onAction={actionHandler}
            aria-label={t('Nav Bar')}
          >
            <Dropdown.Item key="userProfile" css={{ height: "$18" }}>
              <Text b color="inherit" css={{ d: "flex" }}>
                {t('Signed in as')}
              </Text>
              <Text b color="inherit" css={{ d: "flex" }}>
              {authContext.authUser.current != null && 
                t(authContext.authUser.current.name)
              }
              </Text>
            </Dropdown.Item>

            {Object.keys(navItems).length != 0 && Object.entries(navItems).map(
              ([key,value], index) => (
                <Dropdown.Item
                  activeColor="secondary" 
                  key={`navitem-${index}#${key}`}
                  color={(index === 
                      Object.keys(navItems).length - 1 ? "error" : ""
                  )}
                >
                  {(value?.element ?? false) && (
                    <Text css={{minWidth: "100%"}}>
                      {t(value?.name)}
                    </Text>
                  )}

                  {(value?.route ?? false) && (
                    <LinkButton type="a" to={route(value?.route)}>
                      <Text css={{minWidth: "100%"}}>
                        {t(value?.name)}
                      </Text>
                    </LinkButton>
                  )}
                </Dropdown.Item>
              )
            )}
          </Dropdown.Menu>
        </Dropdown>
      </Navbar.Content>
      
      <Navbar.Collapse>
        {Object.keys(navItems).length != 0 && Object.entries(navItems).map(
          ([key,value], index) => (
            <Navbar.CollapseItem 
              activeColor="secondary" 
              key={`navitem-${index}#${key}`}
              css={{
                color: (index === 
                  Object.keys(navItems).length - 1 ? "$error" : ""
                )
              }}
            >
              {(value?.element ?? false) && (
                <Text color="inherit" css={{minWidth: "100%"}}>
                  {t(value?.name)}
                </Text>
              )}

              {(value?.route ?? false) && (
                <LinkButton type="a" to={route(value?.route)}>
                  <Text color="inherit" css={{minWidth: "100%"}}>
                    {t(value?.name)}
                  </Text>
                </LinkButton>
              )}
            </Navbar.CollapseItem>
          )
        )}
      </Navbar.Collapse>

      <div style={{display:'none'}}>
        {Object.keys(navItems).length != 0 && Object.entries(navItems).map(
          ([key,value], index) => (<>
            {(value?.element ?? false) && (value?.element)}
          </>)
        )}
      </div>
    </Navbar>
  );
}
