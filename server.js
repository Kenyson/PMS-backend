const express = require('express');
const app = express();
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const porta = process.env.PORT || 3000;
const SEED_API_SECRET = process.env.SEED_API_SECRET || 'pharma-seed-secret-2026';

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  credentials: false
};
app.use(express.json());
app.use(cors(corsOptions));

app.options('*', cors(corsOptions));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,Origin,Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

const dbPath = __dirname + '/database.db';
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS medico (
      crm INTEGER PRIMARY KEY,
      estado TEXT,
      nome TEXT,
      sobrenome TEXT,
      telefone TEXT,
      especialidade TEXT,
      senha TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS pacientes (
      id INTEGER PRIMARY KEY,
      nome TEXT,
      sobrenome TEXT,
      cpf TEXT,
      data_nascimento TEXT,
      telefone TEXT,
      senha TEXT
    )
  `);

  db.get("SELECT COUNT(*) as count FROM pacientes", (err, row) => {
    if (!err && row.count > 0) {
      db.all("SELECT id, data_nascimento FROM pacientes", (selectErr, pacientes) => {
        if (!selectErr) {
          pacientes.forEach((paciente) => {
            let nascimento = paciente.data_nascimento;
            if (/^\d{4}-\d{2}-\d{2}$/.test(nascimento)) {
              const [y, m, d] = nascimento.split('-');
              nascimento = `${d}-${m}-${y}`;
              db.run("UPDATE pacientes SET data_nascimento = ? WHERE id = ?", [nascimento, paciente.id]);
            }
          });
          console.log('Datas de nascimento convertidas para dd-mm-yyyy');
        }
      });
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS receitas (
      id INTEGER PRIMARY KEY,
      nome_comercial TEXT,
      principio_ativo TEXT,
      indicacao TEXT,
      medico_id TEXT,
      paciente_id INTEGER,
      data_prescricao TEXT,
      data_validade TEXT,
      posologia TEXT,
      nomeMedico TEXT,
      FOREIGN KEY (medico_id) REFERENCES medico (crm),
      FOREIGN KEY (paciente_id) REFERENCES pacientes (id)
    )
  `);

  db.all("PRAGMA table_info(receitas)", (pragmaErr, columns) => {
    if (!pragmaErr) {
      const hasDataValidade = columns.some(col => col.name === 'data_validade');
      const runMigration = () => {
        db.get("SELECT COUNT(*) as count FROM receitas", (err, row) => {
          if (!err && row.count > 0) {
            db.all("SELECT id, data_prescricao, data_validade FROM receitas", (selectErr, receitas) => {
              if (!selectErr) {
                receitas.forEach((receita) => {
                  let prescricao = receita.data_prescricao;
                  let validade = receita.data_validade;
                  
                  let originalPrescricao = prescricao;
                  
                  if (/^\d{4}-\d{2}-\d{2}$/.test(prescricao)) {
                    const [y, m, d] = prescricao.split('-');
                    prescricao = `${d}-${m}-${y}`;
                  }
                  
                  if (!validade || validade === '') {
                    const [y, m, d] = originalPrescricao.split('-');
                    const dataObj = new Date(y, m - 1, d);
                    const validadeObj = new Date(dataObj);
                    validadeObj.setDate(validadeObj.getDate() + 30);
                    const vd = String(validadeObj.getDate()).padStart(2, '0');
                    const vm = String(validadeObj.getMonth() + 1).padStart(2, '0');
                    const vy = validadeObj.getFullYear();
                    validade = `${vd}-${vm}-${vy}`;
                  } else if (/^\d{4}-\d{2}-\d{2}$/.test(validade)) {
                    const [y, m, d] = validade.split('-');
                    validade = `${d}-${m}-${y}`;
                  }
                  
                  db.run("UPDATE receitas SET data_prescricao = ?, data_validade = ? WHERE id = ?", [prescricao, validade, receita.id]);
                });
                console.log('Datas atualizadas com sucesso');
              } else {
                console.error('Erro ao buscar receitas:', selectErr);
              }
            });
          }
        });
      };
      
      if (!hasDataValidade) {
        db.run("ALTER TABLE receitas ADD COLUMN data_validade TEXT", (alterErr) => {
          if (alterErr) {
            console.error('Erro ao adicionar coluna data_validade:', alterErr);
          } else {
            console.log('Coluna data_validade adicionada com sucesso');
            runMigration();
          }
        });
      } else {
        runMigration();
      }
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS medico_paciente (
      id INTEGER PRIMARY KEY,
      medico_id INTEGER,
      paciente_id INTEGER,
      FOREIGN KEY (medico_id) REFERENCES medico (crm),
      FOREIGN KEY (paciente_id) REFERENCES pacientes (id)
    )
  `);
});

app.post('/medicos', (req, res) => {
  const novoMedico = req.body;


  db.get('SELECT crm, estado FROM medico WHERE crm = ? AND estado = ?', [novoMedico.crm, novoMedico.estado], (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).send('Erro ao verificar o CRM e estado no banco de dados.');
    } else {
      if (row) {
        res.status(400).send('Já existe um médico com o mesmo CRM e estado.');
      } else {

        db.run(
          'INSERT INTO medico (crm, estado, nome, sobrenome, telefone, especialidade, senha) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            novoMedico.crm,
            novoMedico.estado,
            novoMedico.nome,
            novoMedico.sobrenome,
            novoMedico.telefone,
            novoMedico.especialidade,
            novoMedico.senha
          ],
          function (err) {
            if (err) {
              console.error(err);
              res.status(500).send('Erro ao adicionar médico ao banco de dados.');
            } else {
              novoMedico.crm = this.lastID;
              res.status(201).json(novoMedico);
            }
          }
        );
      }
    }
  });
});


app.get('/medicos', (req, res) => {
  db.all('SELECT crm, estado, nome, sobrenome, telefone, especialidade FROM medico', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send('Erro ao obter médicos do banco de dados.');
    } else {
      res.json(rows);
    }
  });
});

app.get('/pacientes', (req, res) => {
  db.all('SELECT id, nome, sobrenome, cpf, data_nascimento, telefone FROM pacientes', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send('Erro ao obter pacientes do banco de dados.');
    } else {
      res.json(rows);
    }
  });
});

app.get('/pacientes/filtrar', (req, res) => {
  const { caracteristica, valor } = req.query;
  const query = `SELECT id, nome, sobrenome, cpf, data_nascimento, telefone FROM pacientes WHERE ${caracteristica} = ?`;
  db.all(query, [valor], (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send('Erro ao obter pacientes filtrados do banco de dados.');
    } else {
      res.json(rows);
    }
  });
});

app.post('/pacientes', (req, res) => {
  const novoPaciente = req.body;

  db.get('SELECT id, senha FROM pacientes WHERE cpf = ?', [novoPaciente.cpf], (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).send('Erro ao verificar o CPF no banco de dados.');
    } else {
      if (row) {
        if (!row.senha) {
          db.run(
            'UPDATE pacientes SET nome = ?, sobrenome = ?, data_nascimento = ?, telefone = ?, senha = ? WHERE cpf = ?',
            [
              novoPaciente.nome,
              novoPaciente.sobrenome,
              novoPaciente.dataNascimento,
              novoPaciente.telefone,
              novoPaciente.senha,
              novoPaciente.cpf
            ],
            function (err) {
              if (err) {
                console.error(err);
                res.status(500).send('Erro ao atualizar paciente no banco de dados.');
              } else {
                novoPaciente.id = row.id;
                res.status(200).json(novoPaciente);
              }
            }
          );
        } else {
          res.status(400).send('CPF já cadastrado.');
        }
      } else {
        db.run(
          'INSERT INTO pacientes (nome, sobrenome, cpf, data_nascimento, telefone, senha) VALUES (?, ?, ?, ?, ?, ?)',
          [
            novoPaciente.nome,
            novoPaciente.sobrenome,
            novoPaciente.cpf,
            novoPaciente.dataNascimento,
            novoPaciente.telefone,
            novoPaciente.senha
          ],
          function (err) {
            if (err) {
              console.error(err);
              res.status(500).send('Erro ao adicionar paciente ao banco de dados.');
            } else {
              novoPaciente.id = this.lastID;
              res.status(201).json(novoPaciente);
            }
          }
        );
      }
    }
  });
});



app.post('/login', (req, res) => {
  const { userType, password } = req.body;

  if (userType === 'medico') {
    const { crm, estado } = req.body;
    db.get(
      'SELECT crm, estado, nome, sobrenome, senha FROM medico WHERE crm = ? AND estado = ?',
      [crm, estado],
      (err, row) => {
        if (err) {
          console.error(err);
          res.status(500).send('Erro ao autenticar médico.');
        } else if (row) {
          bcrypt.compare(password, row.senha, (compareErr, match) => {
            if (compareErr) {
              console.error(compareErr);
              res.status(500).send('Erro ao verificar senha.');
            } else if (match) {
              res.status(200).json({
                success: true,
                message: 'Login médico bem-sucedido.',
                crm: row.crm,
                estado: row.estado,
                nome: row.nome,
                sobrenome: row.sobrenome
              });
            } else {
              res.status(401).json({
                success: false,
                message: 'Credenciais inválidas.',
                debug: {
                  userFound: true,
                  crmFound: row.crm,
                  estadoFound: row.estado,
                  passwordMatch: false,
                  storedHash: row.senha ? row.senha.substring(0, 20) + '...' : null
                }
              });
            }
          });
        } else {
          db.all('SELECT crm, estado, nome, sobrenome FROM medico', (allErr, allRows) => {
            res.status(401).json({
              success: false,
              message: 'Credenciais inválidas.',
              debug: {
                userFound: false,
                searchedCrm: crm,
                searchedEstado: estado,
                allDoctors: allRows || []
              }
            });
          });
        }
      }
    );
  } else if (userType === 'paciente') {
    const { cpf } = req.body;
    db.get(
      'SELECT id, cpf, nome, sobrenome, senha FROM pacientes WHERE cpf = ?',
      [cpf],
      (err, row) => {
        if (err) {
          console.error(err);
          res.status(500).send('Erro ao autenticar paciente.');
        } else if (row) {
          bcrypt.compare(password, row.senha, (compareErr, match) => {
            if (compareErr) {
              console.error(compareErr);
              res.status(500).send('Erro ao verificar senha.');
            } else if (match) {
              res.status(200).json({
                success: true,
                message: 'Login paciente bem-sucedido.',
                id: row.id,
                cpf: row.cpf,
                nome: row.nome,
                sobrenome: row.sobrenome
              });
            } else {
              res.status(401).json({
                success: false,
                message: 'Credenciais inválidas.',
                debug: {
                  userFound: true,
                  cpfFound: row.cpf,
                  passwordMatch: false,
                  storedHash: row.senha ? row.senha.substring(0, 20) + '...' : null
                }
              });
            }
          });
        } else {
          db.all('SELECT id, cpf, nome, sobrenome FROM pacientes', (allErr, allRows) => {
            res.status(401).json({
              success: false,
              message: 'Credenciais inválidas.',
              debug: {
                userFound: false,
                searchedCpf: cpf,
                allPatients: allRows || []
              }
            });
          });
        }
      }
    );
  } else {
    res.status(400).send('Tipo de usuário inválido.');
  }
});

app.get('/receitas', (req, res) => {
  const paciente_id = req.query.paciente_id;

  if (paciente_id) {
    const query = `
      SELECT id, nome_comercial, principio_ativo, indicacao, data_prescricao, data_validade, posologia, nomeMedico
      FROM receitas
      WHERE paciente_id = ?`;
    db.all(query, [paciente_id], (err, rows) => {
      if (err) {
        console.error(err);
        res.status(500).send('Erro ao obter receitas do banco de dados.');
      } else {
        res.json(rows);
      }
    });
  } else {
    res.status(400).send('ID do paciente não encontrado.');
  }
});

app.post('/receitas', (req, res) => {
  const novaReceita = req.body;
  db.run(
    'INSERT INTO receitas (nome_comercial, principio_ativo, indicacao, medico_id, paciente_id, data_prescricao, data_validade, posologia, nomeMedico) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [novaReceita.nome_comercial, novaReceita.principio_ativo, novaReceita.indicacao, novaReceita.medico_id, novaReceita.paciente_id, novaReceita.data_prescricao, novaReceita.data_validade, novaReceita.posologia, novaReceita.nomeMedico],
    function (err) {
      if (err) {
        console.error(err.message);
        res.status(500).send('Erro ao adicionar receita ao banco de dados.');
      } else {
        res.status(201).json({ message: 'Receita adicionada com sucesso!' });
      }
    }
  );
});

app.delete('/receitas/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM receitas WHERE id = ?', [id], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).send('Erro ao remover receita do banco de dados.');
    } else {
      res.status(200).json({ message: 'Receita removida com sucesso!' });
    }
  });
});

app.delete('/medico/:crm/pacientes/:pacienteId', (req, res) => {
  const { crm, pacienteId } = req.params;
  db.run('DELETE FROM medico_paciente WHERE medico_id = ? AND paciente_id = ?', [crm, pacienteId], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).send('Erro ao remover paciente do médico.');
    } else {
      res.status(200).json({ message: 'Paciente removido com sucesso!' });
    }
  });
});

app.delete('/pacientes/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM pacientes WHERE id = ?', [id], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).send('Erro ao remover paciente do banco de dados.');
    } else {
      db.run('DELETE FROM receitas WHERE paciente_id = ?', [id]);
      db.run('DELETE FROM medico_paciente WHERE paciente_id = ?', [id]);
      res.status(200).json({ message: 'Paciente removido com sucesso!' });
    }
  });
});

app.get('/medico/:crm/pacientes', (req, res) => {
  const { crm } = req.params;
  const query = `
    SELECT p.id, p.nome, p.sobrenome, p.cpf, p.data_nascimento, p.telefone
    FROM pacientes p
    INNER JOIN medico_paciente mp ON p.id = mp.paciente_id
    WHERE mp.medico_id = ?`;
  db.all(query, [crm], (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send('Erro ao obter pacientes do médico.');
    } else {
      res.json(rows);
    }
  });
});

app.get('/paciente/:id/receitas', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT r.id, r.nome_comercial, r.principio_ativo, r.indicacao, r.data_prescricao, r.data_validade, r.posologia, m.nome AS nome_medico, m.sobrenome AS sobrenome_medico
    FROM receitas r
    INNER JOIN medico m ON r.medico_id = m.crm
    WHERE r.paciente_id = ?`;
  db.all(query, [id], (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send('Erro ao obter receitas do paciente.');
    } else {
      res.json(rows);
    }
  });
});

app.post('/conexao', (req, res) => {
  const novaConexao = req.body;

  db.get(
    'SELECT id FROM medico_paciente WHERE medico_id = ? AND paciente_id = ?',
    [novaConexao.medico_id, novaConexao.paciente_id],
    (err, row) => {
      if (err) {
        console.error(err);
        res.status(500).send('Erro ao verificar a conexão no banco de dados.');
      } else {
        if (row) {
          res.status(400).send('Já existe uma conexão entre o médico e o paciente informados.');
        } else {
          db.run(
            'INSERT INTO medico_paciente (medico_id, paciente_id) VALUES (?, ?)',
            [novaConexao.medico_id, novaConexao.paciente_id],
            function (err) {
              if (err) {
                console.error(err);
                res.status(500).send('Erro ao adicionar conexão ao banco de dados.');
              } else {
                novaConexao.id = this.lastID;
                res.status(201).json(novaConexao);
              }
            }
          );
        }
      }
    }
  );
});


app.post('/api/seed', async (req, res) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || authHeader !== `Bearer ${SEED_API_SECRET}`) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or missing API token' });
  }

  const { medicos, pacientes, receitas, conexoes } = req.body;

  if (!medicos && !pacientes && !receitas && !conexoes) {
    return res.status(400).json({ success: false, message: 'No seed data provided' });
  }

  try {
    const results = { success: true, message: 'Seed completed successfully', inserted: {} };

    if (receitas && receitas.length > 0) {
      await new Promise((resolve, reject) => {
        db.run('DELETE FROM receitas', (err) => err ? reject(err) : resolve());
      });
    }
    if (conexoes && conexoes.length > 0) {
      await new Promise((resolve, reject) => {
        db.run('DELETE FROM medico_paciente', (err) => err ? reject(err) : resolve());
      });
    }
    if (pacientes && pacientes.length > 0) {
      await new Promise((resolve, reject) => {
        db.run('DELETE FROM pacientes', (err) => err ? reject(err) : resolve());
      });
    }
    if (medicos && medicos.length > 0) {
      await new Promise((resolve, reject) => {
        db.run('DELETE FROM medico', (err) => err ? reject(err) : resolve());
      });
    }

    const hashedPasswords = {};
    if (medicos) {
      for (const medico of medicos) {
        if (medico.senha && !hashedPasswords[medico.senha]) {
          hashedPasswords[medico.senha] = await bcrypt.hash(medico.senha, 10);
        }
      }
    }
    if (pacientes) {
      for (const paciente of pacientes) {
        if (paciente.senha && !hashedPasswords[paciente.senha]) {
          hashedPasswords[paciente.senha] = await bcrypt.hash(paciente.senha, 10);
        }
      }
    }

    if (medicos && medicos.length > 0) {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO medico (crm, estado, nome, sobrenome, telefone, especialidade, senha)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const m of medicos) {
        await new Promise((resolve, reject) => {
          stmt.run([m.crm, m.estado, m.nome, m.sobrenome, m.telefone, m.especialidade, hashedPasswords[m.senha]], (err) => err ? reject(err) : resolve());
        });
      }
      await new Promise((resolve, reject) => {
        stmt.finalize((err) => err ? reject(err) : resolve());
      });
      results.inserted.medicos = medicos.length;
    }

    if (pacientes && pacientes.length > 0) {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO pacientes (id, nome, sobrenome, cpf, data_nascimento, telefone, senha)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const p of pacientes) {
        await new Promise((resolve, reject) => {
          stmt.run([p.id, p.nome, p.sobrenome, p.cpf, p.data_nascimento, p.telefone, hashedPasswords[p.senha]], (err) => err ? reject(err) : resolve());
        });
      }
      await new Promise((resolve, reject) => {
        stmt.finalize((err) => err ? reject(err) : resolve());
      });
      results.inserted.pacientes = pacientes.length;
    }

    if (receitas && receitas.length > 0) {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO receitas (id, nome_comercial, principio_ativo, indicacao, medico_id, paciente_id, data_prescricao, data_validade, posologia, nomeMedico)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const r of receitas) {
        await new Promise((resolve, reject) => {
          stmt.run([r.id, r.nome_comercial, r.principio_ativo, r.indicacao, r.medico_id, r.paciente_id, r.data_prescricao, r.data_validade, r.posologia, r.nomeMedico], (err) => err ? reject(err) : resolve());
        });
      }
      await new Promise((resolve, reject) => {
        stmt.finalize((err) => err ? reject(err) : resolve());
      });
      results.inserted.receitas = receitas.length;
    }

    if (conexoes && conexoes.length > 0) {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO medico_paciente (medico_id, paciente_id)
        VALUES (?, ?)
      `);
      for (const c of conexoes) {
        await new Promise((resolve, reject) => {
          stmt.run([c.medico_id, c.paciente_id], (err) => err ? reject(err) : resolve());
        });
      }
      await new Promise((resolve, reject) => {
        stmt.finalize((err) => err ? reject(err) : resolve());
      });
      results.inserted.conexoes = conexoes.length;
    }

    res.status(200).json(results);
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ success: false, message: 'Seed failed', error: err.message });
  }
});

app.listen(porta, () => {
  console.log(`Servidor rodando na porta ${porta}`);
});
