/**
 * Browser storage module.
 *
 * Description
 * A simple wrapper for the localStorage.
 * 
 * @type class BrowserStorage
 */
class BrowserStorage 
{
  /**
   * Get item from storage.
   *
   * @param String|null key
   * @return Object|String|null
   */
  getItem(key) {
    return localStorage.getItem(key);
  }

  /**
   * Set item in storage.
   *
   * @param String key
   * @param String|null value
   * @return this
   */
  setItem(key, value) {
    localStorage.setItem(key, value);
    return this;
  }

  /**
   * Remove item from storage.
   *
   * @param String key
   * @return this
   */
  removeItem(key) {
    localStorage.removeItem(key);
    return this;
  }

  /**
   * Clear all items from storage.
   *
   * @return this
   */
  clear() {
    localStorage.clear();
    return this;
  }
};

/**
 * Database storage module.
 *
 * description:
 * A JavaScript implementation of the database using localStorage.
 * 
 * @type class Database
 */
class Database {
  /**
   * Database storage.
   *
   * @var localStorage Storage
   */
  Storage = new BrowserStorage();

  /**
   * Currenct database table being used.
   *
   * @var String Table
   */
  Table = "TABLE";

  /**
   * Currenct database being used.
   *
   * @var String Table
   */
  Database = "DATABASE";

  /**
   * Database constructor
   *
   * @param String database
   * @param string table
   * @return void
   */
  constructor(database, table, storage = null) {
    this.setTable(table);
    this.setDatabase(database);
    this.setStorage((storage !== null) 
        ? storage : this.Storage
    );
  }

  /**
   * Get current storage.
   *
   * @return StorageInterface
   */
  getStorage() {
    return this.Storage;
  }

  /**
   * Set current storage.
   *
   * @param StorageInterface storage
   * @return this
   */
  setStorage(storage) {
    this.Storage = storage;
    return this;
  }

  /**
   * Get current table.
   *
   * @return string
   */
  getTable() {
    return this.Table;
  }

  /**
   * Set current table.
   *
   * @param String table
   * @return this
   */
  setTable(table) {
    this.Table = String(table);
    return this;
  }

  /**
   * Get current database.
   *
   * @return string
   */
  getDatabase() {
    return this.Database;
  }

  /**
   * Get storage indentifier.
   * 
   * @return string
   */
  getIdentifier()
  {
    return `${this.Database}#${this.Table}`;
  }

  /**
   * Set current database.
   *
   * @param String database
   * @return this
   */
  setDatabase(database) {
    this.Database = String(database);
    return this;
  }

  /**
   * Get specifed record from the current database table.
   *
   * @param String|null key
   * @return Object
   */
  hasRecord(key) {
    let database = this.Storage.getItem(this.getIdentifier());

    if (database === null) {
      return false;
    }

    try {
      database = JSON.parse(database);
    } catch (e) {
      database = {};
    }

    let table = ((database[this.getTable()] === undefined) 
        ? {} : database[this.getTable()]
    );

    if (table[key] === undefined) {
      return false;
    }

    return true;
  }

  /**
   * Get specifed record from the current database table.
   *
   * @param String key
   * @return any
   */
  getRecord(key = null) {
    let database = this.Storage.getItem(this.getIdentifier());

    if (database === null) {
      return null;
    }

    try {
      database = JSON.parse(database);
    } catch (e) {
      database = {};
    }

    let table = ((database[this.getTable()] === undefined) 
        ? {} : database[this.getTable()]
    );

    if (key === null) {
      return table;
    }

    if (table[key] === undefined) {
      return null;
    }

    return table[key];
  }

  /**
   * Set the specifed record in the current database table.
   *
   * @param String key
   * @param any value
   * @return this
   */
  setRecord(key, value = null) {
    let database = this.Storage.getItem(this.getIdentifier());

    if (database === null) {
      database = "{}";
    }

    try {
      database = JSON.parse(database);
    } catch (e) {
      database = {};
    }

    let table = ((database[this.getTable()] === undefined) 
        ? {} : database[this.getTable()]
    );

    table[key] = value;
    database[this.getTable()] = table;

    this.Storage.setItem(this.getIdentifier(), JSON.stringify(database));

    return this;
  }

  /**
   * Remove the specifed record in the current database table.
   *
   * @param String|null key
   * @param Object|null
   * @return this
   */
  removeRecord(key) {
    let Database = {};
    let record = Object(this.getRecord());

    Object.keys(record).forEach(function (id) {
      if (key != id) {
        return;
      }

      delete record[key];
    });

    Database[this.getTable()] = record;

    this.Storage.setItem(this.getIdentifier(), JSON.stringify(Database));

    return this;
  }

  /**
   * Remove current database from storage.
   *
   * @return this
   */
  removeDatabase() {
    this.Storage.removeItem(this.getIdentifier());
    return this;
  }
};

export function localDB(db, tb) {
  return (new Database(db, tb)).setDatabase(db).setTable(tb);
}
