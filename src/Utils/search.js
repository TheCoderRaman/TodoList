/**
 * Search for the given term in provided entries.
 * 
 * @param String searchTerm 
 * @param Array entries 
 * @param Float percentage
 * @return Array
 */
export const search = (searchTerm,entries,percentage = 0.5) =>{
    searchTerm = searchTerm.split(" ");

    return entries.filter((item) => {
        const [,value] = item;
        const context = value.task.split(" ");

        const result = searchTerm.filter((searchIn) => {
            const matched = context.filter((searchFor) => {
                return (percentage <= 
                    similarity(searchFor,searchIn)
                );
            });

            return matched.length > 0;
        });
        
        return (result.length > 0 && result.length >= searchTerm.length);
    });
};

/**
 * Check similarity between two string with percentage.
 * 
 * @param String compareWith 
 * @param String compareTo 
 * @returns FLoat
 */
export const similarity = (compareWith, compareTo) => {
    let shorter = compareTo;
    let longer = compareWith;

    if (compareWith.length < compareTo.length) {
      longer = compareTo;
      shorter = compareWith;
    }

    let longerLength = longer.length;
    if (longerLength == 0) {
      return 1.0;
    }

    return ((longerLength - 
        editDistance(longer, shorter)) / parseFloat(longerLength)
    );
}

/**
 * Calculating edit distance for similarity percentage.
 * 
 * @param String compareWith 
 * @param String compareTo 
 * @returns FLoat
 * 
 * @see https://en.wikipedia.org/wiki/Levenshtein_distance
 */
export const editDistance = (compareWith, compareTo) => 
{
    compareTo = compareTo.toLowerCase();
    compareWith = compareWith.toLowerCase();

    let costs = new Array();

    for (var i = 0; i <= compareWith.length; i++) 
    {
      let lastValue = i;
    
      for (let j = 0; j <= compareTo.length; j++) 
      {
        if (i == 0){
          costs[j] = j;
        } else {
          if (j > 0) {
            let newValue = costs[j - 1];

            if (compareWith.charAt(i - 1) != compareTo.charAt(j - 1)){
              newValue = (Math.min(Math.min(
                newValue, lastValue),costs[j]) + 1
              );
            }

            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
    
      if (i > 0){
        costs[compareTo.length] = lastValue;
      }
    }

    return costs[compareTo.length];
  }

