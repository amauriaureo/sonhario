import { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, CardBody, 
  Form, FormGroup, Label, Input, Button, 
  Table, Alert, Spinner 
} from 'reactstrap';
import { Link } from 'react-router-dom';
import api from '../../services/api';

interface Usuario {
  id: string;
  nome: string;
  email: string;
}

function Register() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: '', cor: '' });

  // Função para buscar usuários da API
  const buscarUsuarios = async () => {
    try {
      const response = await api.get('/usuarios');
      setUsuarios(response.data);
    } catch (err) {
      console.error("Erro ao buscar:", err);
    }
  };

  useEffect(() => { buscarUsuarios(); }, []);

  // Função para cadastrar novo usuário
  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setMensagem({ texto: '', cor: '' });

    try {
      await api.post('/usuarios/registrar', { nome, email, senha });
      
      setMensagem({ texto: 'Usuário cadastrado com sucesso!', cor: 'success' });
      setNome(''); setEmail(''); setSenha('');
      buscarUsuarios(); // Atualiza a lista automaticamente
    } catch (err: any) {
      setMensagem({ 
        texto: err.response?.data?.error || 'Erro ao cadastrar usuário.', 
        cor: 'danger' 
      });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="mb-5 justify-content-center">
        <Col md={6}>
          <Card className="shadow">
            <CardBody>
              <h2 className="text-center mb-4 text-primary">Criar Conta no Sonhário</h2>
              {mensagem.texto && <Alert color={mensagem.cor}>{mensagem.texto}</Alert>}
              
              <Form onSubmit={handleCadastro}>
                <FormGroup>
                  <Label>Nome Completo</Label>
                  <Input type="text" value={nome} onChange={e => setNome(e.target.value)} required />
                </FormGroup>
                <FormGroup>
                  <Label>E-mail</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </FormGroup>
                <FormGroup>
                  <Label>Senha</Label>
                  <Input type="password" value={senha} onChange={e => setSenha(e.target.value)} required />
                </FormGroup>
                <Button color="primary" block disabled={carregando}>
                  {carregando ? <Spinner size="sm" /> : 'Cadastrar'}
                </Button>
              </Form>
              <div className="text-center mt-3">
                <Link to="/">Voltar para o Login</Link>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <h3 className="mb-3">Usuários Cadastrados</h3>
          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td>{u.nome}</td>
                  <td>{u.email}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
}

export default Register;

