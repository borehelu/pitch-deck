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
  const sql = `SELECT ideas.id, ideas.title, ideas.description, ideas.upvotes, ideas.createdAt, ideas.userId, users.firstName, users.lastName, users.avatar, COUNT(comments.id) AS comments, GROUP_CONCAT(tags.name) as tags
  FROM ideas
  LEFT JOIN users ON ideas.userId = users.id
  LEFT JOIN comments ON ideas.id = comments.ideaId
  LEFT JOIN ideatags ON ideas.id = ideatags.ideaId
  LEFT JOIN tags on ideatags.tagId = tags.id
  GROUP BY ideas.id ORDER BY ideas.createdAt desc`;

  try {
    const result = await query(sql);
    return { error: null, result: result };
  } catch (error) {
    return { error: error.message, result: null };
  }
};

export const getCommentsDb = async (ideaId) => {
  const sql = `SELECT comments.id, comments.comment, users.id as userId, users.firstName, users.lastName, users.avatar,comments.createdAt, comments.modifiedAt FROM comments
  LEFT JOIN users ON comments.userId = users.id WHERE comments.ideaId = ? ORDER BY createdAt ASC`;

  try {
    const result = await query(sql, ideaId);
    return { error: null, result: result };
  } catch (error) {
    return { error: error.message, result: null };
  }
};

// Add item to a table
export const addTags = async (table, data) => {
  let sql = `INSERT INTO ideatags (ideaId,tagId) VALUES ?`;
  let values = data.tags.map((t) => {
    return [data.ideaId, t];
  });

  try {
    const status = await query(sql, [values]);
    const result = await query(
      `SELECT * FROM ideatags WHERE ideaId = ? `,
      data.ideaId
    );
    return { error: null, result: result };
  } catch (error) {
    console.log(error.message);
    return { error: error.message, result: null };
  }
};

export const updateTags = async (ideaId, newTags) => {
  let sql = `DELETE FROM ideatags WHERE ideaId = ?`;

  try {
    const status = await query(sql, ideaId);
    console.log(status);
    addTags("ideatags", { ideaId, tags: newTags });
  } catch (error) {
    return { error: error.message, result: null };
  }
};
