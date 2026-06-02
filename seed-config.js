const medicos = [
  {
    crm: 99999,
    estado: 'São Paulo',
    nome: 'Demo',
    sobrenome: 'Silva',
    telefone: '11999999999',
    especialidade: 'Clínico Geral',
    senha: 'doctor123'
  }
];

const pacientes = [
  { id: 8, nome: 'Mario', sobrenome: 'Rossi', cpf: '12345678901', data_nascimento: '15-05-1990', telefone: '11988888888', senha: 'patient123' },
  { id: 9, nome: 'Luigi', sobrenome: 'Verdi', cpf: '98765432100', data_nascimento: '20-03-1985', telefone: '21999999999', senha: 'patient123' },
  { id: 10, nome: 'Antonio', sobrenome: 'Neri', cpf: '11122233344', data_nascimento: '12-11-1978', telefone: '31999999999', senha: 'patient123' },
  { id: 11, nome: 'Giuseppe', sobrenome: 'Bianchi', cpf: '14575673773', data_nascimento: null, telefone: '27997363811', senha: 'null' },
  { id: 12, nome: 'teste', sobrenome: 'teste', cpf: '11122233344', data_nascimento: '03-06-2026', telefone: '(11) 1611-11561', senha: '0000' },
  { id: 13, nome: 'teste', sobrenome: 'teste', cpf: '99999999999', data_nascimento: '2026-06-18', telefone: '999999999999', senha: '0000' }
];

const receitas = [
  { id: 26, nome_comercial: 'Paracetamol', principio_ativo: 'Acetaminofen', indicacao: 'Dor e febre', medico_id: 99999, paciente_id: 8, data_prescricao: '15-05-2026', data_validade: '29-05-2026', posologia: '1 comprimido a cada 8 horas', nomeMedico: 'Demo Silva' },
  { id: 27, nome_comercial: 'Ibuprofeno', principio_ativo: 'Brufen', indicacao: 'Inflamação', medico_id: 99999, paciente_id: 8, data_prescricao: '10-05-2026', data_validade: '28-05-2026', posologia: '1 comprimido a cada 12 horas', nomeMedico: 'Demo Silva' },
  { id: 28, nome_comercial: 'Paracetamol', principio_ativo: 'Acetaminofen', indicacao: 'Dor e febre', medico_id: 99999, paciente_id: 8, data_prescricao: '15-05-2026', data_validade: '29-05-2026', posologia: '1 comprimido a cada 8 horas', nomeMedico: 'Demo Silva' },
  { id: 29, nome_comercial: 'Ibuprofeno', principio_ativo: 'Brufen', indicacao: 'Inflamação', medico_id: 99999, paciente_id: 8, data_prescricao: '10-05-2026', data_validade: '28-05-2026', posologia: '1 comprimido a cada 12 horas', nomeMedico: 'Demo Silva' },
  { id: 30, nome_comercial: 'Paracetamol Expired', principio_ativo: 'Acetaminofen', indicacao: 'Dor e febre', medico_id: 99999, paciente_id: 8, data_prescricao: '15-05-2026', data_validade: '28-05-2026', posologia: '1 comprimido a cada 8 horas', nomeMedico: 'Demo Silva' },
  { id: 31, nome_comercial: 'Ibuprofeno Expired', principio_ativo: 'Brufen', indicacao: 'Inflamação', medico_id: 99999, paciente_id: 8, data_prescricao: '10-05-2026', data_validade: '29-05-2026', posologia: '1 comprimido a cada 12 horas', nomeMedico: 'Demo Silva' },
  { id: 32, nome_comercial: 'Aulin', principio_ativo: 'Lansoprazolo', indicacao: 'Gastrite e reflusso', medico_id: 99999, paciente_id: 11, data_prescricao: '01-05-2026', data_validade: '10-05-2026', posologia: '1 compressa al mattino', nomeMedico: 'Dr. Demo Silva' },
  { id: 33, nome_comercial: 'Augmentin', principio_ativo: 'Amoxicillina', indicacao: 'Infezioni batteriche', medico_id: 99999, paciente_id: 11, data_prescricao: '01-05-2026', data_validade: '15-05-2026', posologia: '1 compressa ogni 12 ore', nomeMedico: 'Dr. Demo Silva' },
  { id: 34, nome_comercial: 'Tachipirina', principio_ativo: 'Paracetamolo', indicacao: 'Dolore e febbre', medico_id: 99999, paciente_id: 10, data_prescricao: '01-04-2026', data_validade: '05-05-2026', posologia: '1 compressa ogni 8 ore', nomeMedico: 'Dr. Demo Silva' },
  { id: 35, nome_comercial: 'Augmentin', principio_ativo: 'Amoxicillina', indicacao: 'Infezioni batteriche', medico_id: 99999, paciente_id: 10, data_prescricao: '01-04-2026', data_validade: '09-05-2026', posologia: '1 compressa ogni 12 ore', nomeMedico: 'Dr. Demo Silva' },
  { id: 36, nome_comercial: 'Ciproxin', principio_ativo: 'Ciprofloxacina', indicacao: 'Infezioni urinarie', medico_id: 99999, paciente_id: 10, data_prescricao: '01-04-2026', data_validade: '10-05-2026', posologia: '1 compressa al giorno', nomeMedico: 'Dr. Demo Silva' },
  { id: 39, nome_comercial: 'NiQuitin', principio_ativo: 'Nicotina', indicacao: 'Aiuto per smettere di fumare', medico_id: 99999, paciente_id: 9, data_prescricao: '01-04-2026', data_validade: '07-05-2026', posologia: '1 compressa al giorno', nomeMedico: 'Dr. Demo Silva' },
  { id: 40, nome_comercial: 'Aulin', principio_ativo: 'Lansoprazolo', indicacao: 'Gastrite e reflusso', medico_id: 99999, paciente_id: 9, data_prescricao: '01-04-2026', data_validade: '08-05-2026', posologia: '1 compressa al mattino', nomeMedico: 'Dr. Demo Silva' },
  { id: 41, nome_comercial: 'Moment', principio_ativo: 'Lattosio', indicacao: 'Digestivo', medico_id: 99999, paciente_id: 8, data_prescricao: '01-04-2026', data_validade: '06-05-2026', posologia: '1 compressa dopo pasti', nomeMedico: 'Dr. Demo Silva' },
  { id: 42, nome_comercial: 'Tachipirina', principio_ativo: 'Paracetamolo', indicacao: 'Dolore e febbre', medico_id: 99999, paciente_id: 8, data_prescricao: '01-05-2026', data_validade: '15-06-2026', posologia: '1 compressa ogni 8 ore', nomeMedico: 'Dr. Demo Silva' },
  { id: 43, nome_comercial: 'Augmentin', principio_ativo: 'Amoxicillina', indicacao: 'Infezioni batteriche', medico_id: 99999, paciente_id: 9, data_prescricao: '01-05-2026', data_validade: '05-07-2026', posologia: '1 compressa ogni 12 ore', nomeMedico: 'Dr. Demo Silva' },
  { id: 44, nome_comercial: 'NiQuitin', principio_ativo: 'Nicotina', indicacao: 'Aiuto per smettere di fumare', medico_id: 99999, paciente_id: 8, data_prescricao: '01-05-2026', data_validade: '25-06-2026', posologia: '1 compressa al giorno', nomeMedico: 'Dr. Demo Silva' },
  { id: 45, nome_comercial: 'Aulin', principio_ativo: 'Lansoprazolo', indicacao: 'Gastrite e reflusso', medico_id: 99999, paciente_id: 9, data_prescricao: '01-05-2026', data_validade: '30-06-2026', posologia: '1 compressa al mattino', nomeMedico: 'Dr. Demo Silva' },
  { id: 46, nome_comercial: 'Litalong', principio_ativo: 'Litalong', indicacao: 'Dolore artroso', medico_id: 99999, paciente_id: 10, data_prescricao: '01-05-2026', data_validade: '20-07-2026', posologia: '1 compressa al pomeriggio', nomeMedico: 'Dr. Demo Silva' },
  { id: 47, nome_comercial: 'Polase', principio_ativo: 'Ferro', indicacao: 'Anemia', medico_id: 99999, paciente_id: 10, data_prescricao: '01-05-2026', data_validade: '25-07-2026', posologia: '1 compressa al giorno', nomeMedico: 'Dr. Demo Silva' },
  { id: 48, nome_comercial: 'Rifampicina', principio_ativo: 'Rifampicina', indicacao: 'Tubercolosi', medico_id: 99999, paciente_id: 10, data_prescricao: '01-05-2026', data_validade: '15-07-2026', posologia: '1 compressa al mattino', nomeMedico: 'Dr. Demo Silva' },
  { id: 49, nome_comercial: 'Tachipirina', principio_ativo: 'Paracetamolo', indicacao: 'Dolore e febbre', medico_id: 99999, paciente_id: 11, data_prescricao: '01-05-2026', data_validade: '15-06-2026', posologia: '1 compressa ogni 8 ore', nomeMedico: 'Dr. Demo Silva' },
  { id: 52, nome_comercial: 'Moment', principio_ativo: 'Lattosio', indicacao: 'Digestivo', medico_id: 99999, paciente_id: 8, data_prescricao: '01-05-2026', data_validade: '20-06-2026', posologia: '1 compressa dopo pasti', nomeMedico: 'Dr. Demo Silva' },
  { id: 53, nome_comercial: 'Ciproxin', principio_ativo: 'Ciprofloxacina', indicacao: 'Infezioni urinarie', medico_id: 99999, paciente_id: 9, data_prescricao: '01-05-2026', data_validade: '10-07-2026', posologia: '1 compressa al giorno', nomeMedico: 'Dr. Demo Silva' },
  { id: 54, nome_comercial: 'Polase', principio_ativo: 'Ferro', indicacao: 'Anemia', medico_id: 99999, paciente_id: 11, data_prescricao: '01-05-2026', data_validade: '30-06-2026', posologia: '1 compressa al giorno', nomeMedico: 'Dr. Demo Silva' },
  { id: 55, nome_comercial: 'Linctus', principio_ativo: 'Derivato codeina', indicacao: 'Tosse secca', medico_id: 99999, paciente_id: 11, data_prescricao: '01-05-2026', data_validade: '30-07-2026', posologia: '1 compressa al bisogno', nomeMedico: 'Dr. Demo Silva' }
];

const conexoes = [
  { medico_id: 99999, paciente_id: 8 },
  { medico_id: 99999, paciente_id: 9 },
  { medico_id: 99999, paciente_id: 10 }
];

module.exports = {
  medicos,
  pacientes,
  receitas,
  conexoes
};