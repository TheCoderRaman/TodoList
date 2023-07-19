import { Pagination } from "@nextui-org/react";
import { paginateConfig } from "./../../../Data/Table/paginateConfig";

export default function ListPagination({
  onChange = () => {},
  onPaginate = () => {},
  paginate = paginateConfig
}) {
  const paginationHandler = (number) => 
  {
      paginate.pageNumber = number;
      onPaginate(paginate);
      onChange();
  }

  return (
    <Pagination 
      loop
      shadow
      animated
      bordered
      total={paginate.pages}
      page={paginate.pageNumber}
      onChange={paginationHandler} 
    />
  );
}
