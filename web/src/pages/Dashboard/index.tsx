import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Alert, Spinner, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import api from '../../services/api';
import { FiPlus, FiChevronDown } from 'react-icons/fi';

interface Usuario {
  nome: string;
}

function Dashboard({ abrirNovoRegistro }: { abrirNovoRegistro: () => void }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [modalSenhaAberto, setModalSenhaAberto] = useState(false);
  const [novoMenuAberto, setNovoMenuAberto] = useState(false);
  const [perfilAberto, setPerfilAberto] = useState(false);
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
    } else {
      navigate('/');
    }
  }, [navigate]);


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

  const togglePerfil = () => setPerfilAberto((prev) => !prev);
  const toggleNovoMenu = () => setNovoMenuAberto((prev) => !prev);

  const getIniciais = (nome: string) => {
    const partes = nome.trim().split(/\s+/).filter(Boolean);
    const a = partes[0]?.[0] ?? '';
    const b = partes.length > 1 ? partes[partes.length - 1]?.[0] ?? '' : '';
    return `${a}${b}`.toUpperCase();
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
    <div className="py-1 outsiderBrasil mb-4 shadow-sm">
      <Container fluid>
        <Row className="align-items-center">
          <Col md={4}>
            <h4 className="mb-0 font-weight-bold">Olá, {usuario.nome}</h4>
          </Col>
          <Col md={5} className="text-center">
            <span className="font-italic" style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              "o sonho é um fenômeno contínuo entre vigília, sono e emoção"
            </span>
          </Col>
          <Col md={3} className="text-end">
            {/* <Button color="dark" size="sm" className="me-2" disabled style={{ opacity: 0.8 }}>
              {resumo.ultimaAtividade ? new Date(resumo.ultimaAtividade).toLocaleDateString() : 'Sem atividade'}
            </Button> */}
            <div className="d-inline-flex align-items-center gap-2">
              {/* Novo (ação principal) + dropdown acoplado */}
              <div className="btn-group me-1" role="group" aria-label="Novo">
                <Button color="dark" size="sm" onClick={abrirNovoRegistro}>
                  <FiPlus className="me-2" />
                  Novo
                </Button>
                <Dropdown
                  isOpen={novoMenuAberto}
                  toggle={toggleNovoMenu}
                  direction="down"
                  className="btn-group"
                  role="group"
                >
                  <DropdownToggle
                    className="btn btn-dark btn-sm"
                    style={{
                      fontSize: '12px',
                      padding: '4px',
                      borderLeft: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '2px',
                      border: 'none',
                    }}
                    aria-label="Opções do Novo"
                    title="Opções"
                  >
                    <FiChevronDown />
                  </DropdownToggle>
                  <DropdownMenu
                    end
                    modifiers={
                      ([
                        {
                          name: 'preventOverflow',
                          options: { boundary: 'viewport', padding: 8, altAxis: true },
                        },
                        { name: 'flip', options: { boundary: 'viewport', padding: 8 } },
                      ] as any)
                    }
                  >
                    <DropdownItem
                      title="Em breve"
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                      style={{
                        opacity: 0.6,
                        cursor: 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      IA
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>

              {/* Dropdown estilo ProfileDropdown (avatar + nome) */}
              <Dropdown
                isOpen={perfilAberto}
                toggle={togglePerfil}
                direction="down"
                className="d-inline-block"
              >
                <DropdownToggle
                  caret={false}
                  tag="button"
                  type="button"
                  className="btn p-0"
                  title="Perfil"
                  aria-label="Perfil"
                  style={{ background: 'transparent', border: 'none' }}
                >
                  <span className="d-flex align-items-center">
                    <span
                      className="rounded-circle d-inline-flex align-items-center justify-content-center"
                      style={{
                        width: 30,
                        height: 30,
                        backgroundColor: 'var(--marrom-escuro)',
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {getIniciais(usuario.nome)}
                    </span>
                    <span
                      className="d-none d-md-inline-block ms-2 fw-medium"
                      style={{ color: 'var(--marrom-escuro)' }}
                    >
                      {usuario.nome}
                    </span>
                  </span>
                </DropdownToggle>
                <DropdownMenu
                  end
                  modifiers={
                    ([
                      {
                        name: 'preventOverflow',
                        options: { boundary: 'viewport', padding: 8, altAxis: true },
                      },
                      { name: 'flip', options: { boundary: 'viewport', padding: 8 } },
                    ] as any)
                  }
                >
                  <DropdownItem
                    onClick={() => {
                      setPerfilAberto(false);
                      toggleModal();
                    }}
                  >
                    Alterar senha
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => {
                      setPerfilAberto(false);
                      handleLogout();
                    }}
                  >
                    Sair
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
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