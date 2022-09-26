import Database from '../database/database.js';
import SendMail from '../services/SendMail.js';
import jwt from 'jsonwebtoken';

async function readAll() {
  const db = await Database.connect();

  const sql = `
    SELECT 
      f.id, f.name, f.quantidade, c.name as category
    FROM 
      foods as f INNER JOIN categories as c
    ON
      f.category_id = c.id
  `;

  const foods = await db.all(sql);

  return foods;
}

async function read(id) {
  const db = await Database.connect();

  const sql = `
    SELECT 
      f.id, f.name, f.quantidade, c.name as category
    FROM 
      foods as f INNER JOIN categories as c
    ON
      f.category_id = c.id
    WHERE
      f.id = ?
  `;

  const food = await db.get(sql, [id]);

  return food;
}

async function readId(id) {
  const db = await Database.connect();

  const sql = `
    SELECT 
      *
    FROM 
      users
    WHERE
      id = ?
  `;

  const food = await db.get(sql, [id]);

  return food;
}

async function create(food) {
  const db = await Database.connect();

  const { name, quantidade, category_id, token } = food;
  
  const sql = `
    INSERT INTO
      foods (name, quantidade, category_id)
    VALUES
      (?, ?, ?)
  `;
  const {userId} = jwt.verify(token, process.env.SECRET);
  
  const { lastID } = await db.run(sql, [name, quantidade, category_id]);

  const { email } = await readId(userId);
  
  textMail(email);

  return read(lastID);
}

async function update(food, id) {
  const db = await Database.connect();

  const { name, quantidade, category_id } = food;

  const sql = `
    UPDATE 
      foods
    SET
      name = ?, quantidade = ?, category_id = ?
    WHERE
      id = ?
  `;

  const { changes } = await db.run(sql, [name, quantidade, category_id, id]);

  if (changes === 1) {
    return read(id);
  } else {
    return false;
  }
}

async function destroy(id) {
  const db = await Database.connect();

  const sql = `
    DELETE FROM
      foods
    WHERE
      id = ?
  `;

  const { changes } = await db.run(sql, [id]);

  return changes === 1;
}

function textMail(to){
  const subject = "Lista de compras criada com sucesso";
  const text = `Lista criada com sucesso.\n\nAcesse o aplicativo para gerenciar o cadastro de listas.`;
  const html = `<h1>Lista criada com sucesso.</h1><p>Acesse o aplicativo para gerenciar o cadastro de listas.</p>`;
  SendMail.submitEMail(to,subject,text,html)
}

export default { readAll, read, create, update, destroy };