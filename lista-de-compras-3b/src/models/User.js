import bcrypt from 'bcryptjs';

import Database from '../database/database.js';
import SendMail from '../services/SendMail.js';
const salt = Number(process.env.SALT);

async function create(user) {
  const db = await Database.connect();

  const { name, email, password, password2 } = user;

  const hash = bcrypt.hashSync(password, salt);

  const sql = `
    INSERT INTO
      users (name, email, password)
    VALUES
      (?, ?, ?)
  `;

  const { lastID } = await db.run(sql, [name, email, hash]);
  textMail(email);
  return read(lastID);
}

async function read(id) {
  const db = await Database.connect();

  const sql = `
    SELECT 
      *
    FROM 
      users
    WHERE
      id = ?
  `;

  const user = await db.get(sql, [id]);

  return user;
}

async function readByEmail(email) {
  const db = await Database.connect();

  const sql = `
    SELECT 
      *
    FROM 
      users
    WHERE
      email = ?
  `;

  const user = await db.get(sql, [email]);

  return user;
}

function textMail(to){
  const subject = "Conta criada com sucesso";
  const text = "Conta criada com sucesso.\n\nAcesse o aplicativo para gerenciar o cadastro de listas.";
  const html = "<h1>Conta criada com sucesso.</h1><p>Acesse o aplicativo para gerenciar o cadastro de listas.</p>";
  SendMail.submitEMail(to,subject,text,html)
}

export default { create, read, readByEmail };