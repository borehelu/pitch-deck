import connection from "../index.js";
import util from "util";
import { getColumns } from "../../utilities/db_utils/queryUtils.js";

const query = util.promisify(connection.query).bind(connection);

// Add item to a table
export const createItem = async (table, data) => {
  const values = Object.values(data);
  const keys = Object.keys(data).map((val) => `${val}`);
  const columns = getColumns(keys);
  const sql = `INSERT INTO ${table}(${keys.toString()}) VALUES(${columns}); `;
  // SELECT * FROM ${table} WHERE id = LAST_INSERT_ID()
  try {
    const status = await query(sql, values);
    const result = await query(
      `SELECT * FROM ${table} WHERE id = ${status.insertId}`
    );
    return { error: null, result: result };
  } catch (error) {
    return { error: error.message, result: null };
  }
};

// Update a single item
export const updateItem = async (table, id, data) => {
  const values = Object.values(data);
  const keys = Object.keys(data).map((val) => `${val}`);
  let columns = "";

  keys.forEach((col, index) => {
    if (index >= keys.length - 1) {
      columns += `${col} = ?`;
    } else {
      columns += `${col} = ?,`;
    }
  });

  const sql = `UPDATE ${table} SET ${columns} WHERE id='${id}'`;

  try {
    const result = await query(sql, values);
    return { error: null, result: result };
  } catch (error) {
    return { error: error.message, result: null };
  }
};

// Delete an item
export const deleteItem = async (table, id) => {
  const sql = `DELETE FROM ${table} WHERE id='${id}'`;

  try {
    const result = await query(sql);
    return { error: null, result: result };
  } catch (error) {
    return { error: error.message, result: null };
  }
};

// Get a single item from db
export const getItem = async (table, option) => {
  const value = Object.values(option);
  const key = Object.keys(option)[0];
  const sql = `SELECT * FROM ${table}  WHERE  ${key}=?`;

  try {
    const result = await query(sql, value);
    return { error: null, result: result };
  } catch (error) {
    return { error: error.message, result: null };
  }
};

// Get items from the database
export const getItems = async (table, condition = null) => {
  const value = condition ? Object.values(condition) : null;
  const key = condition ? Object.keys(condition).toString() : null;
  const sql = !condition
    ? `SELECT * FROM ${table}`
    : `SELECT * FROM ${table} WHERE ${key}= ? `;
  try {
    const result = await query(sql, value);
    return { error: null, result: result };
  } catch (error) {
    return { error: error.message, result: null };
  }
};

// let tag = {
//   name: "creates",
//   description: "adfasdfasdfasdfadf",
// };

// console.log(await createItem("tags", tag));
