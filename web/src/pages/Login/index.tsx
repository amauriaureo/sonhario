import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Container, Row, Col, Card, CardBody, 
  Form, FormGroup, Label, Input, Button, 
  Alert, Spinner 
} from 'reactstrap';
import api from '../../services/api';

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
      // A rota de login ainda será implementada no backend
      // const response = await api.post('/login', { email, senha });
      console.log('Login attempt with:', { email, senha });
      setMensagem({ texto: 'Login realizado com sucesso! (Funcionalidade em desenvolvimento)', cor: 'success' });
      
      // Exemplo de como redirecionar após o login
      // navigate('/dashboard'); 

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
    <Container className="py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Row className="justify-content-center w-100">
        <Col md={5}>
          <Card className="shadow">
            <CardBody>
              <h2 className="text-center mb-4 text-primary">Login no Sonhário</h2>
              {mensagem.texto && <Alert color={mensagem.cor}>{mensagem.texto}</Alert>}
              
              <Form onSubmit={handleLogin}>
                <FormGroup>
                  <Label>E-mail</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </FormGroup>
                <FormGroup>
                  <Label>Senha</Label>
                  <Input type="password" value={senha} onChange={e => setSenha(e.target.value)} required />
                </FormGroup>
                <Button color="primary" block disabled={carregando}>
                  {carregando ? <Spinner size="sm" /> : 'Entrar'}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <p>Não tem uma conta? <Link to="/cadastro">Cadastre-se</Link></p>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;

