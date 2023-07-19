/**
 * Check wheather given value is iterable.
 * 
 * @param any value
 * @return bool
 */
export function isIterable(value){
    if (value === null || value === undefined) {
        return false;
    }
    
    if(typeof value[Symbol.iterator] !== 'function'){
        return false;
    }

    return true;
}