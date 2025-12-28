import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Container, Row, Col, Card, CardBody, 
  Form, FormGroup, Label, Input, Button, 
  Alert, Spinner 
} from 'reactstrap';
import api from '../../services/api';
import '../../styles/Auth.css'; // Importa o CSS

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: '', cor: '' });
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setMensagem({ texto: '', cor: '' });

    try {
      const response = await api.post('/usuarios/login', { email, senha });
      const { token, usuario } = response.data;
      
      // Armazena os dados no localStorage para manter a sessão
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));

      // Redireciona para o dashboard
      navigate('/dashboard'); 
    } catch (err: any) {
      setMensagem({ 
        texto: err.response?.data?.error || 'Erro ao fazer login.', 
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
              <div className="logo-container">
                {/* Adicione sua logo na pasta /public e referencie aqui */}
                <img src="/logo.png" alt="Logo Sonhário" />
              </div>
              <Card className="auth-card shadow">
                <CardBody className="p-4 p-md-5">
                  <h4 className="text-center mb-4">Seja Bem-Vindo!</h4>
                  {mensagem.texto && <Alert color={mensagem.cor} className="mt-3">{mensagem.texto}</Alert>}
                  <Form onSubmit={handleLogin}>
                    <FormGroup>
                      <Label for="email">E-mail</Label>
                      <Input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </FormGroup>
                    <FormGroup>
                      <Label for="senha">Senha</Label>
                      <Input type="password" id="senha" value={senha} onChange={e => setSenha(e.target.value)} required />
                    </FormGroup>
                    <Button color="dark" block disabled={carregando} className="mt-4">
                      {carregando ? <Spinner size="sm" /> : 'Entrar'}
                    </Button>
                  </Form>
                  <div className="text-center mt-4">
                    <Link to="/cadastro">Não tem uma conta? Cadastre-se</Link>
                  </div>
                </CardBody>
              </Card>
          </Row>
        </Container>
      </div>
      <div className="auth-footer">
        <p>&copy; 2025 Sonhário. Feito com ❤️.</p>
      </div>
    </div>
  );
}

export default Login;
