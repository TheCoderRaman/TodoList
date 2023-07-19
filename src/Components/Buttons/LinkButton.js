import { Button } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";

export default function LinkButton(props) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    let type = props?.type ?? 'button';

    switch(type){
        case 'link':
            e.preventDefault();
            break;
    }

    return navigate(props?.to ?? "/");
  };

  return (
    <>
      {props?.type == "button" ? (
        <Button onClick={handleClick} {...props} />
      ) : (
        <a onClick={handleClick} {...props}></a>
      )}    
    </>
  );
}
