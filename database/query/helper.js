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
    const status = await query(sql, values);
    const result = await query(`SELECT * FROM ${table} WHERE id = ${id}`);
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

// Get a single item from db
export const getItemCondition = async (table, option) => {
  const value = Object.values(option);
  const key = Object.keys(option);
  const sql = `SELECT * FROM ${table}  WHERE  ${key[0]}=? AND ${key[1]} = ?`;

  try {
    const result = await query(sql, value);
    return { error: null, result: result };
  } catch (error) {
    return { error: error.message, result: null };
  }
};

// Delete an item
export const deleteItemCondition = async (table, option) => {
  const value = Object.values(option);
  const key = Object.keys(option);
  const sql = `DELETE FROM ${table} WHERE ${key[0]}= ? AND ${key[1]} = ?`;

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
// Get a single item from db
export const getIdeasDb = async () => {
  const sql = `SELECT ideas.id, ideas.title, ideas.description, ideas.upvotes, ideas.createdAt, ideas.userId, users.firstName, users.lastName, COUNT(comments.id) AS comments, GROUP_CONCAT(tags.name) as tags
  FROM ideas
  LEFT JOIN users ON ideas.userId = users.id
  LEFT JOIN comments ON ideas.id = comments.ideaId
  LEFT JOIN ideatags ON ideas.id = ideatags.ideaId
  LEFT JOIN tags on ideatags.tagId = tags.id
  GROUP BY ideas.id`;

  try {
    const result = await query(sql);
    return { error: null, result: result };
  } catch (error) {
    return { error: error.message, result: null };
  }
};
