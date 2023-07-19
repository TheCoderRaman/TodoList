import { routes } from '../Data/routes';

/**
 * Get specified route path by identifier.
 * 
 * @param String identifier
 * @returns String|null
 */
export function route(identifier)
{
    let path;

    try {
        path = (Object.entries(routes).filter(
            ([name]) => {
                return name == identifier
            }).at(0).at(1)?.path
        );
    } catch(e){
        path = null;
    }

    return path;
}

/**
 * Get specified route name by route path.
 * 
 * @param String path
 * @param String|null fallBack
 * @returns String|null
 */
export function routeName(path, fallBack = "*")
{
    try {
        path = (Object.entries(routes).filter(
            ([,data]) => {
                return path == data.path
            }).at(0).at(1)?.name
        );
    } catch (e){
        path = routeName(fallBack);
    }

    return path;
}