import { paginateConfig } from "./../Data/Table/paginateConfig";

/**
 * Paginate given object with provided configuration.
 * 
 * @param Object pages
 * @param Object config
 * @return Object
 */
export function paginator(
    pages, config = paginateConfig
) {
    return pages.slice((config.pageNumber - 1) 
        * config.pageSize, config.pageNumber * config.pageSize
    );
};