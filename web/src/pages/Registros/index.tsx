import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, Button, Input, ListGroup, ListGroupItem, Spinner, Alert } from 'reactstrap';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../../services/api';
import Dashboard from '../Dashboard'; // Usaremos o Dashboard como cabeçalho

interface Registro {
  id: string;
  registro: string;
  criado_em: string;
  data_alteracao: string[];
}

function RegistrosPage() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [registroSelecionado, setRegistroSelecionado] = useState<Registro | null>(null);
  const [texto, setTexto] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  };

  useEffect(() => {
    fetchRegistros();
  }, []);

  const fetchRegistros = async () => {
    setCarregando(true);
    try {
      const response = await api.get('/registros', config);
      setRegistros(response.data);
    } catch (err) {
      setErro('Falha ao carregar registros.');
    } finally {
      setCarregando(false);
    }
  };

  const handleSalvar = async () => {
    if (!texto.trim()) return;
    setSalvando(true);
    try {
      if (registroSelecionado) {
        // Atualizar
        await api.put(`/registros/${registroSelecionado.id}`, { registro: texto }, config);
      } else {
        // Criar novo
        await api.post('/registros', { registro: texto }, config);
      }
      setTexto('');
      setRegistroSelecionado(null);
      fetchRegistros(); // Atualiza a lista
    } catch (err) {
      setErro('Erro ao salvar o registro.');
    } finally {
      setSalvando(false);
    }
  };

  const selecionarRegistro = (reg: Registro) => {
    setRegistroSelecionado(reg);
    setTexto(reg.registro);
  };

  const novoRegistro = () => {
    setRegistroSelecionado(null);
    setTexto('');
  };

  return (
    <>
      <Dashboard />
      <Container fluid className="px-md-5">
        {erro && <Alert color="danger">{erro}</Alert>}
        <Row>
          {/* Lado Esquerdo - Lista */}
          <Col md={4} className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Meus Sonhos</h5>
              <Button color="primary" size="sm" onClick={novoRegistro}>+ Novo</Button>
            </div>
            
            {carregando ? (
              <div className="text-center py-5"><Spinner color="primary" /></div>
            ) : (
              <ListGroup className="shadow-sm border-0">
                {registros.map(reg => (
                  <ListGroupItem 
                    key={reg.id} 
                    action 
                    active={registroSelecionado?.id === reg.id}
                    onClick={() => selecionarRegistro(reg)}
                    className="border-start-0 border-end-0 py-3"
                  >
                    <div className="d-flex w-100 justify-content-between">
                      <small className={registroSelecionado?.id === reg.id ? 'text-white' : 'text-muted'}>
                        {format(new Date(reg.criado_em), "dd 'de' MMM", { locale: ptBR })}
                      </small>
                    </div>
                    <p className="mb-1 text-truncate font-weight-bold" style={{ maxWidth: '100%' }}>
                      {reg.registro}
                    </p>
                  </ListGroupItem>
                ))}
              </ListGroup>
            )}
          </Col>

          {/* Lado Direito - Editor */}
          <Col md={8}>
            <Card className="shadow-sm border-0" style={{ minHeight: '400px' }}>
              <CardBody className="d-flex flex-column">
                <div className="mb-3">
                  <h6>{registroSelecionado ? 'Editando Registro' : 'Registre seu estado mental ao redor do sonho'}</h6>
                  {registroSelecionado && (
                    <small className="text-muted">
                      Criado em: {format(new Date(registroSelecionado.criado_em), "Pp", { locale: ptBR })}
                    </small>
                  )}
                </div>
                
                <Input
                  type="textarea"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder="Descreva aqui seu sonho ou pensamento..."
                  className="flex-grow-1 mb-3 border-0 bg-light p-3"
                  style={{ resize: 'none', fontSize: '1.1rem' }}
                />
                
                <div className="text-end">
                  {registroSelecionado && (
                    <Button color="link" className="text-muted me-3" onClick={novoRegistro}>Cancelar</Button>
                  )}
                  <Button 
                    color="primary" 
                    size="lg" 
                    disabled={salvando || !texto.trim()} 
                    onClick={handleSalvar}
                    className="px-5"
                  >
                    {salvando ? <Spinner size="sm" /> : 'Salvar Registro'}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default RegistrosPage;