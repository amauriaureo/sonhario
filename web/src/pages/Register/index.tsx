import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Container, Row, Col, Card, CardBody, 
  Form, FormGroup, Label, Input, Button, 
  Alert, Spinner 
} from 'reactstrap';
import api from '../../services/api';
import '../../styles/Auth.css'; // Importa o CSS
import logo from '../../assets/logo-sonhario.jpeg';
function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: '', cor: '' });
  const navigate = useNavigate();

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setMensagem({ texto: '', cor: '' });

    try {
      await api.post('/usuarios/registrar', { nome, email, senha });
      setMensagem({ texto: 'Usuário cadastrado com sucesso! Redirecionando para o login...', cor: 'success' });
      
      // Aguarda um pouco e redireciona para a página de login
      setTimeout(() => navigate('/'), 2000);

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
    <div className="auth-container">
      <div className="auth-wrapper">
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={8} lg={6}>
              <div className="logo-container">
                <img src={logo} alt="Logo Sonhário" />
              </div>
              <Card className="auth-card shadow">
                <CardBody className="p-4 p-md-5">
                  <h4 className="text-center mb-4">Crie sua Conta</h4>
                  {mensagem.texto && <Alert color={mensagem.cor} className="mt-3">{mensagem.texto}</Alert>}
                  <Form onSubmit={handleCadastro}>
                    <FormGroup>
                      <Label for="nome">Nome Completo</Label>
                      <Input type="text" id="nome" value={nome} onChange={e => setNome(e.target.value)} required />
                    </FormGroup>
                    <FormGroup>
                      <Label for="email">E-mail</Label>
                      <Input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </FormGroup>
                    <FormGroup>
                      <Label for="senha">Senha</Label>
                      <Input type="password" id="senha" value={senha} onChange={e => setSenha(e.target.value)} required />
                    </FormGroup>
                    <Button color="dark" block disabled={carregando} className="mt-4">
                      {carregando ? <Spinner size="sm" /> : 'Cadastrar'}
                    </Button>
                  </Form>
                  <div className="text-center mt-4">
                    <Link to="/">Já tem uma conta? Faça o login</Link>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
      <div className="auth-footer">
        <p>&copy; 2025 Sonhário. Feito com ❤️.</p>
      </div>
    </div>
  );
}

export default Register;
