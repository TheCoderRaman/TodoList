import {
  Row,
  Text,
  Container
} from "@nextui-org/react";

import { route } from "./../Utils/route";
import { useTranslation } from "react-i18next";
import LinkButton from "./../Components/Buttons/LinkButton";

export default function Error() {
  const { t } = useTranslation();

  return (
    <Container
      display="flex"
      alignItems="center"
      justify="center"
      direction="column"
      css={{ minHeight: "100vh", width: "100%" }}
    >
      <Row justify="center" align="center">
        <Text size={50} weight="bold" soze> 
          {t(404)} | 
        </Text>
        
        <Text size={25}> 
          | {t('This page could not be found.')} 
        </Text>
      </Row>

      <LinkButton type="button" to={route('home')} color="success" size="md" shadow>
        {t('Go to home')}
      </LinkButton>
    </Container>
  );
}