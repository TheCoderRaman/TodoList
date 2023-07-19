import { useTranslation } from "react-i18next";
import { Progress as NextProgress} from "@nextui-org/react";

export default function Progress({
  total = 0, data = {},colors = {}
}) {
  const { t } = useTranslation();

  return (data === {} 
    ? <></> :<div style={{
        display:'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center'
      }}
    >
      <NextProgress 
        size="xs" 
        value={100} 
        key='default' 
        color='black'
        style={{width: total > 0 ? '0%': '100%'}} 
      />
      {Object.entries(data).map(([key,value],index) => {
        return (
          <div 
          key={`progress-${index}#${key}`}
          style={{width: total <= 0 ? '0%' :(value/total) * 100+'%'}} 
          >
            <NextProgress 
              key={key} 
              size="xs"
              value={100} 
              color={colors[key]} 
              style={{width: total <= 0 ? '0%': '100%'}} 
            >
              {t(key.replace(
                key.slice(0,1),
                key.at(0).toUpperCase()
              ))}
            </NextProgress>
          </div>
        );
      })}
    </div>
  );
}
