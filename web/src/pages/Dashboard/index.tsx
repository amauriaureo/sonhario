import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Alert, Spinner } from 'reactstrap';
import api from '../../services/api';

interface Usuario {
  nome: string;
}

interface Resumo {
  total: number;
  ultimaAtividade: string | null;
}

function Dashboard() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [resumo, setResumo] = useState<Resumo>({ total: 0, ultimaAtividade: null });
  const [modalSenhaAberto, setModalSenhaAberto] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [alterando, setAlterando] = useState(false);
  const [mensagem, setMensagem] = useState<{ texto: string; cor: string }>({ texto: '', cor: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('usuario');
    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
      fetchResumo();
    } else {
      navigate('/');
    }
  }, [navigate]);

  const fetchResumo = async () => {
    try {
      const response = await api.get('/registros', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const registros = response.data;
      setResumo({
        total: registros.length,
        ultimaAtividade: registros.length > 0 ? registros[0].criado_em : null
      });
    } catch (err) {
      console.error("Erro ao buscar resumo:", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const toggleModal = () => {
    setMensagem({ texto: '', cor: '' });
    setModalSenhaAberto(!modalSenhaAberto);
    if (!modalSenhaAberto) {
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
    }
  };

  const handleAlterarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) {
      setMensagem({ texto: 'Nova senha e confirmação não conferem.', cor: 'danger' });
      return;
    }
    setAlterando(true);
    setMensagem({ texto: '', cor: '' });
    try {
      await api.post('/usuarios/alterar-senha', { senhaAtual, novaSenha }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMensagem({ texto: 'Senha alterada com sucesso.', cor: 'success' });
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
    } catch (err: any) {
      setMensagem({
        texto: err.response?.data?.error || 'Erro ao alterar a senha.',
        cor: 'danger'
      });
    } finally {
      setAlterando(false);
    }
  };

  if (!usuario) return null;

  return (
    <div className="bg-dark text-white py-3 mb-4 shadow">
      <Container fluid>
        <Row className="align-items-center">
          <Col md={4}>
            <h4 className="mb-0">Olá, <strong>{usuario.nome}</strong></h4>
          </Col>
          <Col md={5} className="text-center d-flex justify-content-around">
            <div>
              <small className="d-block text-muted text-uppercase">Total de Registros</small>
              <span className="h5">{resumo.total}</span>
            </div>
            {resumo.ultimaAtividade && (
              <div>
                <small className="d-block text-muted text-uppercase">Última Atividade</small>
                <span className="h6">{new Date(resumo.ultimaAtividade).toLocaleDateString()}</span>
              </div>
            )}
          </Col>
          <Col md={3} className="text-end">
            <Button color="outline-light" size="sm" className="me-2" onClick={toggleModal}>Alterar senha</Button>
            <Button color="outline-light" size="sm" onClick={handleLogout}>Sair</Button>
          </Col>
        </Row>
      </Container>

      <Modal isOpen={modalSenhaAberto} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>Alterar senha</ModalHeader>
        <Form onSubmit={handleAlterarSenha}>
          <ModalBody>
            {mensagem.texto && <Alert color={mensagem.cor}>{mensagem.texto}</Alert>}
            <FormGroup>
              <Label for="senhaAtual">Senha atual</Label>
              <Input
                id="senhaAtual"
                type="password"
                value={senhaAtual}
                onChange={e => setSenhaAtual(e.target.value)}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label for="novaSenha">Nova senha</Label>
              <Input
                id="novaSenha"
                type="password"
                value={novaSenha}
                onChange={e => setNovaSenha(e.target.value)}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label for="confirmarSenha">Confirmar nova senha</Label>
              <Input
                id="confirmarSenha"
                type="password"
                value={confirmarSenha}
                onChange={e => setConfirmarSenha(e.target.value)}
                required
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={toggleModal} disabled={alterando}>Cancelar</Button>
            <Button color="primary" type="submit" disabled={alterando}>
              {alterando ? <Spinner size="sm" /> : 'Salvar'}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
}

export default Dashboard;