import { 
  useRef, 
  useState,
  useContext,
  useEffect
} from "react";

import { 
  Row,
  Col, 
  Text, 
  Input, 
  Spacer, 
  Button, 
  Dropdown,
} from "@nextui-org/react";

import { useTranslation } from "react-i18next";
import {AppContext} from "./../../../Contexts/AppContext";
import { SearchIcon } from "./../../../Components/Icons/SearchIcon";
import { paginateConfig } from "./../../../Data/Table/paginateConfig";

export function SearchBar({
  searchHandler = () => {}, 
  optionHandler = () => {}
}) {
  const { t } = useTranslation();
  const searchInputRef = useRef();
  const {updatedAt,setUpdatedAt} = useContext(AppContext);
  const [selectedDropdown,setSelectedDropdown] = useState(
    paginateConfig.pageSizes.at(0)
  );

  useEffect(() => {
    setUpdatedAt(Date.now());
  },[selectedDropdown]);

  return (
    <>
      <Button
        auto
        size="xl"
        css={{
          background: "$gradient",
        }}
        onClick={() => {
          searchInputRef.current.focus()
        }}
      >
        <SearchIcon title={t("Search")} fill="var(--nextui-colors-white)" />
      </Button>

      <Spacer y={1} />

      <Col>
        <Text b color="inherit" css={{ d: "flex" }}>
          {t("Search for task")}...
        </Text>

        <Row>
          <Dropdown>
            <Dropdown.Button 
              flat 
              color="success" 
              css={{ 
                tt: "capitalize",
                background: "$gradient"
              }}
            >
              {t(selectedDropdown)}
            </Dropdown.Button>
            <Dropdown.Menu
              color="success"
              disallowEmptySelection
              selectionMode="single"
              aria-label={t('Items')}
              onSelectionChange={(value) => {
                  const selected = (Array.from(value)
                    .join(", ").replaceAll("_", " ").split("#").at(1)
                  );

                  optionHandler(selected);
                  setSelectedDropdown(
                    paginateConfig.pageSizes.at(selected)
                  );
                }
              }
            >
              {paginateConfig.pageSizes.map((value, key) => {
                return (
                  <Dropdown.Item 
                    key={`drop-down-pagesizes#${key}`}
                  >
                    {value}
                  </Dropdown.Item>
                );
              })}
            </Dropdown.Menu>
          </Dropdown> 

          <Spacer x={.5} />

          <Input
            clearable
            ref={searchInputRef}
            css={{
              w: "100%",
              "@xsMax": {
                mw: "300px",
              },
              "& .nextui-input-content--left": {
                h: "100%",
                ml: "$4",
                dflex: "center",
              },
            }}
            onChange={searchHandler}
            placeholder={t("Type Here")}
          />       
        </Row>
      </Col>
    </>
  );
}
