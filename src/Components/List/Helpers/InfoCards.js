import { 
  Col, 
  Text, 
  Grid, 
  Card, 
  Progress 
} from "@nextui-org/react";

import { useTranslation } from "react-i18next";

export default function InfoCards({
  total = 0, data = {}, colors = {}
}) {
  const { t } = useTranslation();

  return (data === {} ? <></> 
    :<Grid.Container gap={2} justify="center" aria-labelledby="info-cards">
          {Object.entries(data).map(([key,value],index) => {
            return (
              <Grid xs={12} sm={4} key={`progress-${index}#${key}`} aria-labelledby={`info-cards#${key}`}>
                <Card isPressable isHoverable variant="bordered" css={{ bg: `$${colors[key]}`, w: "100%" }}>
                  <Card.Header css={{ position: "absolute", zIndex: 1, top: 5 }}>
                    <Col>
                      <Text size={12} weight="bold" transform="uppercase" color="black">
                        {Math.round((total <= 0) ?0 :(value/total) * 100)}%
                      </Text>
                      <Text h4 weight="bold" size={25} color="black">
                        {t('Priority')}: {t(key.replace(
                          key.slice(0,1),
                          key.at(0).toUpperCase()
                        ))}
                      </Text>
                      <Progress 
                      size="xs" 
                      key='default' 
                      color={colors[key]} 
                      value={(total <= 0) ?0 :(value/total) * 100} 
                    />
                    </Col>
                  </Card.Header>
                  
                  <Card.Image
                    width="100%"
                    height={100}
                    alt={t(key)}
                    showSkeleton
                    loading="lazy"
                    objectFit="cover"
                    src={process.env.PUBLIC_URL+`/assets/img/cards/${index+1}.png`}
                  /> 
                </Card>
              </Grid>
            );
          })}
    </Grid.Container>
  );
}
