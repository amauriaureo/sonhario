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
function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [recuperando, setRecuperando] = useState(false);
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

  const handleEsqueciSenha = async () => {
    if (!email) {
      setMensagem({ texto: 'Informe seu e-mail para recuperar a senha.', cor: 'warning' });
      return;
    }
    setRecuperando(true);
    setMensagem({ texto: '', cor: '' });
    try {
      const response = await api.post('/usuarios/esqueci-senha', { email });
      setMensagem({ texto: response.data?.message || 'Nova senha enviada para seu e-mail.', cor: 'success' });
    } catch (err: any) {
      setMensagem({ 
        texto: err.response?.data?.error || 'Erro ao processar recuperação de senha.', 
        cor: 'danger' 
      });
    } finally {
      setRecuperando(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={8} lg={6}>
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
                      <div className="text-center mt-1">
                        <Button 
                          color="link" 
                          size="sm" 
                          className="p-0" 
                          disabled={recuperando}
                          onClick={handleEsqueciSenha}
                        >
                          {recuperando ? 'Enviando...' : 'Esqueci minha senha'}
                        </Button>
                      </div>
                    </FormGroup>
                    <Button color="dark" block disabled={carregando || recuperando} className="mt-4">
                      {carregando ? <Spinner size="sm" /> : 'Entrar'}
                    </Button>
                  </Form>
                  <div className="text-center mt-4">
                    <Link to="/cadastro">Não tem uma conta? Cadastre-se</Link>
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

export default Login;
