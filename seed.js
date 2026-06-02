const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const seedConfig = require('./seed-config');

const dbPath = path.join(__dirname, 'database.db');

async function seed() {
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Erro ao conectar ao banco:', err.message);
      process.exit(1);
    }
  });

  console.log('Iniciando população do banco...');

  const hashedPasswords = {};
  for (const medico of seedConfig.medicos) {
    if (!hashedPasswords[medico.senha]) {
      hashedPasswords[medico.senha] = await bcrypt.hash(medico.senha, 10);
    }
  }
  for (const paciente of seedConfig.pacientes) {
    if (!hashedPasswords[paciente.senha]) {
      hashedPasswords[paciente.senha] = await bcrypt.hash(paciente.senha, 10);
    }
  }

  db.serialize(() => {
    db.run('DELETE FROM receitas');
    db.run('DELETE FROM medico_paciente');
    db.run('DELETE FROM pacientes');
    db.run('DELETE FROM medico');

    const insertMedico = db.prepare(`
      INSERT OR REPLACE INTO medico (crm, estado, nome, sobrenome, telefone, especialidade, senha)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const medico of seedConfig.medicos) {
      insertMedico.run([medico.crm, medico.estado, medico.nome, medico.sobrenome, medico.telefone, medico.especialidade, hashedPasswords[medico.senha]]);
    }

    const insertPaciente = db.prepare(`
      INSERT OR REPLACE INTO pacientes (id, nome, sobrenome, cpf, data_nascimento, telefone, senha)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const paciente of seedConfig.pacientes) {
      insertPaciente.run([paciente.id, paciente.nome, paciente.sobrenome, paciente.cpf, paciente.data_nascimento, paciente.telefone, hashedPasswords[paciente.senha]]);
    }

    const insertReceita = db.prepare(`
      INSERT OR REPLACE INTO receitas (id, nome_comercial, principio_ativo, indicacao, medico_id, paciente_id, data_prescricao, data_validade, posologia, nomeMedico)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const receita of seedConfig.receitas) {
      insertReceita.run([receita.id, receita.nome_comercial, receita.principio_ativo, receita.indicacao, receita.medico_id, receita.paciente_id, receita.data_prescricao, receita.data_validade, receita.posologia, receita.nomeMedico]);
    }

    const insertConexao = db.prepare(`
      INSERT OR REPLACE INTO medico_paciente (medico_id, paciente_id)
      VALUES (?, ?)
    `);

    for (const conexao of seedConfig.conexoes) {
      insertConexao.run([conexao.medico_id, conexao.paciente_id]);
    }

    insertMedico.finalize();
    insertPaciente.finalize();
    insertReceita.finalize();
    insertConexao.finalize();

    console.log('Dados inseridos com sucesso!');
    console.log('Contas criadas:');
    console.log('  Médico CRM: 99999 | Senha: doctor123 | Estado: São Paulo');
    for (const paciente of seedConfig.pacientes) {
      console.log(`  Paciente CPF: ${paciente.cpf} | Senha: ${paciente.senha}`);
    }
    console.log(`  ${seedConfig.receitas.length} receitas de exemplo cadastradas`);

    db.close((err) => {
      if (err) {
        console.error('Erro ao fechar conexão:', err.message);
      } else {
        console.log('Conexão com banco fechada.');
      }
      process.exit(0);
    });
  });
}

seed().catch((err) => {
  console.error('Erro no seeder:', err.message);
  process.exit(1);
});
